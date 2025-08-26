"""
Minimal usage example for the bsim library.

Run after installing the project in editable mode:
    pip install -e .
    python examples/basic_usage.py

Alternatively, you can set PYTHONPATH to the src directory:
    PYTHONPATH=src python examples/basic_usage.py
"""

from __future__ import annotations

import sys

try:
    import bsim
except ModuleNotFoundError as exc:
    # Helpful hint if the package isn't installed yet.
    sys.stderr.write(
        "Could not import 'bsim'. Did you run 'pip install -e .'?\n"
        "Alternatively, run with 'PYTHONPATH=src'.\n"
    )
    raise


def main() -> None:
    print("bsim example")
    print(f"version: {bsim.__version__}")


if __name__ == "__main__":
    main()
