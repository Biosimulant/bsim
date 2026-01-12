"""Tests for the neuro pack modules."""
from __future__ import annotations

import pytest


@pytest.fixture
def neuro(bsim):
    """Import neuro pack modules."""
    from bsim.packs import neuro
    return neuro


class TestPoissonInput:
    """Tests for PoissonInput module."""

    def test_emits_spikes_with_fixed_seed(self, bsim, neuro):
        """PoissonInput emits deterministic spikes with a fixed seed."""
        world = bsim.BioWorld(solver=bsim.FixedStepSolver())

        # Create PoissonInput with fixed seed
        poisson = neuro.PoissonInput(n=10, rate_hz=100.0, seed=42)
        world.add_biomodule(poisson)

        # Capture emitted spikes
        captured_spikes = []

        class SpikeCatcher(bsim.BioModule):
            def inputs(self):
                return {"spikes"}

            def on_signal(self, topic, payload, source, world):
                if topic == "spikes":
                    captured_spikes.append(payload)

        catcher = SpikeCatcher()
        world.add_biomodule(catcher)
        world.connect_biomodules(poisson, "spikes", catcher)

        world.simulate(steps=100, dt=0.001)

        # Should have captured spike payloads
        assert len(captured_spikes) > 0
        # Each payload should have 't' and 'ids'
        for payload in captured_spikes:
            assert "t" in payload
            assert "ids" in payload
            assert isinstance(payload["ids"], list)

        # Run again with same seed - should get same results
        world2 = bsim.BioWorld(solver=bsim.FixedStepSolver())
        poisson2 = neuro.PoissonInput(n=10, rate_hz=100.0, seed=42)
        world2.add_biomodule(poisson2)

        captured_spikes2 = []

        class SpikeCatcher2(bsim.BioModule):
            def inputs(self):
                return {"spikes"}

            def on_signal(self, topic, payload, source, world):
                if topic == "spikes":
                    captured_spikes2.append(payload)

        catcher2 = SpikeCatcher2()
        world2.add_biomodule(catcher2)
        world2.connect_biomodules(poisson2, "spikes", catcher2)

        world2.simulate(steps=100, dt=0.001)

        # Should be identical
        assert len(captured_spikes) == len(captured_spikes2)
        for p1, p2 in zip(captured_spikes, captured_spikes2):
            assert p1["ids"] == p2["ids"]

    def test_declares_outputs(self, bsim, neuro):
        """PoissonInput declares 'spikes' as output."""
        poisson = neuro.PoissonInput()
        assert "spikes" in poisson.outputs()
        assert len(poisson.inputs()) == 0


class TestStepCurrent:
    """Tests for StepCurrent module."""

    def test_emits_constant_current(self, bsim, neuro):
        """StepCurrent emits constant current on each step."""
        world = bsim.BioWorld(solver=bsim.FixedStepSolver())

        dc = neuro.StepCurrent(I=15.0)
        world.add_biomodule(dc)

        captured = []

        class CurrentCatcher(bsim.BioModule):
            def inputs(self):
                return {"current"}

            def on_signal(self, topic, payload, source, world):
                if topic == "current":
                    captured.append(payload)

        catcher = CurrentCatcher()
        world.add_biomodule(catcher)
        world.connect_biomodules(dc, "current", catcher)

        world.simulate(steps=5, dt=0.1)

        assert len(captured) == 5
        for payload in captured:
            assert payload["I"] == 15.0
            assert "t" in payload

    def test_scheduled_current(self, bsim, neuro):
        """StepCurrent uses schedule for time-varying current."""
        world = bsim.BioWorld(solver=bsim.FixedStepSolver())

        # Default 0, then 20 during [0.2, 0.4)
        dc = neuro.StepCurrent(I=0.0, schedule=[(0.2, 0.4, 20.0)])
        world.add_biomodule(dc)

        captured = []

        class CurrentCatcher(bsim.BioModule):
            def inputs(self):
                return {"current"}

            def on_signal(self, topic, payload, source, world):
                if topic == "current":
                    captured.append(payload)

        catcher = CurrentCatcher()
        world.add_biomodule(catcher)
        world.connect_biomodules(dc, "current", catcher)

        world.simulate(steps=5, dt=0.1)

        # t=0.1, 0.2, 0.3, 0.4, 0.5
        currents = [p["I"] for p in captured]
        assert currents[0] == 0.0  # t=0.1
        assert currents[1] == 20.0  # t=0.2 (in range)
        assert currents[2] == 20.0  # t=0.3 (in range)
        assert currents[3] == 0.0  # t=0.4 (out of range)
        assert currents[4] == 0.0  # t=0.5


class TestIzhikevichPopulation:
    """Tests for IzhikevichPopulation module."""

    def test_spikes_under_strong_current(self, bsim, neuro):
        """IzhikevichPopulation produces spikes under strong constant current."""
        world = bsim.BioWorld(solver=bsim.FixedStepSolver())

        # Create neuron with high bias current to ensure spiking
        neuron = neuro.IzhikevichPopulation(n=1, preset="RS", I_bias=20.0)
        world.add_biomodule(neuron)

        spikes = []

        class SpikeCatcher(bsim.BioModule):
            def inputs(self):
                return {"spikes"}

            def on_signal(self, topic, payload, source, world):
                if topic == "spikes" and payload.get("ids"):
                    spikes.append(payload)

        catcher = SpikeCatcher()
        world.add_biomodule(catcher)
        world.connect_biomodules(neuron, "spikes", catcher)

        # Run for 500ms at 0.1ms steps
        world.simulate(steps=5000, dt=0.0001)

        # Should have produced spikes
        assert len(spikes) > 0
        # Check spike payload structure
        assert all("t" in s and "ids" in s for s in spikes)

    def test_accepts_current_input(self, bsim, neuro):
        """IzhikevichPopulation accepts current signals."""
        world = bsim.BioWorld(solver=bsim.FixedStepSolver())

        neuron = neuro.IzhikevichPopulation(n=5, preset="RS")
        current = neuro.StepCurrent(I=15.0)

        world.add_biomodule(current)
        world.add_biomodule(neuron)
        world.connect_biomodules(current, "current", neuron)

        spikes = []

        class SpikeCatcher(bsim.BioModule):
            def inputs(self):
                return {"spikes"}

            def on_signal(self, topic, payload, source, world):
                if topic == "spikes" and payload.get("ids"):
                    spikes.append(payload)

        catcher = SpikeCatcher()
        world.add_biomodule(catcher)
        world.connect_biomodules(neuron, "spikes", catcher)

        world.simulate(steps=5000, dt=0.0001)

        # Should have spikes from the injected current
        assert len(spikes) > 0

    def test_emits_state(self, bsim, neuro):
        """IzhikevichPopulation emits state signals."""
        world = bsim.BioWorld(solver=bsim.FixedStepSolver())

        neuron = neuro.IzhikevichPopulation(n=3, preset="RS", sample_indices=[0, 1])
        world.add_biomodule(neuron)

        states = []

        class StateCatcher(bsim.BioModule):
            def inputs(self):
                return {"state"}

            def on_signal(self, topic, payload, source, world):
                if topic == "state":
                    states.append(payload)

        catcher = StateCatcher()
        world.add_biomodule(catcher)
        world.connect_biomodules(neuron, "state", catcher)

        world.simulate(steps=10, dt=0.001)

        # Should have state for each step
        assert len(states) == 10
        for state in states:
            assert "t" in state
            assert "indices" in state
            assert "v" in state
            assert "u" in state
            assert len(state["indices"]) == 2  # sample_indices=[0,1]

    def test_presets_available(self, neuro):
        """All documented presets are available."""
        expected = ["RS", "FS", "Bursting", "Chattering", "LTS"]
        for name in expected:
            assert name in neuro.PRESETS
            preset = neuro.PRESETS[name]
            assert hasattr(preset, "a")
            assert hasattr(preset, "b")
            assert hasattr(preset, "c")
            assert hasattr(preset, "d")


class TestExpSynapseCurrent:
    """Tests for ExpSynapseCurrent module."""

    def test_produces_current_of_correct_shape(self, bsim, neuro):
        """ExpSynapseCurrent produces per-neuron current vector."""
        world = bsim.BioWorld(solver=bsim.FixedStepSolver())

        syn = neuro.ExpSynapseCurrent(
            n_pre=10, n_post=5, p_connect=1.0, weight=1.0, tau=0.01, seed=42
        )
        world.add_biomodule(syn)

        currents = []

        class CurrentCatcher(bsim.BioModule):
            def inputs(self):
                return {"current"}

            def on_signal(self, topic, payload, source, world):
                if topic == "current":
                    currents.append(payload)

        catcher = CurrentCatcher()
        world.add_biomodule(catcher)
        world.connect_biomodules(syn, "current", catcher)

        # Inject spikes
        class SpikeSource(bsim.BioModule):
            def subscriptions(self):
                return {bsim.BioWorldEvent.STEP}

            def outputs(self):
                return {"spikes"}

            def on_event(self, event, payload, world):
                if event == bsim.BioWorldEvent.STEP:
                    # Emit spikes from neurons 0-4
                    world.publish_biosignal(
                        self, "spikes", {"t": payload.get("t", 0), "ids": [0, 1, 2, 3, 4]}
                    )

        source = SpikeSource()
        world.add_biomodule(source)
        world.connect_biomodules(source, "spikes", syn)

        world.simulate(steps=10, dt=0.001)

        # Should have current outputs
        assert len(currents) > 0
        for c in currents:
            assert "t" in c
            assert "I" in c
            assert isinstance(c["I"], list)
            assert len(c["I"]) == 5  # n_post = 5

    def test_decays_over_steps(self, bsim, neuro):
        """ExpSynapseCurrent decays current exponentially over steps."""
        world = bsim.BioWorld(solver=bsim.FixedStepSolver())

        syn = neuro.ExpSynapseCurrent(
            n_pre=1, n_post=1, p_connect=1.0, weight=10.0, tau=0.01, seed=42
        )
        world.add_biomodule(syn)

        currents = []

        class CurrentCatcher(bsim.BioModule):
            def inputs(self):
                return {"current"}

            def on_signal(self, topic, payload, source, world):
                if topic == "current":
                    currents.append(payload["I"][0])

        catcher = CurrentCatcher()
        world.add_biomodule(catcher)
        world.connect_biomodules(syn, "current", catcher)

        # Inject a single spike at the beginning
        spike_sent = [False]

        class SingleSpike(bsim.BioModule):
            def subscriptions(self):
                return {bsim.BioWorldEvent.STEP}

            def outputs(self):
                return {"spikes"}

            def on_event(self, event, payload, world):
                if event == bsim.BioWorldEvent.STEP and not spike_sent[0]:
                    spike_sent[0] = True
                    world.publish_biosignal(
                        self, "spikes", {"t": payload.get("t", 0), "ids": [0]}
                    )

        source = SingleSpike()
        world.add_biomodule(source)
        world.connect_biomodules(source, "spikes", syn)

        world.simulate(steps=20, dt=0.001)

        # Current should decay
        # First value after spike should be highest, then decay
        assert len(currents) >= 10
        # After initial spike, current should generally decrease
        max_idx = currents.index(max(currents))
        # Values after max should be decreasing (allowing for some noise)
        later_values = currents[max_idx + 1:max_idx + 5]
        if len(later_values) >= 2:
            assert later_values[0] > later_values[-1]


class TestSpikeMonitor:
    """Tests for SpikeMonitor module."""

    def test_produces_image_visual(self, bsim, neuro):
        """SpikeMonitor produces an image VisualSpec with data.src."""
        world = bsim.BioWorld(solver=bsim.FixedStepSolver())

        monitor = neuro.SpikeMonitor(max_neurons=10, width=400, height=200)
        world.add_biomodule(monitor)

        # Feed some spikes
        class SpikeSource(bsim.BioModule):
            def subscriptions(self):
                return {bsim.BioWorldEvent.STEP}

            def outputs(self):
                return {"spikes"}

            def on_event(self, event, payload, world):
                if event == bsim.BioWorldEvent.STEP:
                    t = payload.get("t", 0)
                    world.publish_biosignal(
                        self, "spikes", {"t": t, "ids": [0, 5, 9]}
                    )

        source = SpikeSource()
        world.add_biomodule(source)
        world.connect_biomodules(source, "spikes", monitor)

        world.simulate(steps=10, dt=0.01)

        visuals = world.collect_visuals()
        assert len(visuals) == 1  # Only SpikeMonitor has visuals
        assert visuals[0]["module"] == "SpikeMonitor"

        visual = visuals[0]["visuals"][0]
        assert visual["render"] == "image"
        assert "src" in visual["data"]
        assert visual["data"]["src"].startswith("data:image/svg+xml")

    def test_empty_raster(self, bsim, neuro):
        """SpikeMonitor handles no spikes gracefully."""
        world = bsim.BioWorld(solver=bsim.FixedStepSolver())

        monitor = neuro.SpikeMonitor()
        world.add_biomodule(monitor)

        world.simulate(steps=5, dt=0.01)

        visuals = world.collect_visuals()
        assert len(visuals) == 1
        visual = visuals[0]["visuals"][0]
        assert visual["render"] == "image"
        assert "src" in visual["data"]


class TestRateMonitor:
    """Tests for RateMonitor module."""

    def test_produces_timeseries_visual(self, bsim, neuro):
        """RateMonitor produces a timeseries VisualSpec."""
        world = bsim.BioWorld(solver=bsim.FixedStepSolver())

        monitor = neuro.RateMonitor(window_size=0.01, n_neurons=10)
        world.add_biomodule(monitor)

        # Feed spikes
        class SpikeSource(bsim.BioModule):
            def subscriptions(self):
                return {bsim.BioWorldEvent.STEP}

            def outputs(self):
                return {"spikes"}

            def on_event(self, event, payload, world):
                if event == bsim.BioWorldEvent.STEP:
                    t = payload.get("t", 0)
                    world.publish_biosignal(self, "spikes", {"t": t, "ids": [0, 1, 2]})

        source = SpikeSource()
        world.add_biomodule(source)
        world.connect_biomodules(source, "spikes", monitor)

        world.simulate(steps=10, dt=0.001)

        visuals = world.collect_visuals()
        assert len(visuals) == 1
        visual = visuals[0]["visuals"][0]
        assert visual["render"] == "timeseries"
        assert "series" in visual["data"]
        assert len(visual["data"]["series"]) > 0


class TestStateMonitor:
    """Tests for StateMonitor module."""

    def test_produces_timeseries_visual(self, bsim, neuro):
        """StateMonitor produces a timeseries VisualSpec."""
        world = bsim.BioWorld(solver=bsim.FixedStepSolver())

        monitor = neuro.StateMonitor()
        world.add_biomodule(monitor)

        # Feed state
        class StateSource(bsim.BioModule):
            def subscriptions(self):
                return {bsim.BioWorldEvent.STEP}

            def outputs(self):
                return {"state"}

            def on_event(self, event, payload, world):
                if event == bsim.BioWorldEvent.STEP:
                    t = payload.get("t", 0)
                    world.publish_biosignal(
                        self,
                        "state",
                        {"t": t, "indices": [0, 1], "v": [-65.0 + t, -60.0 + t], "u": [0.0, 0.0]},
                    )

        source = StateSource()
        world.add_biomodule(source)
        world.connect_biomodules(source, "state", monitor)

        world.simulate(steps=10, dt=0.01)

        visuals = world.collect_visuals()
        assert len(visuals) == 1
        visual = visuals[0]["visuals"][0]
        assert visual["render"] == "timeseries"
        assert "series" in visual["data"]
        # Should have traces for both neurons
        assert len(visual["data"]["series"]) == 2


class TestNeuroMetrics:
    """Tests for NeuroMetrics module."""

    def test_produces_table_visual(self, bsim, neuro):
        """NeuroMetrics produces a table VisualSpec."""
        world = bsim.BioWorld(solver=bsim.FixedStepSolver())

        monitor = neuro.NeuroMetrics(n_neurons=10)
        world.add_biomodule(monitor)

        # Feed spikes
        class SpikeSource(bsim.BioModule):
            def subscriptions(self):
                return {bsim.BioWorldEvent.STEP}

            def outputs(self):
                return {"spikes"}

            def on_event(self, event, payload, world):
                if event == bsim.BioWorldEvent.STEP:
                    t = payload.get("t", 0)
                    world.publish_biosignal(self, "spikes", {"t": t, "ids": [0, 1]})

        source = SpikeSource()
        world.add_biomodule(source)
        world.connect_biomodules(source, "spikes", monitor)

        world.simulate(steps=10, dt=0.01)

        visuals = world.collect_visuals()
        assert len(visuals) == 1
        visual = visuals[0]["visuals"][0]
        assert visual["render"] == "table"
        assert "columns" in visual["data"]
        assert "rows" in visual["data"]
        # Should have expected metrics
        columns = visual["data"]["columns"]
        assert columns == ["Metric", "Value"]


class TestWiringIntegration:
    """Integration tests for wiring neuro modules."""

    def test_single_neuron_wiring(self, bsim, neuro):
        """Test wiring a single neuron setup."""
        world = bsim.BioWorld(solver=bsim.FixedStepSolver())

        current = neuro.StepCurrent(I=10.0)
        neuron = neuro.IzhikevichPopulation(n=1, preset="RS")
        spike_mon = neuro.SpikeMonitor(max_neurons=1)
        state_mon = neuro.StateMonitor()
        metrics = neuro.NeuroMetrics(n_neurons=1)

        wb = bsim.WiringBuilder(world)
        wb.add("current", current)
        wb.add("neuron", neuron)
        wb.add("spike_mon", spike_mon)
        wb.add("state_mon", state_mon)
        wb.add("metrics", metrics)

        wb.connect("current.out.current", ["neuron.in.current"])
        wb.connect("neuron.out.spikes", ["spike_mon.in.spikes", "metrics.in.spikes"])
        wb.connect("neuron.out.state", ["state_mon.in.state"])
        wb.apply()

        # Run simulation
        result = world.simulate(steps=1000, dt=0.0001)
        assert result is not None

        # Collect visuals
        visuals = world.collect_visuals()
        module_names = [v["module"] for v in visuals]

        assert "SpikeMonitor" in module_names
        assert "StateMonitor" in module_names
        assert "NeuroMetrics" in module_names

    def test_e_i_network_wiring(self, bsim, neuro):
        """Test wiring an E/I network."""
        world = bsim.BioWorld(solver=bsim.FixedStepSolver())

        # Small network for fast test
        poisson = neuro.PoissonInput(n=10, rate_hz=50.0, seed=42)
        exc = neuro.IzhikevichPopulation(n=10, preset="RS", I_bias=5.0)
        inh = neuro.IzhikevichPopulation(n=5, preset="FS", I_bias=5.0)

        syn_ext = neuro.ExpSynapseCurrent(
            n_pre=10, n_post=10, p_connect=0.3, weight=1.0, tau=0.005, seed=42
        )
        syn_ei = neuro.ExpSynapseCurrent(
            n_pre=10, n_post=5, p_connect=0.3, weight=0.5, tau=0.005, seed=43
        )
        syn_ie = neuro.ExpSynapseCurrent(
            n_pre=5, n_post=10, p_connect=0.3, weight=-1.0, tau=0.01, seed=44
        )

        spike_mon = neuro.SpikeMonitor(max_neurons=15)
        metrics = neuro.NeuroMetrics(n_neurons=15)

        wb = bsim.WiringBuilder(world)
        wb.add("poisson", poisson)
        wb.add("exc", exc)
        wb.add("inh", inh)
        wb.add("syn_ext", syn_ext)
        wb.add("syn_ei", syn_ei)
        wb.add("syn_ie", syn_ie)
        wb.add("spike_mon", spike_mon)
        wb.add("metrics", metrics)

        wb.connect("poisson.out.spikes", ["syn_ext.in.spikes"])
        wb.connect("syn_ext.out.current", ["exc.in.current"])
        wb.connect("exc.out.spikes", ["syn_ei.in.spikes", "spike_mon.in.spikes", "metrics.in.spikes"])
        wb.connect("syn_ei.out.current", ["inh.in.current"])
        wb.connect("inh.out.spikes", ["syn_ie.in.spikes", "spike_mon.in.spikes"])
        wb.connect("syn_ie.out.current", ["exc.in.current"])
        wb.apply()

        # Run simulation
        result = world.simulate(steps=500, dt=0.0001)
        assert result is not None

        # Should have some activity
        visuals = world.collect_visuals()
        assert len(visuals) > 0


class TestVisualSpecValidation:
    """Tests for VisualSpec contract compliance."""

    def test_image_visual_has_data_src(self, bsim, neuro):
        """Image visuals must have data.src (not url/base64 keys)."""
        world = bsim.BioWorld(solver=bsim.FixedStepSolver())

        monitor = neuro.SpikeMonitor()
        world.add_biomodule(monitor)

        # Feed spikes
        class SpikeSource(bsim.BioModule):
            def subscriptions(self):
                return {bsim.BioWorldEvent.STEP}

            def outputs(self):
                return {"spikes"}

            def on_event(self, event, payload, world):
                if event == bsim.BioWorldEvent.STEP:
                    world.publish_biosignal(self, "spikes", {"t": payload.get("t", 0), "ids": [0]})

        source = SpikeSource()
        world.add_biomodule(source)
        world.connect_biomodules(source, "spikes", monitor)

        world.simulate(steps=5, dt=0.01)

        visuals = world.collect_visuals()
        visual = visuals[0]["visuals"][0]

        # Must have 'src' key
        assert "src" in visual["data"]
        # Must NOT have 'url' or 'base64' keys (contract violation)
        assert "url" not in visual["data"]
        assert "base64" not in visual["data"]

    def test_timeseries_visual_shape(self, bsim, neuro):
        """Timeseries visuals must have correct shape."""
        world = bsim.BioWorld(solver=bsim.FixedStepSolver())

        monitor = neuro.RateMonitor()
        world.add_biomodule(monitor)

        class SpikeSource(bsim.BioModule):
            def subscriptions(self):
                return {bsim.BioWorldEvent.STEP}

            def outputs(self):
                return {"spikes"}

            def on_event(self, event, payload, world):
                if event == bsim.BioWorldEvent.STEP:
                    world.publish_biosignal(self, "spikes", {"t": payload.get("t", 0), "ids": [0]})

        source = SpikeSource()
        world.add_biomodule(source)
        world.connect_biomodules(source, "spikes", monitor)

        world.simulate(steps=5, dt=0.01)

        visuals = world.collect_visuals()
        visual = visuals[0]["visuals"][0]

        assert visual["render"] == "timeseries"
        assert "series" in visual["data"]
        for series in visual["data"]["series"]:
            assert "name" in series
            assert "points" in series
            # Points should be [t, value] pairs
            for point in series["points"]:
                assert len(point) == 2

    def test_table_visual_shape(self, bsim, neuro):
        """Table visuals must have correct shape."""
        world = bsim.BioWorld(solver=bsim.FixedStepSolver())

        monitor = neuro.NeuroMetrics()
        world.add_biomodule(monitor)

        world.simulate(steps=5, dt=0.01)

        visuals = world.collect_visuals()
        visual = visuals[0]["visuals"][0]

        assert visual["render"] == "table"
        assert "columns" in visual["data"]
        assert "rows" in visual["data"]
        assert isinstance(visual["data"]["columns"], list)
        assert isinstance(visual["data"]["rows"], list)

    def test_visuals_are_json_serializable(self, bsim, neuro):
        """All visuals must be JSON-serializable."""
        import json

        world = bsim.BioWorld(solver=bsim.FixedStepSolver())

        # Add all monitor types
        spike_mon = neuro.SpikeMonitor()
        rate_mon = neuro.RateMonitor()
        state_mon = neuro.StateMonitor()
        metrics = neuro.NeuroMetrics()

        for m in [spike_mon, rate_mon, state_mon, metrics]:
            world.add_biomodule(m)

        # Feed data
        class DataSource(bsim.BioModule):
            def subscriptions(self):
                return {bsim.BioWorldEvent.STEP}

            def outputs(self):
                return {"spikes", "state"}

            def on_event(self, event, payload, world):
                if event == bsim.BioWorldEvent.STEP:
                    t = payload.get("t", 0)
                    world.publish_biosignal(self, "spikes", {"t": t, "ids": [0, 1]})
                    world.publish_biosignal(self, "state", {"t": t, "indices": [0], "v": [-65.0], "u": [0.0]})

        source = DataSource()
        world.add_biomodule(source)
        world.connect_biomodules(source, "spikes", spike_mon)
        world.connect_biomodules(source, "spikes", rate_mon)
        world.connect_biomodules(source, "spikes", metrics)
        world.connect_biomodules(source, "state", state_mon)

        world.simulate(steps=10, dt=0.01)

        visuals = world.collect_visuals()

        # Should be JSON-serializable
        json_str = json.dumps(visuals)
        assert isinstance(json_str, str)
        assert len(json_str) > 0
