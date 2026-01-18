#!/usr/bin/env python3
"""
E/I microcircuit demo: excitatory and inhibitory populations with Poisson input.

Demonstrates:
- PoissonInput spike generation
- Two interacting IzhikevichPopulations (E and I)
- ExpSynapseCurrent for synaptic connectivity (E->E, E->I, I->E, I->I)
- Full visual suite: raster, rate, state traces, and metrics

The goal is to observe asynchronous irregular (AI) spiking under balanced E/I.

Run:
    pip install -e .
    python examples/neuro_microcircuit_demo.py

Or without installing:
    PYTHONPATH=src python examples/neuro_microcircuit_demo.py
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
    PoissonInput,
    IzhikevichPopulation,
    ExpSynapseCurrent,
    SpikeMonitor,
    RateMonitor,
    StateMonitor,
    NeuroMetrics,
)


def run_microcircuit(
    n_exc: int = 80,
    n_inh: int = 20,
    poisson_rate: float = 5.0,
    w_ee: float = 0.5,
    w_ei: float = 1.0,
    w_ie: float = -2.0,
    w_ii: float = -1.0,
    p_connect: float = 0.1,
    seed: int = 42,
    duration_s: float = 0.5,
    dt: float = 0.0001,
) -> dict:
    """Run an E/I microcircuit simulation.

    Args:
        n_exc: Number of excitatory neurons
        n_inh: Number of inhibitory neurons
        poisson_rate: Input Poisson rate in Hz
        w_ee: E->E weight
        w_ei: E->I weight
        w_ie: I->E weight (typically negative)
        w_ii: I->I weight (typically negative)
        p_connect: Connection probability
        seed: Random seed
        duration_s: Simulation duration in seconds
        dt: Time step in seconds

    Returns:
        Dict with collected visuals
    """
    n_total = n_exc + n_inh
    print(f"\n{'=' * 60}")
    print(f"E/I Microcircuit: {n_exc}E + {n_inh}I neurons")
    print(f"Poisson drive: {poisson_rate} Hz, E/I weights: {w_ee}/{w_ei}/{w_ie}/{w_ii}")
    print("=" * 60)

    # Create world
    world = bsim.BioWorld()

    # Input: Poisson spike train driving excitatory neurons
    poisson_input = PoissonInput(n=n_exc, rate_hz=poisson_rate, seed=seed)

    # Populations
    exc_pop = IzhikevichPopulation(
        n=n_exc,
        preset="RS",  # Regular spiking for excitatory
        I_bias=0.0,
        sample_indices=[0, 1, 2],
    )
    inh_pop = IzhikevichPopulation(
        n=n_inh,
        preset="FS",  # Fast spiking for inhibitory
        I_bias=0.0,
        sample_indices=[0, 1],
    )

    # Synapses (external input -> E)
    syn_ext_e = ExpSynapseCurrent(
        n_pre=n_exc,
        n_post=n_exc,
        p_connect=p_connect,
        weight=1.0,  # External drive weight
        tau=0.005,
        seed=seed,
    )

    # Recurrent synapses
    syn_ee = ExpSynapseCurrent(
        n_pre=n_exc,
        n_post=n_exc,
        p_connect=p_connect,
        weight=w_ee,
        tau=0.005,
        seed=seed + 1,
    )
    syn_ei = ExpSynapseCurrent(
        n_pre=n_exc,
        n_post=n_inh,
        p_connect=p_connect,
        weight=w_ei,
        tau=0.005,
        seed=seed + 2,
    )
    syn_ie = ExpSynapseCurrent(
        n_pre=n_inh,
        n_post=n_exc,
        p_connect=p_connect,
        weight=w_ie,
        tau=0.010,  # Slower inhibitory decay
        seed=seed + 3,
    )
    syn_ii = ExpSynapseCurrent(
        n_pre=n_inh,
        n_post=n_inh,
        p_connect=p_connect,
        weight=w_ii,
        tau=0.010,
        seed=seed + 4,
    )

    # Monitors
    spike_mon_e = SpikeMonitor(max_neurons=n_exc, width=600, height=200)
    spike_mon_i = SpikeMonitor(max_neurons=n_inh, width=600, height=150)
    rate_mon = RateMonitor(window_size=0.02, n_neurons=n_total)
    state_mon = StateMonitor(max_points=5000)
    metrics_e = NeuroMetrics(n_neurons=n_exc)
    metrics_i = NeuroMetrics(n_neurons=n_inh)

    # Wire everything using WiringBuilder
    wb = bsim.WiringBuilder(world)

    # Add modules
    wb.add("poisson", poisson_input)
    wb.add("exc", exc_pop)
    wb.add("inh", inh_pop)
    wb.add("syn_ext_e", syn_ext_e)
    wb.add("syn_ee", syn_ee)
    wb.add("syn_ei", syn_ei)
    wb.add("syn_ie", syn_ie)
    wb.add("syn_ii", syn_ii)
    wb.add("spike_mon_e", spike_mon_e)
    wb.add("spike_mon_i", spike_mon_i)
    wb.add("rate_mon", rate_mon)
    wb.add("state_mon", state_mon)
    wb.add("metrics_e", metrics_e)
    wb.add("metrics_i", metrics_i)

    # External drive -> syn_ext_e -> E
    wb.connect("poisson.spikes", ["syn_ext_e.spikes"])
    wb.connect("syn_ext_e.current", ["exc.current"])

    # E -> synapses
    wb.connect("exc.spikes", [
        "syn_ee.spikes",
        "syn_ei.spikes",
        "spike_mon_e.spikes",
        "rate_mon.spikes",
        "metrics_e.spikes",
    ])
    wb.connect("exc.state", ["state_mon.state"])

    # I -> synapses
    wb.connect("inh.spikes", [
        "syn_ie.spikes",
        "syn_ii.spikes",
        "spike_mon_i.spikes",
        "rate_mon.spikes",
        "metrics_i.spikes",
    ])

    # Synaptic currents -> populations
    wb.connect("syn_ee.current", ["exc.current"])
    wb.connect("syn_ie.current", ["exc.current"])
    wb.connect("syn_ei.current", ["inh.current"])
    wb.connect("syn_ii.current", ["inh.current"])

    wb.apply()

    try:
        print(f"Modules added: {len(world.module_names)}")
    except Exception:
        pass

    # Simulate
    steps = int(duration_s / dt)
    world.run(duration=steps * dt, tick_dt=dt)
    print("Simulation complete.")

    # Collect visuals
    visuals = world.collect_visuals()
    print(f"\nCollected {len(visuals)} visual outputs:")
    for entry in visuals:
        print(f"  - {entry['module']}: {[v['render'] for v in entry['visuals']]}")

    # Print metrics
    print("\n--- Excitatory Population Metrics ---")
    for entry in visuals:
        if entry["module"] == "NeuroMetrics":
            # Find the E metrics (first one encountered for E)
            table_data = entry["visuals"][0]["data"]
            for row in table_data["rows"]:
                print(f"  {row[0]}: {row[1]}")
            break

    return {"visuals": visuals}


def main() -> None:
    """Run the E/I microcircuit demo."""
    print("Neuro Pack - E/I Microcircuit Demo")
    print("=" * 60)

    # Standard balanced E/I network
    print("\n[Demo 1] Balanced E/I network")
    run_microcircuit(
        n_exc=80,
        n_inh=20,
        poisson_rate=10.0,
        w_ee=0.3,
        w_ei=0.5,
        w_ie=-1.5,
        w_ii=-0.5,
        p_connect=0.1,
        seed=42,
        duration_s=0.3,
    )

    # Higher inhibition (more stable)
    print("\n[Demo 2] Strong inhibition (activity suppression)")
    run_microcircuit(
        n_exc=80,
        n_inh=20,
        poisson_rate=10.0,
        w_ee=0.3,
        w_ei=0.5,
        w_ie=-3.0,  # Stronger inhibition
        w_ii=-1.0,
        p_connect=0.1,
        seed=42,
        duration_s=0.3,
    )

    # Disinhibition (may lead to synchrony)
    print("\n[Demo 3] Weak inhibition (potential synchronization)")
    run_microcircuit(
        n_exc=80,
        n_inh=20,
        poisson_rate=10.0,
        w_ee=0.5,
        w_ei=0.5,
        w_ie=-0.5,  # Weak inhibition
        w_ii=-0.2,
        p_connect=0.1,
        seed=42,
        duration_s=0.3,
    )


if __name__ == "__main__":
    main()
