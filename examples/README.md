Examples
========

- basic_usage.py: Prints the installed package version to verify imports.
- world_simulation.py: Shows DI with a solver and event hooks.

How to run
----------

Option A: Editable install (recommended during development)

1. Create/activate a virtualenv.
2. Install the project in editable mode: `pip install -e .`
3. Run the example: `python examples/basic_usage.py`
4. Or run the world demo: `python examples/world_simulation.py`

Option B: Without installing

- Run with the source path on `PYTHONPATH` so Python can find the `src` layout:
  `PYTHONPATH=src python examples/basic_usage.py`
