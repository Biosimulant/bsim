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

## License

`bsim` is distributed under the terms of the [MIT](https://spdx.org/licenses/MIT.html) license.
