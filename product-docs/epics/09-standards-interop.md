# Epic 09: Standards & Interoperability (Biomodule-first)

Status: Planned
Last updated: 2026-01-12

## Purpose

Enable bsim to run models from major biological standards (SBML, NeuroML, CellML) by packaging self-contained biomodules that wrap existing simulators internally.

## Principles

- No adapter layer in core runtime.
- Biomodules own their simulator integration (tellurium, pyNeuroML, OpenCOR, etc.).
- Interop is exposed via normal BioModule ports and BioSignals.

## Scope

### In scope
- Define a minimal pattern for packaging standard-backed biomodules.
- Provide example biomodule packages for SBML/NeuroML.
- Document signal metadata expectations for cross-package compatibility.

### Out of scope
- Re-implementing standards in core.
- A separate adapter API in `bsim`.

## Milestones

1. Publish a reference SBML-backed biomodule package (using tellurium internally).
2. Publish a reference NeuroML-backed biomodule package (using pyNeuroML internally).
3. Publish a reference CellML-backed biomodule package (using OpenCOR internally).

## Acceptance criteria

- Biomodule packages can be installed via pip and referenced in wiring configs.
- Each package exposes signals with explicit metadata (units, schema_version, kind).
- Example configs run end-to-end with BioWorld orchestration.
