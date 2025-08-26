def test_collect_visuals_empty(bsim):
    world = bsim.BioWorld(solver=bsim.FixedStepSolver())

    class Silent(bsim.BioModule):
        pass

    world.add_biomodule(Silent())
    world.simulate(steps=1, dt=0.1)
    collected = world.collect_visuals()
    assert collected == []


def test_collect_visuals_with_modules(bsim):
    world = bsim.BioWorld(solver=bsim.FixedStepSolver())

    class TS(bsim.BioModule):
        def __init__(self):
            self._points = []

        def on_event(self, event, payload, world):
            if event == bsim.BioWorldEvent.STEP:
                self._points.append([payload["t"], payload["i"]]) if "i" in payload else self._points.append([payload["t"], len(self._points)])

        def visualize(self):
            return {
                "render": "timeseries",
                "data": {"series": [{"name": "i", "points": self._points}]},
            }

    class GraphMod(bsim.BioModule):
        def visualize(self):
            return {
                "render": "graph",
                "data": {"nodes": [{"id": "a"}, {"id": "b"}], "edges": [{"source": "a", "target": "b"}]},
            }

    world.add_biomodule(TS())
    world.add_biomodule(GraphMod())
    world.simulate(steps=2, dt=0.5)

    collected = world.collect_visuals()
    # Expect two entries (one per module) with proper shapes
    assert len(collected) == 2
    kinds = {entry["module"]: entry for entry in collected}
    assert "TS" in kinds and "GraphMod" in kinds
    ts_vis = kinds["TS"]["visuals"][0]
    assert ts_vis["render"] == "timeseries"
    assert "data" in ts_vis
    g_vis = kinds["GraphMod"]["visuals"][0]
    assert g_vis["render"] == "graph"
    assert "data" in g_vis
