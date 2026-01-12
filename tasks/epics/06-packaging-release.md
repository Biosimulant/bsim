# Epic 06: Packaging + release readiness

Status: Draft
Last updated: 2026-01-12
Related: `pyproject.toml`, `.github/workflows/ci.yml`

## Goal

Ensure the package is installable, dependency boundaries are correct, wheels ship required assets, and release builds are reproducible.

## Acceptance criteria

- `pip install bsim` installs the core library and `import bsim` succeeds without UI deps.
- `pip install 'bsim[ui]'` enables SimUI.
- Python `requires-python` and classifiers match actual supported syntax and CI.
- UI build artifacts (`src/bsim/simui/static/**`) ship in sdist/wheel.
- CI builds package artifacts after building frontend assets and runs tests.

## Implementation plan

1. Fix optional dependency boundaries (see hygiene epic) and verify base import path.
2. Decide Python floor:
   - Option A: raise to `>=3.10` or `>=3.11` (align with typing syntax).
   - Option B: refactor typing syntax to support an older Python floor (if required).
3. Review extras:
   - `ui` should contain only actually-used runtime deps.
   - `dev` should contain test tools; consider a separate `config` extra.
4. Add a “release checklist” doc under `tasks/quality/` (optional).

## Test plan

- `PYTHONPATH=src .venv/bin/python -m pytest -q`
- `python -m build` (if available) and verify wheel contains static assets.
