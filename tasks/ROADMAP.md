# Roadmap: `bsim` (B-Simulant)

Status: Draft (living)
Last updated: 2026-01-12

This roadmap is intended to be executed as a sequence of epics in `tasks/epics/`. Each epic defines acceptance criteria and technical implementation steps.

## Milestone M0: Stabilize the repo (must-do hygiene)

Epics:
- `tasks/epics/13-repo-hygiene.md`
- `tasks/epics/06-packaging-release.md` (partial)

Exit criteria:
- Base `import bsim` works without optional deps installed.
- Python version targeting in `pyproject.toml` matches code syntax.
- Docs/CI wording and scripts are consistent and not misleading.
- Standard dev artifacts are ignored (`.venv/`, `.pytest_cache/`, etc.).

## Milestone M1: Core engine v0.1 (reliable primitives)

Epics:
- `tasks/epics/02-core-runtime.md`
- `tasks/epics/03-wiring-config.md`
- `tasks/epics/11-observability-performance.md` (basic)

Exit criteria:
- Cooperative stop/pause/resume semantics are correct and tested.
- Wiring loaders/builders are stable and have helpful diagnostics.
- VisualSpec validation/normalization is stable.

## Milestone M2: CLI + local workflow (run from config)

Epics:
- `tasks/epics/05-cli.md`
- `tasks/epics/12-docs-examples.md` (update docs to match CLI)

Exit criteria:
- A `bsim-run` console script exists; users can run `bsim-run --wiring ... --steps ... --dt ...` and get deterministic output.
- CLI errors are actionable (non-zero exit codes, clear messages).
- Docs/examples demonstrate the supported workflow.

## Milestone M3: SimUI v0.1 (usable local UI)

Epics:
- `tasks/epics/04-simui.md`
- `tasks/contracts/simui-api.md`

Exit criteria:
- UI can launch and run/pause/resume/reset reliably.
- Event and visuals APIs are versioned and backward compatible within v0.x rules.

## Milestone M4: Plugin SDK v0.1 (extensibility)

Epics:
- `tasks/epics/08-plugin-sdk.md`
- `tasks/contracts/plugin-contract.md`

Exit criteria:
- Plugin discovery via entry points works.
- `bsim` provides a registry and validation hooks.

## Milestone M5: Domain module pack(s) (credibility demos)

Epics:
- `tasks/epics/07-domain-modules.md`

Exit criteria:
- At least one end-to-end, “real” demo composed of multiple modules with visuals.
- Recommended first pack: neuro “stimulus → spikes” sandbox (single neuron + small E/I microcircuit) with SimUI visuals and YAML/TOML scenarios.

## Milestone M6: Standards & interoperability (selective)

Epics:
- `tasks/epics/09-standards-interop.md`

Exit criteria:
- Import/export for at least one constrained standard subset.

## Milestone M7: Web platform integration (future)

Epics:
- `tasks/epics/10-web-platform.md`

Exit criteria:
- Clear boundary and shared contracts so platform can consume events/visuals/runs.
