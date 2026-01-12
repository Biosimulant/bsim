# Quickstart

Install
- Create a virtualenv and install dev tools (zsh-safe):
  - `pip install -e '.[dev]'`

Run an example
- Version check: `python examples/basic_usage.py`
- World, events, and biosignals: `python examples/world_simulation.py`
- Declarative wiring (code): `python examples/wiring_builder_demo.py`
- Declarative wiring (files):
  - Today (Python): load a YAML/TOML wiring spec and run:
    - `python -c "import bsim; w=bsim.BioWorld(solver=bsim.FixedStepSolver()); w.load_wiring('examples/configs/brain.yaml'); print(w.simulate(steps=5, dt=0.1))"`
  - Planned (CLI): `bsim-run --wiring ... --steps ... --dt ...` (see `tasks/epics/05-cli.md`)

Minimal code
```python
import bsim

class Eye(bsim.BioModule):
    def subscriptions(self):
        return {bsim.BioWorldEvent.STEP}
    def on_event(self, event, payload, world):
        world.publish_biosignal(self, topic="visual_stream", payload={"t": payload.get("t")})

class LGN(bsim.BioModule):
    def on_signal(self, topic, payload, source, world):
        if topic == "visual_stream":
            world.publish_biosignal(self, topic="thalamus", payload=payload)

world = bsim.BioWorld(solver=bsim.FixedStepSolver())
wb = bsim.WiringBuilder(world)
wb.add("eye", Eye()).add("lgn", LGN())
wb.connect("eye.out.visual_stream", ["lgn.in.retina"]).apply()
print(world.describe_wiring())  # [('Eye', 'visual_stream', 'LGN')]
print(world.simulate(steps=2, dt=0.1))  # {'steps': 2, 'time': 0.2}
```

## SimUI: Per‑run resets for clean visuals

When using the SimUI, each new Run starts with a clean slate:

- The solver state is reinitialized from its initial state.
- The backend clears its event buffer and last-step snapshot.
- The frontend clears visuals and events before posting `/api/run`.
- Additionally, if your modules keep their own history (e.g., points for a chart), implement an optional `reset()` method on the module. The world will call `reset()` on each module before every run.

Example:

```python
class SineWave(bsim.BioModule):
    def __init__(self):
        self.points = []

    def on_event(self, event, payload, world):
        if event == bsim.BioWorldEvent.STEP:
            t = payload.get("t", 0.0)
            self.points.append([t, math.sin(t)])

    def reset(self):
        # Clear history between runs so charts don’t overlap
        self.points = []
```
