import pytest


def test_event_flow_with_custom_solver(bsim, custom_solver):
    world = bsim.BioWorld(solver=custom_solver)
    events = []

    def listener(ev, payload):
        events.append((ev, payload))

    world.on(listener)
    result = world.simulate(steps=3, dt=0.5)

    assert result["steps"] == 3
    assert result["time"] == pytest.approx(1.5)

    assert len(events) >= 5
    assert events[0][0] == bsim.BioWorldEvent.LOADED
    assert events[1][0] == bsim.BioWorldEvent.BEFORE_SIMULATION
    step_events = [e for e in events if e[0] == bsim.BioWorldEvent.STEP]
    assert len(step_events) == 3
    assert [p["i"] for _, p in step_events] == [0, 1, 2]
    assert [p["t"] for _, p in step_events] == [0.5, 1.0, 1.5]
    assert events[-1][0] == bsim.BioWorldEvent.AFTER_SIMULATION


def test_ready_made_fixed_step_solver(bsim):
    world = bsim.BioWorld(solver=bsim.FixedStepSolver())
    steps = []

    def listener(ev, payload):
        if ev == bsim.BioWorldEvent.STEP:
            steps.append(payload["t"])

    world.on(listener)
    result = world.simulate(steps=2, dt=0.1)
    assert steps == [0.1, 0.2]
    assert result["steps"] == 2
    assert result["time"] == pytest.approx(0.2)


def test_request_stop_stops_cleanly_and_still_emits_after_simulation(bsim):
    class CountingSolver(bsim.Solver):
        def simulate(self, *, steps: int, dt: float, emit):
            t = 0.0
            for i in range(steps):
                t += dt
                emit(bsim.BioWorldEvent.STEP, {"i": i, "t": t})
            return {"time": t, "steps": steps}

    world = bsim.BioWorld(solver=CountingSolver())
    seen = []

    def listener(ev, payload):
        seen.append(ev)
        if ev == bsim.BioWorldEvent.STEP and payload.get("i") == 0:
            world.request_stop()

    world.on(listener)
    result = world.simulate(steps=5, dt=0.1)

    assert result is None
    assert bsim.BioWorldEvent.BEFORE_SIMULATION in seen
    assert bsim.BioWorldEvent.AFTER_SIMULATION in seen
    assert bsim.BioWorldEvent.ERROR not in seen


def test_request_pause_blocks_until_resume(bsim):
    import threading
    import time

    about_to_emit_step_1 = threading.Event()
    done = threading.Event()
    result_holder = {}
    exc_holder = []

    class PausableSolver(bsim.Solver):
        def simulate(self, *, steps: int, dt: float, emit):
            t = 0.0
            for i in range(steps):
                if i == 1:
                    about_to_emit_step_1.set()
                t += dt
                emit(bsim.BioWorldEvent.STEP, {"i": i, "t": t})
            return {"time": t, "steps": steps}

    world = bsim.BioWorld(solver=PausableSolver())

    def listener(ev, payload):
        if ev == bsim.BioWorldEvent.STEP and payload.get("i") == 0:
            world.request_pause()

    world.on(listener)

    def _run():
        try:
            result_holder["result"] = world.simulate(steps=3, dt=0.1)
        except Exception as exc:  # pragma: no cover
            exc_holder.append(exc)
        finally:
            done.set()

    t = threading.Thread(target=_run, daemon=True)
    t.start()

    assert about_to_emit_step_1.wait(timeout=1.0)
    time.sleep(0.05)
    assert not done.is_set()

    world.request_resume()
    assert done.wait(timeout=2.0)
    assert not exc_holder
    assert result_holder["result"]["steps"] == 3
