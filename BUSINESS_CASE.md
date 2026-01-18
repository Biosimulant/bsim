# Biosimulant

A unified, modular biological simulation platform with a biomodule-first architecture.

## Vision

Build a standard-agnostic simulation composition layer: wire reusable biomodules into a world, run them with a single orchestration contract, and visualize/debug runs via a Python-declared UI (SimUI). Rather than re-implementing every biological standard in-core, biomodule packages can wrap external simulators internally.

## Target Users

- **Near-term beachhead: Neuroscience** - Compose and visualize small neuron/microcircuit models with reproducible configs.
- **Developers building simulation tooling** - Want a composable runtime, wiring contracts, and a UI layer for experiments/demos.
- **Longer-term** - Other domains via domain packs and biomodule packages (e.g., SBML/CellML tooling, PK/PD engines).

## Core Capabilities

### Multi-Scale Simulation Engine (`bsim`)
- **BioWorld** - Orchestration kernel that schedules biomodules, publishes lifecycle events, and routes signals
- **BioModule** - Runnable units of behavior with local state and explicit inputs/outputs
- **BioSignal** - Typed, versioned data payloads exchanged between modules
- **Wiring System** - Declarative module graph configuration via code, YAML, or TOML

### Hybrid Execution
- Run simulations locally for development and testing
- Scale to cloud/HPC workloads for production and research

### Web-Based Interface (SimUI)
- Python-declared UI for controlling and visualizing simulations
- Built-in visualization types: time series, bar charts, tables, images, graphs
- Real-time event logging and status monitoring
- No frontend development required - declare UI components from Python

### Plugin SDK
- Open-source extensibility via robust plugin architecture
- Modules can declare input/output ports for connection validation
- Standard event lifecycle: `STARTED -> TICK x N -> FINISHED`

## Standards Strategy (Biomodule-First)

Instead of integrating CellML/NeuroML/SBML directly into core, define stable `bsim` contracts so small Python packages can wrap existing runtimes:
- A biomodule package loads a standard model (e.g., NeuroML or SBML) using the best available runtime.
- The package exposes that runtime as a `BioModule` with explicit ports.
- The package can provide visuals (raster plots, traces, tables) via the `VisualSpec` JSON contract.

This keeps `bsim` focused on composition, orchestration, and UX while letting domain ecosystems evolve independently.

## Beachhead Demo (Neuro)

Build a "stimulus -> spikes" sandbox with a credible, reproducible tutorial:
- Single-neuron Izhikevich regimes (tonic spiking vs bursting) with Vm traces.
- Small E/I microcircuit under Poisson drive showing asynchronous irregular spiking (raster + population rate).
- Config-driven runs (YAML/TOML) defining modules + wiring + parameters.
- SimUI dashboard: controls for duration/tick_dt/input rate/weights/seed; outputs for raster image, rate timeseries, Vm traces, and summary metrics table.

## Project Structure

```
Biosimulant/
├── B-Simulant/              # Core Python simulation library (bsim)
│   ├── src/bsim/            # Source code
│   ├── examples/            # Usage examples
│   ├── docs/                # API documentation
│   └── tests/               # Test suite
├── bsim-backend/            # FastAPI backend for web platform
│   └── app/                 # Application code
├── biosimulant-landing-page/# Marketing website (React/Vite)
│   └── src/                 # Frontend source
└── README.md                # This file
```

## Expected Features

### Core Simulation Engine
- [ ] Multi-rate scheduling with `min_dt` and `next_due_time`
- [ ] Event-driven architecture with lifecycle hooks
- [ ] Directed biosignal routing between modules
- [ ] Connection validation via port declarations
- [ ] YAML/TOML configuration file support

### Built-in Modules (Planned)
- [ ] Molecular dynamics integration
- [ ] Cellular automata systems
- [ ] Metabolic pathway modeling
- [ ] Neural network simulation
- [ ] Population dynamics
- [ ] Pharmacokinetic/pharmacodynamic (PK/PD) modeling

### Web Platform
- [ ] User authentication and project management
- [ ] Simulation configuration and execution
- [ ] Real-time visualization dashboard
- [ ] Result storage and export
- [ ] Collaboration features
- [ ] API access for programmatic control

### SimUI Components
- [ ] Number inputs and sliders
- [ ] Buttons and action triggers
- [ ] Event log panels
- [ ] Visuals panel (charts, graphs, images)
- [ ] Parameter sweeps
- [ ] Batch execution controls

## Quick Start

### Installation

```bash
# Install the core library
pip install bsim

# For development
pip install -e './B-Simulant[dev]'

# With UI support
pip install -e './B-Simulant[ui]'
```
