# SPDX-FileCopyrightText: 2025-present Demi <bjaiye1@gmail.com>
#
# SPDX-License-Identifier: MIT
"""Neuro pack: reference modules for computational neuroscience simulations.

This pack provides a minimal but composable set of BioModules for simulating
spiking neural networks with the Izhikevich model.

Inputs:
    PoissonInput - Generate Poisson-distributed spike trains
    StepCurrent / DCInput - Inject constant or scheduled current

Populations:
    IzhikevichPopulation - Izhikevich spiking neuron population

Synapses:
    ExpSynapseCurrent - Convert spikes to exponentially decaying current

Monitors:
    SpikeMonitor - Collect spikes and produce raster plot visualization
    RateMonitor - Compute population firing rate timeseries
    StateMonitor - Record membrane voltage traces
    NeuroMetrics - Compute summary statistics table

Presets:
    PRESET_RS - Regular Spiking
    PRESET_FS - Fast Spiking
    PRESET_BURSTING - Intrinsically Bursting
    PRESET_CHATTERING - Chattering
    PRESET_LTS - Low-Threshold Spiking
    PRESETS - Dict of all presets by name

Example:
    from bsim.packs.neuro import (
        PoissonInput,
        IzhikevichPopulation,
        ExpSynapseCurrent,
        SpikeMonitor,
        PRESET_RS,
    )
"""

from .inputs import PoissonInput, StepCurrent, DCInput
from .populations import (
    IzhikevichPopulation,
    IzhikevichPreset,
    PRESET_RS,
    PRESET_FS,
    PRESET_BURSTING,
    PRESET_CHATTERING,
    PRESET_LTS,
    PRESETS,
)
from .synapses import ExpSynapseCurrent
from .monitors import (
    SpikeMonitor,
    RateMonitor,
    StateMonitor,
    NeuroMetrics,
)

__all__ = [
    # Inputs
    "PoissonInput",
    "StepCurrent",
    "DCInput",
    # Populations
    "IzhikevichPopulation",
    "IzhikevichPreset",
    "PRESET_RS",
    "PRESET_FS",
    "PRESET_BURSTING",
    "PRESET_CHATTERING",
    "PRESET_LTS",
    "PRESETS",
    # Synapses
    "ExpSynapseCurrent",
    # Monitors
    "SpikeMonitor",
    "RateMonitor",
    "StateMonitor",
    "NeuroMetrics",
]
