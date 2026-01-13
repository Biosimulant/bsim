# SPDX-FileCopyrightText: 2025-present Demi <bjaiye1@gmail.com>
#
# SPDX-License-Identifier: MIT
"""Generic CLI runner for bsim simulations.

Run any YAML/TOML config directly without needing a separate demo script.

Usage:
    python -m bsim config.yaml                    # Run headless (print final state)
    python -m bsim config.yaml --simui            # Launch SimUI dashboard
    python -m bsim config.yaml --simui --port 8080
    python -m bsim config.yaml --steps 5000 --dt 0.05

YAML config format (extended):
    # Metadata for SimUI (optional)
    meta:
      title: "My Simulation"
      description: "Markdown description here"
      solver: default  # "default" or "fixed"
      temperature: 20.0  # Initial temperature for DefaultBioSolver

    # Modules and wiring (standard)
    modules:
      ...
    wiring:
      ...
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path
from typing import Any, Dict, Optional


def load_config(path: Path) -> Dict[str, Any]:
    """Load YAML or TOML config file."""
    suffix = path.suffix.lower()
    if suffix in {".yaml", ".yml"}:
        try:
            import yaml
        except ImportError:
            print("Error: PyYAML required. Install with: pip install pyyaml", file=sys.stderr)
            sys.exit(1)
        with path.open("r", encoding="utf-8") as f:
            return yaml.safe_load(f) or {}
    elif suffix in {".toml", ".tml"}:
        try:
            import tomllib  # type: ignore
        except ImportError:
            try:
                import tomli as tomllib  # type: ignore
            except ImportError:
                print("Error: TOML support requires Python 3.11+ or tomli. Install with: pip install tomli", file=sys.stderr)
                sys.exit(1)
        with path.open("rb") as f:
            return tomllib.load(f)
    else:
        print(f"Error: Unsupported config format: {suffix}", file=sys.stderr)
        sys.exit(1)


def create_world(config: Dict[str, Any], temp_override: Optional[float] = None) -> "BioWorld":
    """Create a BioWorld from config, using appropriate solver."""
    import bsim

    meta = config.get("meta", {})
    solver_type = meta.get("solver", "fixed")

    if solver_type == "default":
        from bsim.solver import DefaultBioSolver, TemperatureParams

        # Get temperature from meta or override
        initial_temp = temp_override if temp_override is not None else meta.get("temperature", 25.0)
        temp_bounds = meta.get("temperature_bounds", (0.0, 50.0))

        solver = DefaultBioSolver(
            temperature=TemperatureParams(initial=initial_temp, bounds=tuple(temp_bounds)),
        )
    else:
        solver = bsim.FixedStepSolver()

    world = bsim.BioWorld(solver=solver)
    return world


def run_headless(world: "BioWorld", steps: int, dt: float) -> None:
    """Run simulation without UI and print results."""
    print(f"Running simulation: {steps} steps, dt={dt}")
    print("-" * 40)

    world.simulate(steps=steps, dt=dt)

    print(f"Simulation complete.")
    print("-" * 40)

    # Print final visuals summary
    visuals = world.collect_visuals()
    if visuals:
        print(f"Collected visuals from {len(visuals)} module(s):")
        for entry in visuals:
            module_name = entry.get("module", "unknown")
            vis_list = entry.get("visuals", [])
            for v in vis_list:
                render_type = v.get("render", "unknown")
                print(f"  - {module_name}: {render_type}")
    else:
        print("No visuals collected.")


def run_simui(
    world: "BioWorld",
    config: Dict[str, Any],
    *,
    steps: int,
    dt: float,
    port: int,
    host: str,
    open_browser: bool,
) -> None:
    """Launch SimUI with the configured world."""
    try:
        from bsim.simui import Interface, Number, Button, EventLog, VisualsPanel
    except ImportError as e:
        print(f"Error: SimUI requires additional dependencies: {e}", file=sys.stderr)
        print("Install with: pip install 'bsim[ui]' or pip install fastapi uvicorn", file=sys.stderr)
        sys.exit(1)

    meta = config.get("meta", {})
    title = meta.get("title", "BioSim Simulation")
    description = meta.get("description")

    # Build default controls
    controls = [
        Number("steps", steps, label="Steps", minimum=10, maximum=100000, step=10),
        Number("dt", dt, label="dt", minimum=0.001, maximum=1.0, step=0.01),
        Button("Run"),
    ]

    outputs = [
        EventLog(limit=100),
        VisualsPanel(refresh="auto", interval_ms=500),
    ]

    ui = Interface(
        world,
        title=title,
        description=description,
        controls=controls,
        outputs=outputs,
    )

    print(f"Starting SimUI: http://{host}:{port}/ui/")
    print("Press Ctrl+C to stop.")

    ui.launch(host=host, port=port, open_browser=open_browser)


def main() -> None:
    parser = argparse.ArgumentParser(
        prog="python -m bsim",
        description="Run bsim simulations from YAML/TOML config files.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python -m bsim examples/configs/ecology_predator_prey.yaml --simui
  python -m bsim config.yaml --steps 5000 --dt 0.05
  python -m bsim config.yaml --simui --port 8080 --open
        """,
    )

    parser.add_argument(
        "config",
        type=Path,
        help="Path to YAML or TOML config file",
    )
    parser.add_argument(
        "--simui",
        action="store_true",
        help="Launch SimUI web dashboard instead of headless run",
    )
    parser.add_argument(
        "--steps",
        type=int,
        default=1000,
        help="Number of simulation steps (default: 1000)",
    )
    parser.add_argument(
        "--dt",
        type=float,
        default=0.1,
        help="Time step size (default: 0.1)",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=8765,
        help="SimUI server port (default: 8765)",
    )
    parser.add_argument(
        "--host",
        type=str,
        default="127.0.0.1",
        help="SimUI server host (default: 127.0.0.1)",
    )
    parser.add_argument(
        "--open",
        action="store_true",
        dest="open_browser",
        help="Open browser automatically when starting SimUI",
    )
    parser.add_argument(
        "--temperature",
        type=float,
        default=None,
        help="Override initial temperature (for DefaultBioSolver)",
    )

    args = parser.parse_args()

    # Validate config file exists
    if not args.config.exists():
        print(f"Error: Config file not found: {args.config}", file=sys.stderr)
        sys.exit(1)

    # Load config
    config = load_config(args.config)

    # Create world with appropriate solver
    world = create_world(config, temp_override=args.temperature)

    # Load modules and wiring from config
    import bsim
    bsim.load_wiring(world, args.config)

    # Get module count for display
    try:
        module_count = len(world._biomodule_listeners)
    except Exception:
        module_count = 0

    print(f"Loaded config: {args.config}")
    print(f"Modules: {module_count}")

    if args.simui:
        run_simui(
            world,
            config,
            steps=args.steps,
            dt=args.dt,
            port=args.port,
            host=args.host,
            open_browser=args.open_browser,
        )
    else:
        run_headless(world, steps=args.steps, dt=args.dt)


if __name__ == "__main__":
    main()
