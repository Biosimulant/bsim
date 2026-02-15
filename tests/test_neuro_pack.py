"""Tests for the neuro model modules (self-contained in models/models/)."""
from __future__ import annotations

import sys
from pathlib import Path
from types import SimpleNamespace

import pytest

# Add model directories to sys.path so we can import from src.*
_MODELS_DIR = Path(__file__).resolve().parents[2] / "models" / "models"
for _model in ["neuro-poisson-input", "neuro-izhikevich-population"]:
    _p = str(_MODELS_DIR / _model)
    if _p not in sys.path:
        sys.path.insert(0, _p)


@pytest.fixture
def neuro():
    """Provide neuro model classes as a namespace."""
    from src.poisson_input import PoissonInput
    from src.izhikevich import IzhikevichPopulation

    return SimpleNamespace(
        PoissonInput=PoissonInput,
        IzhikevichPopulation=IzhikevichPopulation,
    )


def test_poisson_input_emits_spikes(bsim, neuro):
    world = bsim.BioWorld()
    poisson = neuro.PoissonInput(n=10, rate_hz=100.0, seed=42, min_dt=0.001)
    captured = []

    class SpikeCatcher(bsim.BioModule):
        def __init__(self):
            self.min_dt = 0.001

        def inputs(self):
            return {"spikes"}

        def set_inputs(self, signals):
            if "spikes" in signals:
                captured.append(signals["spikes"].value)

        def advance_to(self, t: float) -> None:
            return

        def get_outputs(self):
            return {}

    catcher = SpikeCatcher()

    world.add_biomodule("poisson", poisson, priority=1)
    world.add_biomodule("catcher", catcher, priority=0)
    world.connect("poisson.spikes", "catcher.spikes")

    world.run(duration=0.01, tick_dt=0.001)

    assert captured
    assert all(isinstance(v, list) for v in captured)


def test_poisson_input_deterministic_seed(bsim, neuro):
    def run_once():
        world = bsim.BioWorld()
        poisson = neuro.PoissonInput(n=10, rate_hz=100.0, seed=123, min_dt=0.001)
        captured = []

        class SpikeCatcher(bsim.BioModule):
            def __init__(self):
                self.min_dt = 0.001

            def inputs(self):
                return {"spikes"}

            def set_inputs(self, signals):
                if "spikes" in signals:
                    captured.append(signals["spikes"].value)

            def advance_to(self, t: float) -> None:
                return

            def get_outputs(self):
                return {}

        catcher = SpikeCatcher()
        world.add_biomodule("poisson", poisson, priority=1)
        world.add_biomodule("catcher", catcher, priority=0)
        world.connect("poisson.spikes", "catcher.spikes")
        world.run(duration=0.01, tick_dt=0.001)
        return captured

    first = run_once()
    second = run_once()
    assert first == second


def test_izhikevich_population_emits_state(bsim, neuro):
    world = bsim.BioWorld()
    neurons = neuro.IzhikevichPopulation(n=5, min_dt=0.001)
    world.add_biomodule("neurons", neurons)
    world.run(duration=0.002, tick_dt=0.001)
    outputs = world.get_outputs("neurons")
    assert "state" in outputs
