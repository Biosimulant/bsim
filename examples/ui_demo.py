"""
Demonstrates the Python-first SimUI Interface with a BioWorld.

Run after installing UI extras:
    pip install -e '.[ui]'
    python examples/ui_demo.py

Or:
    PYTHONPATH=src python examples/ui_demo.py
"""

from __future__ import annotations

import bsim


def main() -> None:
    world = bsim.BioWorld(solver=bsim.FixedStepSolver())

    # Add a toy module exposing visuals
    class TS(bsim.BioModule):
        def __init__(self):
            self._points = []

        def reset(self):
            # Clear history for a fresh run
            self._points = []

        def on_event(self, event, payload, world):
            if event == bsim.BioWorldEvent.STEP:
                self._points.append([payload["t"], payload.get("i", len(self._points))])

        def visualize(self):
            return {"render": "timeseries", "data": {"series": [{"name": "i", "points": self._points}]}}

    world.add_biomodule(TS())

    from bsim.simui import Interface, Number, Button, EventLog, VisualsPanel

    ui = Interface(
        world,
        title="BioSim UI",
        controls=[Number("steps", 50, label="Steps", minimum=1), Number("dt", 0.1, label="dt", step=0.1), Button("Run")],
        outputs=[EventLog(limit=200), VisualsPanel(refresh="auto", interval_ms=800)],
    )
    ui.launch(port=7861)


if __name__ == "__main__":
    main()
