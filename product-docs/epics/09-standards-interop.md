# Epic 09: Standards & Interoperability (Adapter-First)

Status: Draft
Last updated: 2026-01-13

## Goal

Enable bsim to run models from major biological standards (SBML, NeuroML, CellML) by wrapping existing simulators as adapters, not reimplementing standards.

## Strategic Context

See `STRATEGY.md` for full business context.

**Key insight:** Standards (SBML, CellML, NeuroML) are file formats that describe models. Simulators (tellurium, pyNeuroML, OpenCOR) execute them. We wrap simulators, not standards.

## Adapter-First Principle

Instead of parsing SBML/NeuroML directly:

```
❌ Wrong: bsim parses SBML → reimplements ODE solver → runs model
✅ Right: bsim wraps tellurium → tellurium parses SBML → tellurium runs model
```

Benefits:
- Leverage mature, tested implementations
- Get updates/fixes from upstream
- Reduce maintenance burden
- Access existing model databases immediately

## Adapter Contract

```python
from typing import Protocol, Any
from dataclasses import dataclass

@dataclass
class BioSignal:
    """Neutral interchange format for cross-adapter communication."""
    source: str
    name: str
    value: Any  # numpy array, scalar, sparse events
    time: float
    metadata: dict  # units, shape, semantics

class SimulatorAdapter(Protocol):
    """Standard interface all adapters must implement."""

    def setup(self, config: dict) -> None:
        """Initialize the wrapped simulator with configuration."""
        ...

    def advance_to(self, t: float) -> None:
        """Advance simulation to target time. Adapter handles substeps."""
        ...

    def get_outputs(self) -> dict[str, BioSignal]:
        """Return current exposed state as BioSignals."""
        ...

    def set_inputs(self, signals: dict[str, BioSignal]) -> None:
        """Inject external inputs into the simulator."""
        ...

    def get_state(self) -> dict:
        """Return serializable state for checkpointing."""
        ...

    def reset(self) -> None:
        """Reset to initial conditions."""
        ...
```

## Priority Adapters

### P0: tellurium (SBML) - First Adapter

**Why first:**
- Pure Python, easy to wrap
- Excellent API
- Access to BioModels (1000+ models)
- Active community

**Implementation:**

```python
import tellurium as te
from bsim.adapters import SimulatorAdapter, BioSignal

class TelluriumAdapter(SimulatorAdapter):
    def __init__(self, sbml_path: str, expose: list[str] = None):
        self.sbml_path = sbml_path
        self.expose = expose or []
        self.model = None
        self.current_time = 0.0

    def setup(self, config: dict) -> None:
        self.model = te.loadSBMLModel(self.sbml_path)
        # Apply any parameter overrides from config
        for key, value in config.get("parameters", {}).items():
            setattr(self.model, key, value)

    def advance_to(self, t: float) -> None:
        if t > self.current_time:
            self.model.simulate(self.current_time, t)
            self.current_time = t

    def get_outputs(self) -> dict[str, BioSignal]:
        outputs = {}
        for name in self.expose:
            value = getattr(self.model, name, None)
            if value is not None:
                outputs[name] = BioSignal(
                    source="tellurium",
                    name=name,
                    value=float(value),
                    time=self.current_time,
                    metadata={"units": "concentration"}
                )
        return outputs

    def set_inputs(self, signals: dict[str, BioSignal]) -> None:
        for name, signal in signals.items():
            if hasattr(self.model, name):
                setattr(self.model, name, signal.value)

    def get_state(self) -> dict:
        return {
            "time": self.current_time,
            "species": {name: getattr(self.model, name) for name in self.expose}
        }

    def reset(self) -> None:
        self.model.reset()
        self.current_time = 0.0
```

**Config example:**

```yaml
modules:
  glycolysis:
    adapter: tellurium
    sbml: "biomodels/BIOMD0000000064.xml"
    expose: [glucose, ATP, pyruvate]
    parameters:
      k1: 0.5
```

### P1: pyNeuroML (NeuroML) - Second Adapter

**Why second:**
- Enables multi-paradigm composition (SBML + NeuroML)
- Python API available
- Access to NeuroML-DB

**Challenges:**
- Different time semantics (event-driven vs continuous)
- Spike data format
- jNeuroML Java dependency for some features

### P2: OpenCOR/CellML - Third Adapter

**Why third:**
- Cardiac/physiology models
- Strong unit system
- Python API limited (may need subprocess)

## Time Synchronization

Each simulator has different time semantics:

| Simulator | Time model | Substeps |
|-----------|------------|----------|
| tellurium | Continuous ODE | Adaptive internal |
| pyNeuroML | Event-driven | Fixed dt typically |
| Mesa | Discrete steps | 1 step = 1 unit |

**TimeBroker pattern:**

```python
class TimeBroker:
    def __init__(self, adapters: list[SimulatorAdapter], sync_interval: float):
        self.adapters = adapters
        self.sync_interval = sync_interval
        self.current_time = 0.0

    def advance_to(self, t_target: float) -> None:
        while self.current_time < t_target:
            next_sync = min(self.current_time + self.sync_interval, t_target)

            # Each adapter advances to sync point
            for adapter in self.adapters:
                adapter.advance_to(next_sync)

            # Exchange signals at sync point
            self._exchange_signals()

            self.current_time = next_sync

    def _exchange_signals(self) -> None:
        # Collect all outputs
        all_signals = {}
        for adapter in self.adapters:
            all_signals.update(adapter.get_outputs())

        # Distribute to connected inputs (based on wiring config)
        for adapter in self.adapters:
            relevant = self._filter_signals_for(adapter, all_signals)
            adapter.set_inputs(relevant)
```

## Acceptance Criteria

### Phase 1: Single Adapter (tellurium)
- [ ] `TelluriumAdapter` implements full contract
- [ ] Can load and run any BioModels SBML file
- [ ] Parameters can be overridden via config
- [ ] Outputs exposed as BioSignals
- [ ] Tests pass for 10+ diverse models
- [ ] Performance: <100ms overhead per simulation

### Phase 2: Multi-Adapter Composition
- [ ] `TimeBroker` synchronizes two adapters
- [ ] BioSignals flow between adapters via wiring
- [ ] Transform functions for unit conversion
- [ ] Demo: SBML metabolism + NeuroML neuron

### Phase 3: Model Database Integration
- [ ] BioModels index synced daily
- [ ] Models searchable by metadata
- [ ] One-click run from browser

## Implementation Plan

### Step 1: Adapter Contract (Week 1)
- Define `SimulatorAdapter` protocol in `bsim.adapters`
- Define `BioSignal` dataclass
- Add to public API

### Step 2: tellurium Adapter (Weeks 2-3)
- Implement `TelluriumAdapter`
- Test with 10 BioModels models
- Document configuration options

### Step 3: TimeBroker (Week 4)
- Implement time synchronization
- Test with tellurium + native bsim module
- Benchmark overhead

### Step 4: pyNeuroML Adapter (Weeks 5-6)
- Implement `NeuroMLAdapter`
- Handle spike data format
- Test composition with tellurium

### Step 5: Integration (Weeks 7-8)
- Wiring config supports adapters
- SimUI displays adapter outputs
- Documentation and examples

## Not Supported (Explicitly)

- Direct SBML/NeuroML parsing in bsim core
- Full standard compliance (we delegate to adapters)
- Real-time performance guarantees
- GPU acceleration (adapter-dependent)

## Dependencies

- `tellurium` (pip install tellurium)
- `pyneuroml` (pip install pyneuroml)
- Future: `opencor` Python bindings

## Test Strategy

### Unit Tests
- Adapter contract compliance
- Signal serialization
- Time synchronization correctness

### Integration Tests
- BioModels model execution
- Multi-adapter composition
- Wiring validation

### Performance Tests
- Overhead benchmarks
- Memory usage
- Sync interval impact

## Document History

- 2026-01-13: Rewrote with adapter-first architecture
- 2026-01-12: Initial draft
