# Plugin Development Guide

This guide explains how to create custom biomodules for bsim that can be:
1. Used in your own projects
2. Published as pip-installable packages
3. Referenced in YAML configs by other users

## Quick Start

```bash
# Install bsim
pip install bsim

# Create your package
mkdir my-bsim-pack && cd my-bsim-pack
# ... implement modules ...

# Use in YAML
# config.yaml
modules:
  my_module:
    class: my_pack.MyModule
```

---

## Part 1: Creating Custom Modules

### The BioModule Protocol

All modules implement the runnable contract. A minimal interface looks like:

```python
from typing import Any, Dict, Optional, Set
from bsim import BioModule, BioWorld, BioSignal, SignalMetadata

class BioModule:
    min_dt: float

    def setup(self, world: BioWorld) -> None: ...
    def reset(self) -> None: ...
    def advance_to(self, t: float) -> None: ...
    def set_inputs(self, inputs: Dict[str, BioSignal]) -> None: ...
    def get_outputs(self) -> Dict[str, BioSignal]: ...
    def get_state(self) -> Dict[str, Any]: ...
    def next_due_time(self, t: float) -> Optional[float]: ...
    def inputs(self) -> Set[str]: ...
    def outputs(self) -> Set[str]: ...
```

### Minimal Module Example

```python
# my_pack/modules.py
from typing import Dict, Set
from bsim import BioModule, BioSignal, SignalMetadata

class Counter(BioModule):
    """Counts ticks and emits a count signal."""

    min_dt = 0.1

    def __init__(self, name: str = "counter"):
        self.name = name
        self._count = 0

    def outputs(self) -> Set[str]:
        return {"count"}

    def reset(self) -> None:
        self._count = 0

    def advance_to(self, t: float) -> None:
        self._count += 1

    def get_outputs(self) -> Dict[str, BioSignal]:
        return {
            "count": BioSignal(
                value={"count": self._count, "t": t},
                metadata=SignalMetadata(units="1"),
            )
        }
```

### Module With Inputs

```python
class Accumulator(BioModule):
    min_dt = 0.1

    def __init__(self):
        self._total = 0
        self._inputs = {}

    def inputs(self):
        return {"value"}

    def set_inputs(self, inputs):
        self._inputs = inputs

    def advance_to(self, t: float) -> None:
        if "value" in self._inputs:
            self._total += self._inputs["value"].value

    def get_outputs(self):
        return {
            "sum": BioSignal(value=self._total, metadata=SignalMetadata(units="1"))
        }
```

---

## Part 2: Packaging and Distribution

### Package layout

```
my-bsim-pack/
├── pyproject.toml
├── src/
│   └── my_pack/
│       ├── __init__.py
│       └── modules.py
└── tests/
    └── test_modules.py
```

### Export module classes

```python
# my_pack/__init__.py
from .modules import Counter, Accumulator

__all__ = ["Counter", "Accumulator"]
```

### Use in YAML configs

```yaml
modules:
  counter:
    class: my_pack.Counter
    args:
      name: "demo"
  accumulator:
    class: my_pack.Accumulator
wiring:
  - { from: counter.count, to: [accumulator.value] }
```

---

## Part 3: Testing

Use pytest to validate your module behavior and signal outputs.

```python
def test_counter_emits():
    m = Counter()
    m.advance_to(0.1)
    out = m.get_outputs()
    assert "count" in out
```
