import pytest


def test_port_validation_success_with_declared_ports(bsim):
    class Eye(bsim.BioModule):
        def __init__(self):
            self.min_dt = 0.1
            self._outputs = {}

        def outputs(self):
            return {"visual_stream"}

        def advance_to(self, t: float) -> None:
            self._outputs = {"visual_stream": bsim.BioSignal(source="eye", name="visual_stream", value=t, time=t)}

        def get_outputs(self):
            return dict(self._outputs)

    class LGN(bsim.BioModule):
        def __init__(self):
            self.min_dt = 0.1

        def inputs(self):
            return {"retina"}

        def advance_to(self, t: float) -> None:
            return

        def get_outputs(self):
            return {}

    world = bsim.BioWorld()
    wb = bsim.WiringBuilder(world)
    wb.add("eye", Eye()).add("lgn", LGN())
    wb.connect("eye.visual_stream", ["lgn.retina"]).apply()
    world.run(duration=0.1, tick_dt=0.1)


def test_port_validation_raises_for_unknown_output(bsim):
    class Eye(bsim.BioModule):
        def __init__(self):
            self.min_dt = 0.1

        def outputs(self):
            return {"visual_stream"}

        def advance_to(self, t: float) -> None:
            return

        def get_outputs(self):
            return {}

    class LGN(bsim.BioModule):
        def __init__(self):
            self.min_dt = 0.1

        def inputs(self):
            return {"retina"}

        def advance_to(self, t: float) -> None:
            return

        def get_outputs(self):
            return {}

    world = bsim.BioWorld()
    wb = bsim.WiringBuilder(world)
    wb.add("eye", Eye()).add("lgn", LGN())

    with pytest.raises(ValueError):
        wb.connect("eye.nope", ["lgn.retina"]).apply()


def test_port_validation_raises_for_unknown_input(bsim):
    class Eye(bsim.BioModule):
        def __init__(self):
            self.min_dt = 0.1

        def outputs(self):
            return {"visual_stream"}

        def advance_to(self, t: float) -> None:
            return

        def get_outputs(self):
            return {}

    class LGN(bsim.BioModule):
        def __init__(self):
            self.min_dt = 0.1

        def inputs(self):
            return {"retina"}

        def advance_to(self, t: float) -> None:
            return

        def get_outputs(self):
            return {}

    world = bsim.BioWorld()
    wb = bsim.WiringBuilder(world)
    wb.add("eye", Eye()).add("lgn", LGN())

    with pytest.raises(ValueError):
        wb.connect("eye.visual_stream", ["lgn.unknown"]).apply()


def test_port_routing_supports_dst_port_mapping(bsim):
    received = {"count": 0}

    class Src(bsim.BioModule):
        def __init__(self):
            self.min_dt = 0.1
            self._outputs = {}

        def outputs(self):
            return {"out_port"}

        def advance_to(self, t: float) -> None:
            self._outputs = {"out_port": bsim.BioSignal(source="src", name="out_port", value=t, time=t)}

        def get_outputs(self):
            return dict(self._outputs)

    class Dst(bsim.BioModule):
        def __init__(self):
            self.min_dt = 0.1

        def inputs(self):
            return {"in_port"}

        def set_inputs(self, signals):
            if "in_port" in signals:
                received["count"] += 1

        def advance_to(self, t: float) -> None:
            return

        def get_outputs(self):
            return {}

    world = bsim.BioWorld()
    wb = bsim.WiringBuilder(world)
    wb.add("src", Src()).add("dst", Dst())

    wb.connect("src.out_port", ["dst.in_port"]).apply()
    world.run(duration=0.3, tick_dt=0.1)

    assert received["count"] >= 1
