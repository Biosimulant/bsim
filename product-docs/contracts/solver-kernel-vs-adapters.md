# Decision: BioWorld orchestration (single runtime contract)

Status: Final
Last updated: 2026-01-12

## Context

We evaluated two approaches:
- A kernel + wrapper layer split across multiple contracts.
- A single orchestration kernel with runnable biomodules.

## Decision

Adopt a single BioWorld orchestration contract:
- Biomodules implement `setup/reset/advance_to/set_inputs/get_outputs/...`.
- The world schedules modules (multi-rate) and routes signals.
- No separate wrapper layer in the core runtime.

## Rationale

- Clearer mental model for module authors.
- Fewer parallel contracts (module vs adapter).
- More composable runtime for heterogeneous module packages.

## Consequences

- Legacy runtime abstractions removed from the core and docs.
- Biomodule packages may still wrap external simulators internally.
