# Contract: Plugin SDK (discovery + registration)

Status: Draft (living)
Last updated: 2026-01-12

## Purpose

Define how third-party packages register `bsim`-compatible components (modules, solvers, renderers).

Primary use case:
- “Adapter” packages that wrap external simulators/standards (e.g., Brian2/NEURON/NeuroML tooling, SBML engines) and expose them to `bsim` as modules/solvers.

## Discovery mechanism (proposed)

Use Python entry points via `importlib.metadata.entry_points`.

Proposed groups:
- `bsim.modules`
- `bsim.solvers`
- `bsim.adapters` (optional alias for clarity; could map to modules/solvers)
- `bsim.visual_renderers` (optional, future)

Each entry point resolves to a callable or object providing:
- `name` (stable identifier)
- `version` (plugin version)
- `bsim_compat` (range of supported `bsim` versions)
- factory:
  - module factory returning a `BioModule`
  - solver factory returning a `Solver`

## Registry behaviors

- The registry must:
  - list available plugins,
  - resolve by name,
  - validate compatibility range,
  - provide helpful error messages on conflicts.

## Wiring integration

- Wiring specs should be able to reference registry names instead of dotted imports.

## Security posture

- Discovery loads installed packages; registry should support “safe mode” where only allowlisted plugins are enabled.
