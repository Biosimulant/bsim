# bsim Documentation

Welcome to the bsim documentation. This guide explains the core concepts, APIs, and practical wiring patterns for building modular biological simulations.

- Overview: high-level architecture and flow
- Quickstart: install, run, and explore
- API:
  - BioWorld and BioWorldEvent
  - BioModule
  - Solver and FixedStepSolver
  - WiringBuilder and YAML/TOML loaders
- Configuration: how to write wiring files
- Example: Eye → LGN → SC pipeline
- Neuro beachhead (planned): single neuron + microcircuit demo spec (`docs/neuro.md`)

See the files in this folder for a textbook-style walkthrough with code and concrete data examples.

Building a single PDF
- Requirements: `pandoc` and a LaTeX engine (e.g., TeX Live)
- Status: planned (no `scripts/build_pdf.sh` in this repo yet)
