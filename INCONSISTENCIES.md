# Inconsistencies / Unfinished Areas (PRD)

Source reviewed: `product-docs/PRD.md`

## Status (this repo)

- Fixed: Wiring supports port renaming (dst port mapping).
- Fixed: `subscriptions()` semantics updated (`None`=all, `set()`=none).
- Fixed: VisualSpec optional `description` preserved end-to-end.
- Fixed: Adapters are TimeBroker-only; broken BioWorld adapter wiring removed.
- Fixed: SimUI runner docs updated to match cooperative stop behavior.
- Fixed: `examples/wiring_builder_demo.py` updated to reflect port renaming.

## Broken / mismatched references

- Fixed: PRD now references `product-docs/ROADMAP.md` (not `tasks/ROADMAP.md`).
- Fixed: PRD removed the “larger mono-project” repo references (`bsim-backend/`, `biosimulant-landing-page/`).

## Placeholders / unfinished

- `product-docs/PRD.md:5` has `Owners: (add)` placeholder.
- `product-docs/PRD.md:135` “Milestones” section defers to a missing path, so it is effectively a stub until corrected.

## Internal inconsistencies

- SimUI transport wording conflicts:
  - `product-docs/PRD.md:19` states SimUI should “stream/poll status”.
  - `product-docs/PRD.md:94` later requires “polling-based transport (no websockets required)”.
  - Action: pick one requirement set (polling-only vs streaming+polling) and align language across the PRD.
- CLI priority and test expectations are not aligned:
  - `product-docs/PRD.md:18` says CLI is “planned”.
  - `product-docs/PRD.md:86` says the project “Should provide a CLI”.
  - `product-docs/PRD.md:122` includes “CLI behaviors” under required test coverage.
  - Action: clarify whether CLI is in-scope for v0.x (and therefore testable now) or deferred (and therefore not in near-term test coverage).

## Underspecified requirements (hard to implement/test as written)

- Runtime semantics:
  - `product-docs/PRD.md:61` does not define which lifecycle events exist, their ordering, or delivery guarantees.
  - `product-docs/PRD.md:67` “pause/resume/stop” is not defined (what is paused, what state is preserved, how stop differs from reset, etc.).
- Error handling:
  - `product-docs/PRD.md:66` “log + continue; configurable later” is ambiguous (what error classes trigger stop vs continue, how errors are surfaced to callers, whether an event is emitted on error).
- Solver contract:
  - `product-docs/PRD.md:70` references `Solver.simulate(..., emit=...)` but does not define `dt` units, determinism expectations, event emission rules, cancellation/pausing behavior, or required hooks.
- Module signaling vs ports:
  - `product-docs/PRD.md:62` mentions “directed module-to-module signals”.
  - `product-docs/PRD.md:75` mentions “biosignal handlers” and “port declarations for validation”.
  - Action: define how “signals”, “ports”, and “handlers” relate (naming, typing, validation rules, and whether signals are events or a separate channel).
- Wiring/config security:
  - `product-docs/PRD.md:81`–`product-docs/PRD.md:86` require YAML/TOML wiring plus helpful validation, but don’t specify schema/versioning, import resolution rules, or how “safe mode/allowlist options” work (`product-docs/PRD.md:124`).
- Visuals contract:
  - `product-docs/PRD.md:88`–`product-docs/PRD.md:91` lists required VisualSpec types but does not define acceptance criteria (required/optional fields, normalization rules, versioning/compatibility, error reporting).
- SimUI API contract scope:
- `product-docs/PRD.md:93`–`product-docs/PRD.md:99` describes SimUI behaviors but does not specify the minimum required endpoints/contract in the PRD (what is mandatory vs optional, and what “extensible controls” must support).

---

## Simulation core & examples inconsistencies (code-level)

### Event subscriptions semantics vs module usage

- Fixed: `subscriptions()` semantics are now explicit: `None` = all events, empty set = no world events, non-empty set = filtered subset (`src/bsim/modules.py`, `src/bsim/world.py`). Modules that are signals-only now correctly return `set()`.

### Wiring ports are validated but not used for routing (missing port mapping)

- Fixed: Wiring now supports port renaming. Connections map `(src, out_port) -> (dst, in_port)` and the destination receives the mapped topic (`src/bsim/world.py`, `src/bsim/wiring.py`). The wiring demo was updated accordingly (`examples/wiring_builder_demo.py`).

### Adapter integration is incomplete / internally inconsistent

- Fixed by design: adapters are TimeBroker-only. The broken “adapters in BioWorld wiring” implementation was removed from `src/bsim/wiring.py`, `TimeBroker` now uses `set_inputs(...)` (`src/bsim/adapters/broker.py`), and the Tellurium example script now uses `TimeBroker` (`examples/adapters/test_tellurium_adapter.py`).

### VisualSpec metadata loss (description is produced but dropped)

- Fixed: `VisualSpec` now supports optional `description`, it is validated/normalized and preserved in SimUI responses (`src/bsim/visuals.py`, `src/bsim/simui/interface.py`).

### SimUI runner docs vs behavior

- Fixed: docstring now clarifies that hard cancellation isn’t supported, but cooperative stop is (`src/bsim/simui/runner.py`).

### Minor example doc mismatch

- The ecology SimUI demo docstring says “open http://localhost:8765” (`examples/ecology_simui_demo.py:15`), but SimUI is mounted at `/ui/` by default (`src/bsim/simui/interface.py:83`) and the script itself prints the correct `/ui/` URL later.
