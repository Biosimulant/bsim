# Contract: VisualSpec (JSON)

Status: Draft (living)
Last updated: 2026-01-12

## Purpose

Define the renderer-agnostic JSON contract for module-provided visuals, usable by SimUI and future platform clients.

## Shape

Each visual is an object:
- `render: str` visual type identifier
- `data: object` JSON-serializable payload interpreted by the client

The server may accept either a single visual or a list of visuals and normalize to a list.

## Core render types (current)

- `timeseries`
  - `data.series: [{ name: str, points: [[x, y], ...] }, ...]`
- `bar`
  - `data.items: [{ label: str, value: number }, ...]`
- `table`
  - either:
    - `data.columns: [str, ...]` and `data.rows: [[...], ...]`, or
    - `data.items: [{...}, ...]`
- `image`
  - `data.src: str` (URL or `data:` URI)
  - optional: `data.alt: str`, `data.width: number`, `data.height: number`
- `graph`
  - placeholder in current UI; intended for future richer graph rendering
- unknown types:
  - must still be renderable via a JSON fallback

## Validation rules

- Must be JSON-serializable.
- Invalid visuals must be dropped (not crash the run/UI).

## Versioning

Clients should tolerate unknown `render` values by falling back to JSON rendering.

## Notes (neuro-friendly patterns)

- Raster plots are typically emitted as `image` visuals with a `data:` URI:
  - `render = "image"`
  - `data.src = "data:image/png;base64,...."`
