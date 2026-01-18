"""
Demonstrates BioWorld orchestration and signal routing.

Run with:
    pip install -e .
    python examples/world_simulation.py

Or without installing:
    PYTHONPATH=src python examples/world_simulation.py
"""

from __future__ import annotations

import bsim


def print_listener(event: bsim.WorldEvent, payload: dict) -> None:
    print(f"EVENT: {event.value} -> {payload}")


class StepLoggerModule(bsim.BioModule):
    """Example module that advances on its schedule."""

    def __init__(self):
        self.min_dt = 0.1

    def advance_to(self, t: float) -> None:
        print(f"[Module] tick @ t={t}")

    def get_outputs(self):
        return {}


class Eye(bsim.BioModule):
    """Publishes a vision signal each step."""

    def __init__(self):
        self.min_dt = 0.1
        self._outputs = {}

    def outputs(self):
        return {"vision"}

    def advance_to(self, t: float) -> None:
        self._outputs = {
            "vision": bsim.BioSignal(source="eye", name="vision", value={"photon": True}, time=t)
        }

    def get_outputs(self):
        return dict(self._outputs)


class LGN(bsim.BioModule):
    """Receives Eye.vision and relays to thalamus channel."""

    def __init__(self):
        self.min_dt = 0.1
        self._outputs = {}

    def inputs(self):
        return {"vision"}

    def outputs(self):
        return {"thalamus"}

    def set_inputs(self, signals):
        if "vision" in signals:
            self._outputs = {
                "thalamus": bsim.BioSignal(
                    source="lgn", name="thalamus", value=signals["vision"].value, time=signals["vision"].time
                )
            }

    def advance_to(self, t: float) -> None:
        return

    def get_outputs(self):
        return dict(self._outputs)


class SuperiorColliculus(bsim.BioModule):
    """Receives LGN.thalamus signals."""

    def __init__(self):
        self.min_dt = 0.1

    def inputs(self):
        return {"thalamus"}

    def set_inputs(self, signals):
        if "thalamus" in signals:
            print("[SC] received:", signals["thalamus"].value)

    def advance_to(self, t: float) -> None:
        return

    def get_outputs(self):
        return {}


def main() -> None:
    world = bsim.BioWorld()
    world.on(print_listener)
    world.add_biomodule("logger", StepLoggerModule())
    world.run(duration=0.3, tick_dt=0.1)

    print("--- Signal routing demo ---")
    bw = bsim.BioWorld()
    eye = Eye()
    lgn = LGN()
    sc = SuperiorColliculus()

    bw.add_biomodule("eye", eye, priority=2)
    bw.add_biomodule("lgn", lgn, priority=1)
    bw.add_biomodule("sc", sc)
    bw.connect("eye.vision", "lgn.vision")
    bw.connect("lgn.thalamus", "sc.thalamus")
    bw.run(duration=0.2, tick_dt=0.1)


if __name__ == "__main__":
    main()
