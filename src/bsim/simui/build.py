from __future__ import annotations

"""
Thin CLI wrapper for maintainers to build the SimUI frontend bundle.

Usage:
    python -m bsim.simui.build

Requires npm and the dev-only frontend at src/bsim/simui/_frontend.
Writes the bundled app.js to src/bsim/simui/static/app.js.
"""

import shutil
import subprocess
import sys
from pathlib import Path


def _run(cmd: list[str], cwd: Path) -> int:
    print(f"[simui.build] $ {' '.join(cmd)} (cwd={cwd})")
    return subprocess.call(cmd, cwd=str(cwd))


def main(argv: list[str] | None = None) -> int:
    # Resolve paths relative to this module location (works in repo checkout).
    here = Path(__file__).resolve().parent
    # Ensure 'src' (one level up from package root) is on sys.path for direct invocation in repo
    repo_root = here.parents[2] if len(here.parents) >= 2 else Path.cwd()
    src_dir = repo_root / 'src'
    if src_dir.exists() and str(src_dir) not in sys.path:
        sys.path.insert(0, str(src_dir))
    frontend_dir = here / "_frontend"
    static_dir = here / "static"

    if shutil.which("npm") is None:
        print("npm not found. Please install Node.js and npm to build the frontend.", file=sys.stderr)
        return 1

    if not frontend_dir.exists():
        print(
            f"Frontend directory not found at {frontend_dir}.\n"
            "Run this command from a repo checkout (maintainer use).",
            file=sys.stderr,
        )
        return 1

    # If the shell script exists, use it; otherwise run the steps inline.
    script = repo_root / "scripts" / "build_simui_frontend.sh"

    if script.exists():
        rc = _run(["bash", str(script)], cwd=repo_root)
        return rc

    # Inline build: npm ci && npm run build, then copy dist/app.js to static.
    # Prefer ci if a lockfile exists
    if (frontend_dir / "package-lock.json").exists() or (frontend_dir / "npm-shrinkwrap.json").exists():
        rc = _run(["npm", "ci"], cwd=frontend_dir)
        if rc != 0:
            return rc
    else:
        rc = _run(["npm", "install"], cwd=frontend_dir)
        if rc != 0:
            return rc
    rc = _run(["npm", "run", "build"], cwd=frontend_dir)
    if rc != 0:
        return rc

    dist_dir = frontend_dir / "dist"
    dist_app = dist_dir / "app.js"
    if not dist_app.exists():
        print(f"dist artifact not found at {dist_app}", file=sys.stderr)
        return 1
    static_dir.mkdir(parents=True, exist_ok=True)
    (static_dir / "app.js").write_bytes(dist_app.read_bytes())
    # Optionally copy CSS bundle if present
    dist_css = dist_dir / "app.css"
    if dist_css.exists():
        (static_dir / "app.css").write_bytes(dist_css.read_bytes())
    print(f"[simui.build] Wrote {(static_dir / 'app.js')}" + (" and app.css" if dist_css.exists() else "") + "\nDone.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
