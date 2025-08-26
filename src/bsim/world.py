from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum, auto
from typing import Any, Callable, Dict, List, Optional, TYPE_CHECKING, Tuple
import logging

from .solver import Solver
logger = logging.getLogger(__name__)
if TYPE_CHECKING:  # pragma: no cover - typing only
    from .modules import BioModule
    from .visuals import VisualSpec


class BioWorldEvent(Enum):
    """Lifecycle and runtime events emitted by the BioWorld/solver."""

    LOADED = auto()
    BEFORE_SIMULATION = auto()
    STEP = auto()
    AFTER_SIMULATION = auto()
    ERROR = auto()


Listener = Callable[[BioWorldEvent, Dict[str, Any]], None]


@dataclass
class BioWorld:
    """The biological simulation world.

    - Accepts a `solver` via dependency injection (must subclass `Solver`).
    - Exposes `simulate(steps, dt)` which delegates to the solver.
    - Allows listeners to subscribe to `BioWorldEvent`s.
    """

    solver: Solver
    listeners: List[Listener] = field(default_factory=list)
    _biomodule_listeners: Dict["BioModule", Listener] = field(default_factory=dict, init=False, repr=False)
    _signal_routes: Dict[Tuple["BioModule", str], List["BioModule"]] = field(
        default_factory=dict, init=False, repr=False
    )
    _loaded_emitted: bool = field(default=False, init=False, repr=False)

    def on(self, listener: Listener) -> None:
        """Register a listener for world events."""
        self.listeners.append(listener)

    def off(self, listener: Listener) -> None:
        """Unregister a listener if present."""
        try:
            self.listeners.remove(listener)
        except ValueError:
            pass

    def add_biomodule(self, module: "BioModule") -> None:
        """Attach a BioModule and auto-subscribe it to events.

        Modules can declare selective subscriptions via `module.subscriptions()`.
        If empty, the module receives all events.
        """
        if module in self._biomodule_listeners:
            return

        subs = set(module.subscriptions())  # snapshot

        def _module_listener(event: BioWorldEvent, payload: Dict[str, Any]) -> None:
            if subs and event not in subs:
                return
            try:
                module.on_event(event, payload, self)
            except Exception:
                # Modules should not break the world loop. Log and continue.
                logger.exception("BioModule.on_event raised during %s", event)
                return

        self._biomodule_listeners[module] = _module_listener
        self.on(_module_listener)

    def remove_biomodule(self, module: "BioModule") -> None:
        """Detach a previously added BioModule."""
        listener = self._biomodule_listeners.pop(module, None)
        if listener is not None:
            self.off(listener)

    # --- Directed module-to-module signals (biosignals) ---
    def connect_biomodules(self, src: "BioModule", topic: str, dst: "BioModule") -> None:
        """Connect a source module topic to a destination module.

        Messages published by `src` on `topic` will be delivered to `dst.on_signal`.
        """
        key = (src, topic)
        lst = self._signal_routes.setdefault(key, [])
        if dst not in lst:
            lst.append(dst)

    def disconnect_biomodules(self, src: "BioModule", topic: str, dst: "BioModule") -> None:
        key = (src, topic)
        lst = self._signal_routes.get(key)
        if not lst:
            return
        try:
            lst.remove(dst)
        except ValueError:
            return
        if not lst:
            self._signal_routes.pop(key, None)

    def publish_biosignal(self, src: "BioModule", topic: str, payload: Dict[str, Any]) -> None:
        """Publish a module-originated message to connected modules only."""
        key = (src, topic)
        for dst in list(self._signal_routes.get(key, [])):
            try:
                dst.on_signal(topic, payload, source=src, world=self)
            except Exception:
                # Keep delivery robust; log and continue.
                logger.exception("BioModule.on_signal raised for topic '%s'", topic)
                continue

    def collect_visuals(self) -> List[Dict[str, Any]]:
        """Collect visual specs from all attached modules.

        Returns a list of objects with module metadata and visuals, where each
        visuals entry is a dict of shape: {"render": <type>, "data": <payload>}.
        Modules that do not provide visuals are skipped.
        """
        out: List[Dict[str, Any]] = []
        for module in list(self._biomodule_listeners.keys()):
            try:
                visuals = module.visualize()  # type: ignore[attr-defined]
            except Exception:
                logger.exception("BioModule.visualize raised for %s", module.__class__.__name__)
                continue
            if not visuals:
                continue
            if isinstance(visuals, list):
                vis_list = visuals
            else:
                vis_list = [visuals]
            # Basic shape check (render + data keys)
            normed: List[Dict[str, Any]] = []
            for v in vis_list:
                if not isinstance(v, dict):
                    continue
                if "render" not in v or "data" not in v:
                    continue
                normed.append({"render": v["render"], "data": v["data"]})
            if not normed:
                continue
            out.append(
                {
                    "module": module.__class__.__name__,
                    "visuals": normed,
                }
            )
        return out

    # Internal: emit to all listeners
    def _emit(self, event: BioWorldEvent, payload: Optional[Dict[str, Any]] = None) -> None:
        data = payload or {}
        for listener in list(self.listeners):
            try:
                listener(event, data)
            except Exception:
                # Listeners should not break the world; log and continue.
                logger.exception("world listener raised during %s", event)
                continue

    def simulate(self, *, steps: int, dt: float) -> Any:
        """Run the simulation using the injected solver.

        Emits BEFORE_SIMULATION and AFTER_SIMULATION events around the solver
        call. Propagates solver-emitted events via the provided `emit` callback.
        """

        # Emit LOADED only once to indicate readiness.
        if not self._loaded_emitted:
            self._emit(BioWorldEvent.LOADED, {"steps": steps, "dt": dt})
            self._loaded_emitted = True
        self._emit(BioWorldEvent.BEFORE_SIMULATION, {"steps": steps, "dt": dt})

        try:
            result = self.solver.simulate(steps=steps, dt=dt, emit=self._emit)
        except Exception as exc:  # pragma: no cover - minimal error path
            self._emit(BioWorldEvent.ERROR, {"error": exc})
            raise
        finally:
            self._emit(BioWorldEvent.AFTER_SIMULATION, {"steps": steps, "dt": dt})

        return result

    # --- Convenience wiring loader ---
    def load_wiring(self, path: str) -> None:
        """Load wiring from a YAML/TOML file and apply it to this world.

        Delegates to the wiring loader in `bsim.wiring`. See `load_wiring` for
        supported formats and requirements (e.g., `pyyaml` for YAML).
        """
        from .wiring import load_wiring as _load_wiring

        _load_wiring(self, path)

    def describe_wiring(self) -> List[Tuple[str, str, str]]:
        """Return a simple description of current biosignal connections.

        Each tuple is (source_module, topic, dest_module) using class names.
        """
        desc: List[Tuple[str, str, str]] = []
        for (src, topic), dsts in self._signal_routes.items():
            for dst in dsts:
                desc.append((src.__class__.__name__, topic, dst.__class__.__name__))
        return desc
