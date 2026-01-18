# API: BioModule

BioModule encapsulates behavior with local state. It:
- Implements a runnable contract (`setup/reset/advance_to/...`).
- Receives inputs via `set_inputs(...)` and emits outputs via `get_outputs()`.
- Optionally declares connection ports for validation via `inputs()` and `outputs()`.

Signature (selected)
```python
class BioModule:
    min_dt: float  # required (seconds by default)

    def setup(self, world: BioWorld) -> None: ...
    def reset(self) -> None: ...
    def advance_to(self, t: float) -> None: ...
    def set_inputs(self, inputs: dict[str, BioSignal]) -> None: ...
    def get_outputs(self) -> dict[str, BioSignal]: ...
    def get_state(self) -> dict[str, Any]: ...
    def next_due_time(self, t: float) -> Optional[float]: ...
    def inputs(self) -> set[str]: ...
    def outputs(self) -> set[str]: ...
```

Example with local state
```python
class Eye(bsim.BioModule):
    min_dt = 0.01

    def __init__(self):
        self.photons_seen = 0

    def outputs(self):
        return {"visual_stream"}

    def advance_to(self, t: float) -> None:
        self.photons_seen += 1

    def get_outputs(self):
        return {
            "visual_stream": bsim.BioSignal(
                value={"t": t, "count": self.photons_seen},
                metadata=bsim.SignalMetadata(units="1"),
            )
        }
```

Typical values at runtime
- `t` -> current world time (float)
- `self.photons_seen` after two ticks -> `2`
