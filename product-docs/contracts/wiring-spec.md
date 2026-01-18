# Contract: Wiring spec (YAML/TOML)

Status: Draft (living)
Last updated: 2026-01-12

## Purpose

Define a versioned, backend-agnostic wiring schema for configuring modules and their directed connections.

## Schema v1 (proposed)

Top-level keys:
- `version: "1"`
- `modules: { <name>: <moduleSpec>, ... }`
- `wiring: [ <connectionSpec>, ... ]`

### moduleSpec

Either:
- string: dotted import path (unsafe for untrusted configs)
  - example: `"my_pkg.my_mod.Eye"`

Or object:
- `class: str` dotted import path OR registry name
- `args: dict` keyword args for constructor (optional)
- `min_dt: float` minimum scheduling interval (optional)
- `priority: int` scheduler priority for tie-breaking (optional)

Example (YAML):
```yaml
version: "1"
modules:
  eye: { class: "examples.wiring_builder_demo.Eye", min_dt: 0.01 }
  lgn: { class: "examples.wiring_builder_demo.LGN" }
wiring:
  - { from: "eye.visual_stream", to: ["lgn.retina"] }
```

### connectionSpec

Keys:
- `from: str` source reference: `"name.port"`
- `to: list[str]` destination references: `"name.port"`

## Validation rules

- Every referenced module name must exist in `modules`.
- If `outputs()` is non-empty on a source module, the source port must be declared.
- If `inputs()` is non-empty on a destination module, the destination port must be declared.
- Error messages must include the full connection context.

## Security modes

Default (safe) mode:
- Disallow dotted imports from config unless explicitly enabled.
- Prefer registry-based resolution (plugin SDK) or a local allowlist.

Allow-imports mode:
- Enable dotted import resolution for trusted local configs.
