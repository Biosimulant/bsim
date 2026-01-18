import pytest


def test_min_dt_required(bsim):
    class BadModule(bsim.BioModule):
        def advance_to(self, t: float) -> None:
            return

        def get_outputs(self):
            return {}

    world = bsim.BioWorld()
    with pytest.raises(ValueError):
        world.add_biomodule("bad", BadModule())


def test_setup_called_and_outputs_available(bsim):
    seen = {"setup": 0}

    class TestModule(bsim.BioModule):
        def __init__(self):
            self.min_dt = 0.1
            self._outputs = {}

        def setup(self, config=None):
            seen["setup"] += 1

        def advance_to(self, t: float) -> None:
            self._outputs = {"out": bsim.BioSignal(source="test", name="out", value=t, time=t)}

        def get_outputs(self):
            return dict(self._outputs)

    world = bsim.BioWorld()
    world.add_biomodule("test", TestModule())
    world.run(duration=0.1, tick_dt=0.1)

    assert seen["setup"] == 1
    outputs = world.get_outputs("test")
    assert "out" in outputs
