# Epic 07: Domain module pack(s) (reference implementations)

Status: Draft
Last updated: 2026-01-12

## Goal

Ship at least one credible end-to-end multi-module demo that goes beyond toy examples and exercises wiring + visuals + (optionally) SimUI.

## Approach

Start with “reference packs” that are explicitly scoped and teach the architecture:
- v0 pack (recommended): neuro “stimulus → spikes” sandbox:
  - single-neuron regimes (Izhikevich tonic spiking vs bursting)
  - small E/I microcircuit under Poisson drive (asynchronous irregular spiking)
  - strong visuals (raster, population rate, Vm traces) and reproducible config files

## Acceptance criteria

- At least one module pack exists (could be within repo initially) with:
  - 3+ modules,
  - wiring file examples (YAML/TOML),
  - visuals output,
  - tests for basic behavior.
- SimUI demo runs and renders visuals for the pack.

Suggested v0 modules (neuro pack):
- Inputs: `PoissonInput`, `StepCurrent` (or `DCInput`)
- Dynamics: `IzhikevichPopulation` (or LIF as a stepping stone)
- Connectivity/current: `StaticConnectivity`, `ExpSynapseCurrent`
- Probes/visuals: `SpikeMonitor`, `StateMonitor`, `NeuroMetrics`

Suggested v0 visuals:
- raster: `VisualSpec(render="image", data={"src": "data:image/png;base64,...", ...})`
- population firing rate: `timeseries`
- Vm trace(s): `timeseries`
- summary metrics: `table`

## Implementation plan

1. Choose a pack scope and define its interfaces (ports, signals, visuals).
2. Implement modules + tests.
3. Add examples and SimUI demo.
4. Document the pack in `docs/` and link from `README.md`.
