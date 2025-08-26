from __future__ import annotations

from typing import Any, Dict, List, Optional, Tuple, TypedDict, Union
import json


class VisualSpec(TypedDict):
    """Renderer-agnostic visual specification for browser clients.

    Required keys:
    - render: the visual type (e.g., 'timeseries', 'bar', 'graph', 'scatter', 'heatmap', 'table', 'image', 'custom:...')
    - data: JSON-serializable data payload interpreted by the client adapter for the given render type
    """

    render: str
    data: Dict[str, Any]


Visuals = Union[VisualSpec, List[VisualSpec]]


def validate_visual_spec(spec: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
    """Validate that a dict conforms to the VisualSpec shape and is JSON-serializable.

    Returns (ok, error_message). When ok is False, error_message contains a brief reason.
    """
    if not isinstance(spec, dict):
        return False, "visual must be a dict"
    if "render" not in spec:
        return False, "missing 'render' key"
    if "data" not in spec:
        return False, "missing 'data' key"
    render = spec["render"]
    if not isinstance(render, str) or not render:
        return False, "'render' must be a non-empty string"
    data = spec["data"]
    if not isinstance(data, dict):
        return False, "'data' must be a dict"
    # Check JSON serializability (best-effort)
    try:
        json.dumps({"render": render, "data": data})
    except TypeError as exc:
        return False, f"data not JSON-serializable: {exc}"
    return True, None


def normalize_visuals(visuals: Visuals) -> List[VisualSpec]:
    """Normalize a single VisualSpec or list into a list of VisualSpec.

    Invalid entries are filtered out.
    """
    items: List[Dict[str, Any]]
    if isinstance(visuals, list):
        items = visuals  # type: ignore[assignment]
    else:
        items = [visuals]  # type: ignore[list-item]
    out: List[VisualSpec] = []
    for v in items:
        ok, _ = validate_visual_spec(v)
        if ok:
            out.append({"render": v["render"], "data": v["data"]})
    return out
