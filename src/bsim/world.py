from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum, auto
from typing import Any, Callable, Dict, List, Optional

from .solver import Solver


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

    def on(self, listener: Listener) -> None:
        """Register a listener for world events."""
        self.listeners.append(listener)

    def off(self, listener: Listener) -> None:
        """Unregister a listener if present."""
        try:
            self.listeners.remove(listener)
        except ValueError:
            pass

    # Internal: emit to all listeners
    def _emit(self, event: BioWorldEvent, payload: Optional[Dict[str, Any]] = None) -> None:
        data = payload or {}
        for listener in list(self.listeners):
            try:
                listener(event, data)
            except Exception:
                # Listeners should not break the world; errors are swallowed.
                # If needed, we could route this through a dedicated event.
                continue

    def simulate(self, *, steps: int, dt: float) -> Any:
        """Run the simulation using the injected solver.

        Emits BEFORE_SIMULATION and AFTER_SIMULATION events around the solver
        call. Propagates solver-emitted events via the provided `emit` callback.
        """

        # Emit a LOADED event only the first time simulate is called, or always?
        # For simplicity, emit LOADED on each simulate call to signal readiness.
        self._emit(BioWorldEvent.LOADED, {"steps": steps, "dt": dt})
        self._emit(BioWorldEvent.BEFORE_SIMULATION, {"steps": steps, "dt": dt})

        def emit(event: BioWorldEvent, payload: Optional[Dict[str, Any]] = None) -> None:
            self._emit(event, payload)

        try:
            result = self.solver.simulate(steps=steps, dt=dt, emit=emit)
        except Exception as exc:  # pragma: no cover - minimal error path
            self._emit(BioWorldEvent.ERROR, {"error": exc})
            raise
        finally:
            self._emit(BioWorldEvent.AFTER_SIMULATION, {"steps": steps, "dt": dt})

        return result
