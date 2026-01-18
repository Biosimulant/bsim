def test_exports(bsim):
    assert hasattr(bsim, "__version__")
    assert hasattr(bsim, "BioWorld")
    assert hasattr(bsim, "WorldEvent")
    assert hasattr(bsim, "BioSignal")
