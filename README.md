# bsim

[![PyPI - Version](https://img.shields.io/pypi/v/bsim.svg)](https://pypi.org/project/bsim)
[![PyPI - Python Version](https://img.shields.io/pypi/pyversions/bsim.svg)](https://pypi.org/project/bsim)

Unified, modular biological simulation engine with a plugin-first architecture.

---

## Executive Summary & System Goals

### Vision

Create a truly extensible, multi-scale biological simulation engine capable of integrating molecular, cellular, tissue, organ, and ecosystem models into a single composable framework, powered by a plugin-based architecture and compliant with major biological modeling standards.

### Core Mission

- Engine-like architecture for biology (in the spirit of Unity/Unreal for physics/graphics).
- Compose simulations from reusable, interoperable modules.
- Hybrid execution: run locally or scale to cloud/HPC workloads.
- Open-source extensibility via a robust plugin SDK.

### Primary Users

- Computational biologists (multi-scale research)
- Pharma & biotech R&D teams (drug discovery, disease modeling)
- Synthetic biologists (genetic circuit and metabolic pathway design)
- Neuroscientists (multi-compartment neuron and network modeling)
- Bioinformatics developers (integrating omics data into simulations)

---

## Installation

```console
pip install bsim
```

## Examples

- See `examples/` for quick-start scripts. Try:

```bash
pip install -e .
python examples/basic_usage.py
```

### Quick Start: DefaultBioSolver

`DefaultBioSolver` extends the fixed-step behavior with configurable bio-quantities and processes (temperature, water, oxygen, etc.). It preserves the same event flow via `BioWorld` (`LOADED → BEFORE_SIMULATION → STEP* → AFTER_SIMULATION`).

Minimal usage:

```python
import bsim

solver = bsim.DefaultBioSolver(
    temperature=bsim.TemperatureParams(
        initial=300.0,          # Kelvin
        delta_per_step=1.0,     # +1 K per step
        rate_per_time=0.5,      # +0.5 K per second
        bounds=(273.15, 315.15)
    ),
    water=bsim.ScalarRateParams(name="water", initial=1.0, rate_per_time=-0.6, bounds=(0.0, 1.0)),
    oxygen=bsim.ScalarRateParams(name="oxygen", initial=0.3, rate_per_time=-0.2, bounds=(0.0, 1.0)),
)

world = bsim.BioWorld(solver=solver)
result = world.simulate(steps=3, dt=1.0)
print(result)  # {'time': 3.0, 'steps': 3, 'temperature': ..., 'water': ..., 'oxygen': ...}
```

See a fuller demonstration (including a custom process) in:

- `examples/default_bio_solver.py`

### Visuals from Modules

Modules may optionally expose web-native visuals via `visualize()`, returning a dict or list of dicts with keys `render` and `data`. The world can collect them without any transport layer:

```python
class MyModule(bsim.BioModule):
    def visualize(self):
        return {"render": "timeseries", "data": {"series": [{"name": "s", "points": [[0.0, 1.0]]}]}}

world = bsim.BioWorld(solver=bsim.FixedStepSolver())
world.add_biomodule(MyModule())
world.simulate(steps=1, dt=0.1)
print(world.collect_visuals())  # [{"module": "MyModule", "visuals": [...]}]
```

See `examples/visuals_demo.py` for a minimal end-to-end example.

## API Reference

### TemperatureParams

- initial: float — starting temperature value.
- delta_per_step: float — additive change applied each simulation step.
- rate_per_time: float — rate-based change per unit time (multiplied by `dt`).
- bounds: tuple[float, float] | None — optional `(min, max)` clamp.

Example:

```python
bsim.TemperatureParams(initial=300.0, delta_per_step=1.0, rate_per_time=0.5, bounds=(273.15, 315.15))
```

### ScalarRateParams

- name: str — quantity name (e.g., "water", "oxygen").
- initial: float — starting value for the quantity.
- rate_per_time: float — change per unit time (value += rate_per_time * dt).
- bounds: tuple[float, float] | None — optional `(min, max)` clamp.

Example:

```python
bsim.ScalarRateParams(name="water", initial=1.0, rate_per_time=-0.6, bounds=(0.0, 1.0))
```

## License

`bsim` is distributed under the terms of the [MIT](https://spdx.org/licenses/MIT.html) license.
