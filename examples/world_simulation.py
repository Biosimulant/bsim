"""
Demonstrates dependency injection of a solver into BioWorld and event handling.

Run with:
    pip install -e .
    python examples/world_simulation.py

Or without installing:
    PYTHONPATH=src python examples/world_simulation.py
"""

from __future__ import annotations

from typing import Any, Dict

import bsim


class CustomSolver(bsim.Solver):
    """A toy custom solver that emits STEP events and returns a result."""

    def simulate(self, *, steps: int, dt: float, emit) -> Dict[str, Any]:
        state: Dict[str, Any] = {"time": 0.0, "steps": 0}
        for i in range(steps):
            state["time"] += dt
            state["steps"] = i + 1
            emit(bsim.BioWorldEvent.STEP, {"i": i, "t": state["time"]})
        return state


def print_listener(event: bsim.BioWorldEvent, payload: Dict[str, Any]) -> None:
    print(f"EVENT: {event.name} -> {payload}")


class StepLoggerModule(bsim.BioModule):
    """Example module that only listens to STEP events via subscriptions."""

    def subscriptions(self):
        return {bsim.BioWorldEvent.STEP}

    def on_event(self, event: bsim.BioWorldEvent, payload: Dict[str, Any], world: bsim.BioWorld) -> None:
        print(f"[Module] {event.name} @ t={payload.get('t')} i={payload.get('i')}")


def main() -> None:
    # Using a custom user-defined solver by subclassing bsim.Solver
    world = bsim.BioWorld(solver=CustomSolver())
    world.on(print_listener)
    world.add_biomodule(StepLoggerModule())
    result = world.simulate(steps=5, dt=0.1)
    print("CustomSolver Result:", result)

    # Using a ready-made solver provided by bsim
    built_in_world = bsim.BioWorld(solver=bsim.FixedStepSolver())
    built_in_world.on(print_listener)
    built_in_world.add_biomodule(StepLoggerModule())
    built_in_result = built_in_world.simulate(steps=3, dt=0.5)
    print("FixedStepSolver Result:", built_in_result)


if __name__ == "__main__":
    main()
