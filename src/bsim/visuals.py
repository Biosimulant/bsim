from __future__ import annotations

from typing import Any, Dict, List, Optional, TypedDict, Union


class VisualSpec(TypedDict):
    """Renderer-agnostic visual specification for browser clients.

    Required keys:
    - render: the visual type (e.g., 'timeseries', 'bar', 'graph', 'scatter', 'heatmap', 'table', 'image', 'custom:...')
    - data: JSON-serializable data payload interpreted by the client adapter for the given render type
    """

    render: str
    data: Dict[str, Any]


Visuals = Union[VisualSpec, List[VisualSpec]]
