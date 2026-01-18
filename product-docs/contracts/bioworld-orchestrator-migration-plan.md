# BioWorld Orchestrator Migration Plan (Completed)

Status: Completed

Summary:
- BioWorld is the single orchestrator with an event-queue scheduler.
- Biomodules implement the runnable contract (`setup`, `reset`, `advance_to`, `set_inputs`, `get_outputs`, `get_state`).
- BioSignal lives in core and is used for all module-to-module exchange.
- Wiring uses `name.port` syntax with validation and optional scheduling hints.
- UI/CLI/examples/tests/docs updated to `run(duration, tick_dt)`.
- Legacy runtime layers removed in favor of self-contained biomodule packages.

References:
- `docs/bioworld.md`
- `product-docs/contracts/plugin-contract.md`
- `product-docs/contracts/wiring-spec.md`
- Runtime decision doc in `product-docs/contracts/`.
