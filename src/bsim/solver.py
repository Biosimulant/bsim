from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, Callable, Dict


class Solver(ABC):
    """Abstract base class for solvers used by `BioWorld`.

    Implementations must override `simulate` with the exact keyword-only
    signature below. The `emit` callback should be used to publish events
    (e.g., STEP updates) during the simulation.
    """

    @abstractmethod
    def simulate(
        self,
        *,
        steps: int,
        dt: float,
        emit: Callable[["BioWorldEvent", Dict[str, Any]], None],
    ) -> Any:
        raise NotImplementedError


class FixedStepSolver(Solver):
    """A simple ready-made solver that increments time in fixed steps.

    Emits a STEP event each iteration and returns a final state dict.
    """

    def simulate(
        self,
        *,
        steps: int,
        dt: float,
        emit: Callable[["BioWorldEvent", Dict[str, Any]], None],
    ) -> Dict[str, Any]:
        # Local import to avoid a circular import at module load time.
        from .world import BioWorldEvent

        time = 0.0
        for i in range(steps):
            time += dt
            emit(BioWorldEvent.STEP, {"i": i, "t": time})
        return {"time": time, "steps": steps}
