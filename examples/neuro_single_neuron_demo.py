#!/usr/bin/env python3
"""
Single neuron demo using the Izhikevich model with different parameter presets.

Demonstrates:
- Direct current injection with StepCurrent
- IzhikevichPopulation with preset parameters
- Membrane voltage monitoring with StateMonitor
- Spike collection and raster plot generation

Run:
    pip install -e .
    python examples/neuro_single_neuron_demo.py

Or without installing:
    PYTHONPATH=src python examples/neuro_single_neuron_demo.py
"""
from __future__ import annotations

import sys
from pathlib import Path

# Allow running without installation
try:
    import bsim
except ModuleNotFoundError:
    sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))
    import bsim

from bsim.packs.neuro import (
    StepCurrent,
    IzhikevichPopulation,
    SpikeMonitor,
    StateMonitor,
    NeuroMetrics,
    PRESETS,
)


def run_single_neuron(preset_name: str = "RS", I_current: float = 10.0) -> dict:
    """Run a single neuron simulation with given preset and current.

    Args:
        preset_name: One of "RS", "FS", "Bursting", "Chattering", "LTS"
        I_current: Injected current amplitude

    Returns:
        Dict with simulation result and collected visuals
    """
    print(f"\n{'=' * 60}")
    print(f"Running {preset_name} neuron with I = {I_current}")
    print("=" * 60)

    # Create world
    world = bsim.BioWorld()

    # Create modules
    current_source = StepCurrent(I=I_current)
    neuron = IzhikevichPopulation(
        n=1,  # Single neuron
        preset=preset_name,
        sample_indices=[0],  # Monitor this neuron
    )
    spike_monitor = SpikeMonitor(max_neurons=1, width=600, height=200)
    state_monitor = StateMonitor(max_points=5000)
    metrics = NeuroMetrics(n_neurons=1)

    # Wire modules using WiringBuilder
    wb = bsim.WiringBuilder(world)
    wb.add("current", current_source)
    wb.add("neuron", neuron)
    wb.add("spike_mon", spike_monitor)
    wb.add("state_mon", state_monitor)
    wb.add("metrics", metrics)

    # Connect: current -> neuron -> monitors
    wb.connect("current.current", ["neuron.current"])
    wb.connect("neuron.spikes", ["spike_mon.spikes", "metrics.spikes"])
    wb.connect("neuron.state", ["state_mon.state"])
    wb.apply()


    # Simulate for 500ms at 0.1ms steps (dt in seconds)
    world.run(duration=0.5, tick_dt=0.0001)

    # Collect and display visuals
    visuals = world.collect_visuals()
    print(f"\nCollected {len(visuals)} visual outputs:")
    for entry in visuals:
        print(f"  - {entry['module']}: {[v['render'] for v in entry['visuals']]}")

    # Print metrics table
    for entry in visuals:
        if entry["module"] == "NeuroMetrics":
            table_data = entry["visuals"][0]["data"]
            print("\nMetrics:")
            for row in table_data["rows"]:
                print(f"  {row[0]}: {row[1]}")

    return {"visuals": visuals}


def main() -> None:
    """Run demos with multiple Izhikevich presets."""
    print("Neuro Pack - Single Neuron Demo")
    print("=" * 60)
    print("Available presets:", list(PRESETS.keys()))

    # Demo 1: Regular Spiking (RS) with moderate current
    run_single_neuron("RS", I_current=10.0)

    # Demo 2: Fast Spiking (FS) with same current
    run_single_neuron("FS", I_current=10.0)

    # Demo 3: Bursting with lower current
    run_single_neuron("Bursting", I_current=5.0)

    # Demo 4: Show regime transition - RS with increasing current
    print("\n" + "=" * 60)
    print("Demonstrating regime changes with increasing current (RS preset)")
    print("=" * 60)
    for I in [0.0, 5.0, 10.0, 15.0, 20.0]:
        result = run_single_neuron("RS", I_current=I)
        # Extract spike count from metrics
        for entry in result["visuals"]:
            if entry["module"] == "NeuroMetrics":
                rows = entry["visuals"][0]["data"]["rows"]
                spike_count = rows[0][1]  # First row is "Total Spikes"
                print(f"  I = {I:5.1f} -> {spike_count} spikes")


if __name__ == "__main__":
    main()
