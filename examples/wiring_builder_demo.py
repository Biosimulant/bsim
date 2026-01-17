"""
Demonstrates WiringBuilder to declaratively connect modules in code.

Run:
    pip install -e .
    python examples/wiring_builder_demo.py
"""

from __future__ import annotations

import bsim


class Eye(bsim.BioModule):
    def subscriptions(self):
        return {bsim.BioWorldEvent.STEP}

    def on_event(self, event, payload, world):
        world.publish_biosignal(self, topic="visual_stream", payload={"t": payload.get("t")})


class LGN(bsim.BioModule):
    def on_signal(self, topic, payload, source, world):
        # Connected as eye.visual_stream -> lgn.retina
        if topic == "retina":
            world.publish_biosignal(self, topic="thalamus", payload=payload)


class SC(bsim.BioModule):
    def on_signal(self, topic, payload, source, world):
        # Connected as lgn.thalamus -> sc.vision
        if topic == "vision":
            print("[SC] vision:", payload)


def main() -> None:
    world = bsim.BioWorld(solver=bsim.FixedStepSolver())
    eye, lgn, sc = Eye(), LGN(), SC()

    wb = bsim.WiringBuilder(world)
    wb.add("eye", eye).add("lgn", lgn).add("sc", sc)
    wb.connect("eye.visual_stream", ["lgn.retina", "sc.vision"]).apply()

    world.simulate(steps=2, dt=0.1)


if __name__ == "__main__":
    main()
