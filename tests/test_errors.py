import pytest


def test_error_event_and_finished_emitted(bsim):
    class Boom(bsim.BioModule):
        def __init__(self):
            self.min_dt = 0.1

        def advance_to(self, t: float) -> None:
            raise RuntimeError("boom")

        def get_outputs(self):
            return {}

    world = bsim.BioWorld()
    world.add_biomodule("boom", Boom())
    seen = []

    def listener(ev, _payload):
        seen.append(ev)

    world.on(listener)
    with pytest.raises(RuntimeError):
        world.run(duration=0.1, tick_dt=0.1)

    assert bsim.WorldEvent.ERROR in seen
    assert bsim.WorldEvent.FINISHED in seen
