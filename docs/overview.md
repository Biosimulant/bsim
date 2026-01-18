# Overview

bsim is a modular biological simulation library. It centers around three ideas:

- BioWorld: the runtime container that orchestrates multi-rate biomodules, routes signals, and publishes lifecycle events.
- BioModule: a unit of behavior with local state that implements a runnable contract (`setup/reset/advance_to/...`).
- BioSignal: typed data exchanged between modules over named ports.

Event flow (typical)
- STARTED -> TICK x N -> FINISHED
- PAUSED, RESUMED, STOPPED, and ERROR may be emitted depending on runtime control flow.

Directed biosignals
- Modules emit outputs via `get_outputs()` (returning `BioSignal` objects).
- Modules receive inputs via `set_inputs(...)` when connected.
- Connections are explicit: `world.connect("src.port", "dst.port")`.

Wiring and configuration
- Use `WiringBuilder` in code or load a YAML/TOML file to declare modules and connections.
- Optional port metadata on modules (`inputs()`, `outputs()`) enables connection validation.

Standard-agnostic by design
- Biomodules are self-contained Python packages and may wrap external simulators internally.
- The core focuses on orchestration, wiring contracts, and visualization (SimUI).

Near-term focus (beachhead)
- Neuroscience demos: single neuron + small E/I microcircuits with strong visuals (raster, firing rate, Vm traces) and reproducible configs.

Minimal data example (after wiring Eye -> LGN on port "visual_stream")
- Run: `world.run(duration=0.2, tick_dt=0.1)` to advance the orchestrator and dispatch signals.
