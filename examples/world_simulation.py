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


class Eye(bsim.BioModule):
    """Publishes a vision biosignal each STEP (toy example)."""

    def subscriptions(self):
        return {bsim.BioWorldEvent.STEP}

    def on_event(self, event, payload, world):
        # Emit a directed biosignal to connected modules only
        world.publish_biosignal(self, topic="vision", payload={"photon": True, "t": payload.get("t")})


class LGN(bsim.BioModule):
    """Receives Eye.vision and relays to thalamus channel."""

    def on_event(self, event, payload, world):
        pass  # no-op for global events in this demo

    def on_signal(self, topic, payload, source, world):
        if topic == "vision":
            # Relay to downstream consumers via a new topic
            world.publish_biosignal(self, topic="thalamus", payload={"relay": payload})


class SuperiorColliculus(bsim.BioModule):
    """Receives LGN.thalamus signals."""

    def on_event(self, event, payload, world):
        pass

    def on_signal(self, topic, payload, source, world):
        if topic == "thalamus":
            print("[SC] received:", payload)


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

    # Demonstrate module-to-module biosignal routing (Eye -> LGN -> SC)
    bw = bsim.BioWorld(solver=bsim.FixedStepSolver())
    eye = Eye()
    lgn = LGN()
    sc = SuperiorColliculus()

    bw.add_biomodule(eye)
    bw.add_biomodule(lgn)
    bw.add_biomodule(sc)
    bw.connect_biomodules(eye, topic="vision", dst=lgn)
    bw.connect_biomodules(lgn, topic="thalamus", dst=sc)
    bw.simulate(steps=2, dt=0.2)


if __name__ == "__main__":
    main()
