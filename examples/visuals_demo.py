"""
Minimal demo showing module-provided visuals and world collection.

Run:
    pip install -e .
    python examples/visuals_demo.py

Or without installing:
    PYTHONPATH=src python examples/visuals_demo.py
"""

from __future__ import annotations

from typing import Any, Dict

import sys

try:
    import bsim
except ModuleNotFoundError:
    sys.stderr.write(
        "Could not import 'bsim'. Did you run 'pip install -e .'?\n"
        "Alternatively, run with 'PYTHONPATH=src'.\n"
    )
    raise


class StepSeries(bsim.BioModule):
    def __init__(self) -> None:
        self._points: list[list[float]] = []

    def on_event(self, event: bsim.BioWorldEvent, payload: Dict[str, Any], world: bsim.BioWorld) -> None:
        if event == bsim.BioWorldEvent.STEP:
            t = float(payload.get("t", 0.0))
            i = int(payload.get("i", len(self._points)))
            self._points.append([t, i])

    def visualize(self):
        return {
            "render": "timeseries",
            "data": {"series": [{"name": "step_index", "points": self._points}]},
        }


def main() -> None:
    world = bsim.BioWorld(solver=bsim.FixedStepSolver())
    world.add_biomodule(StepSeries())
    world.simulate(steps=5, dt=0.2)

    visuals = world.collect_visuals()
    print("Collected visuals:")
    for entry in visuals:
        print(entry["module"], "->", entry["visuals"])


if __name__ == "__main__":
    main()
