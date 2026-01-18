from pathlib import Path


def test_world_load_wiring_example_file(bsim):
    world = bsim.BioWorld()
    bsim.load_wiring(world, str(Path("examples/configs/brain.toml")))
    world.run(duration=0.1, tick_dt=0.1)
