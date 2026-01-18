# Epic 02: Core runtime reliability (world/events/stop/pause)

Status: Draft
Last updated: 2026-01-12
Related: `src/bsim/world.py`, `src/bsim/modules.py`

## Goal

Make the runtime robust, predictable, and well-specified: event ordering, error semantics, and cooperative controls (pause/resume/stop) behave correctly across runs and UI runners.

## Problem statements (current gaps)

- Pause/resume/stop semantics are not clearly specified for the orchestration loop.
- Error handling policy (log + continue vs fail fast) is implicit.

## Acceptance criteria

- Event flow is deterministic:
  - `STARTED` emitted once per run.
  - Each `run(...)` emits `FINISHED` exactly once (even on stop).
  - `ERROR` emitted on exception (and exception propagates unless explicitly configured).
- `request_stop()`:
  - stops the run without raising uncaught exceptions to callers,
  - results in a consistent "stopped" outcome.
- `request_pause()`:
  - blocks progress at a defined boundary,
  - does not deadlock, and `request_resume()` continues.
- These behaviors have tests.

## Implementation plan

1. Write a precise contract for event emission and cooperative control points.
2. Fix `BioWorld` cooperative stop/pause implementation:
   - Ensure stop is only enforced at safe points and does not prevent `FINISHED`.
   - Ensure `PAUSED` event emission does not interfere with stop.
3. Update `SimulationManager` semantics if needed to treat "stopped" as non-error.
4. Add tests in `tests/` for stop/pause/resume.

## Test plan

- `PYTHONPATH=src .venv/bin/python -m pytest -q`
- Add focused tests for:
  - stop triggered mid-run,
  - pause/resume with a deterministic loop.

## Rollout plan

- Keep behavior backward compatible where possible.
- Document changes in `docs/bioworld.md` and add a migration note.
