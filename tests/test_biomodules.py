import pytest


def test_module_receives_only_subscribed_events(bsim, custom_solver):
    world = bsim.BioWorld(solver=custom_solver)
    seen = []

    class OnlyStep(bsim.BioModule):
        def subscriptions(self):
            return {bsim.BioWorldEvent.STEP}

        def on_event(self, event, payload, world):
            seen.append(event)

    world.add_biomodule(OnlyStep())
    world.simulate(steps=2, dt=0.1)

    assert seen
    assert all(ev == bsim.BioWorldEvent.STEP for ev in seen)


def test_module_with_no_subscriptions_receives_all_events(bsim):
    world = bsim.BioWorld(solver=bsim.FixedStepSolver())
    seen = []

    class AllEvents(bsim.BioModule):
        def on_event(self, event, payload, world):
            seen.append(event)

    world.add_biomodule(AllEvents())
    world.simulate(steps=1, dt=0.1)

    # Expect LOADED, BEFORE_SIMULATION, STEP, AFTER_SIMULATION at minimum
    assert bsim.BioWorldEvent.LOADED in seen
    assert bsim.BioWorldEvent.BEFORE_SIMULATION in seen
    assert bsim.BioWorldEvent.STEP in seen
    assert bsim.BioWorldEvent.AFTER_SIMULATION in seen


def test_remove_module_stops_receiving_events(bsim):
    world = bsim.BioWorld(solver=bsim.FixedStepSolver())
    seen = []

    class Collector(bsim.BioModule):
        def on_event(self, event, payload, world):
            seen.append(event)

    m = Collector()
    world.add_biomodule(m)
    world.remove_biomodule(m)
    world.simulate(steps=1, dt=0.1)

    assert seen == []
