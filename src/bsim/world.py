from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum, auto
from typing import Any, Callable, Dict, List, Optional, TYPE_CHECKING, Tuple
import logging
import threading

from .solver import Solver
from .visuals import normalize_visuals
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
    PAUSED = auto()


Listener = Callable[[BioWorldEvent, Dict[str, Any]], None]


class SimulationStop(Exception):
    """Internal cooperative stop signal for solvers/world loops."""
    pass


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
    _signal_routes: Dict[Tuple["BioModule", str], List[Tuple["BioModule", str]]] = field(
        default_factory=dict, init=False, repr=False
    )
    _loaded_emitted: bool = field(default=False, init=False, repr=False)
    _stop_requested: bool = field(default=False, init=False, repr=False)
    _run_event: threading.Event = field(default_factory=threading.Event, init=False, repr=False)

    def __post_init__(self) -> None:
        # Allow steps to run by default
        self._run_event.set()

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
        - None: module receives all events.
        - Empty set: module receives no world events (signals-only).
        - Non-empty set: module receives only those events.
        """
        if module in self._biomodule_listeners:
            return

        subs = module.subscriptions()
        subs_snapshot = None if subs is None else set(subs)

        def _module_listener(event: BioWorldEvent, payload: Dict[str, Any]) -> None:
            if subs_snapshot is not None and event not in subs_snapshot:
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
    def connect_biomodules(
        self,
        src: "BioModule",
        topic: str,
        dst: "BioModule",
        *,
        dst_topic: Optional[str] = None,
    ) -> None:
        """Connect a source module topic to a destination module.

        Messages published by `src` on `topic` will be delivered to `dst.on_signal`.
        If `dst_topic` is provided, the destination will receive the message under
        that topic name (allowing port renaming).
        """
        if dst_topic is None:
            dst_topic = topic
        key = (src, topic)
        lst = self._signal_routes.setdefault(key, [])
        route = (dst, dst_topic)
        if route not in lst:
            lst.append(route)

    def disconnect_biomodules(
        self,
        src: "BioModule",
        topic: str,
        dst: "BioModule",
        *,
        dst_topic: Optional[str] = None,
    ) -> None:
        if dst_topic is None:
            dst_topic = topic
        key = (src, topic)
        lst = self._signal_routes.get(key)
        if not lst:
            return
        try:
            lst.remove((dst, dst_topic))
        except ValueError:
            return
        if not lst:
            self._signal_routes.pop(key, None)

    def publish_biosignal(self, src: "BioModule", topic: str, payload: Dict[str, Any]) -> None:
        """Publish a module-originated message to connected modules only."""
        key = (src, topic)
        for dst, dst_topic in list(self._signal_routes.get(key, [])):
            try:
                dst.on_signal(dst_topic, payload, source=src, world=self)
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
            normed = normalize_visuals(visuals)  # filters invalid
            if not normed:
                continue
            out.append(
                {
                    "module": module.__class__.__name__,
                    "visuals": normed,
                }
            )
        return out

    # Optional: reset hook for modules before a new run
    def _reset_modules(self) -> None:
        for module in list(self._biomodule_listeners.keys()):
            try:
                reset_fn = getattr(module, "reset", None)
                if callable(reset_fn):
                    reset_fn()  # type: ignore[misc]
            except Exception:
                logger.exception("BioModule.reset raised for %s", module.__class__.__name__)

    # Internal: emit to all listeners
    def _emit(self, event: BioWorldEvent, payload: Optional[Dict[str, Any]] = None) -> None:
        # Cooperative controls:
        # - pause/resume is enforced at STEP boundaries
        # - stop is enforced at STEP boundaries (so AFTER_SIMULATION still emits)
        if event == BioWorldEvent.STEP:
            if self._stop_requested:
                raise SimulationStop()
            # Block here if paused until resume
            self._run_event.wait()
            if self._stop_requested:
                raise SimulationStop()

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

        # Reset cooperative flags for this run
        self._stop_requested = False
        self._run_event.set()

        # Give modules a chance to reset their internal state per run (if they implement reset()).
        self._reset_modules()

        # Emit LOADED only once to indicate readiness.
        if not self._loaded_emitted:
            self._emit(BioWorldEvent.LOADED, {"steps": steps, "dt": dt})
            self._loaded_emitted = True
        self._emit(BioWorldEvent.BEFORE_SIMULATION, {"steps": steps, "dt": dt})

        try:
            result = self.solver.simulate(steps=steps, dt=dt, emit=self._emit)
        except SimulationStop:
            # Graceful cooperative stop, no ERROR event
            result = None
        except Exception as exc:  # pragma: no cover - minimal error path
            self._emit(BioWorldEvent.ERROR, {"error": exc})
            raise
        finally:
            self._emit(BioWorldEvent.AFTER_SIMULATION, {"steps": steps, "dt": dt})

        return result

    # --- Cooperative controls ---
    def request_stop(self) -> None:
        # Wake up any paused loop and signal stop on next STEP
        self._stop_requested = True
        self._run_event.set()

    def request_pause(self) -> None:
        # Next STEP emit will block until resume
        self._run_event.clear()
        # Emit PAUSED event to listeners for UI/state tracking
        self._emit(BioWorldEvent.PAUSED, {})

    def request_resume(self) -> None:
        self._run_event.set()

    # --- Convenience wiring loader ---
    def load_wiring(self, path: str) -> None:
        """Load wiring from a YAML/TOML file and apply it to this world.

        Delegates to the wiring loader in `bsim.wiring`. See `load_wiring` for
        supported formats and requirements (e.g., `pyyaml` for YAML).
        """
        from .wiring import load_wiring as _load_wiring

        _load_wiring(self, path)

    def describe_wiring(self) -> List[Tuple[str, str, str, str]]:
        """Return a simple description of current biosignal connections.

        Each tuple is (source_module, source_topic, dest_module, dest_topic) using class names.
        """
        desc: List[Tuple[str, str, str, str]] = []
        for (src, topic), dsts in self._signal_routes.items():
            for dst, dst_topic in dsts:
                desc.append((src.__class__.__name__, topic, dst.__class__.__name__, dst_topic))
        return desc
