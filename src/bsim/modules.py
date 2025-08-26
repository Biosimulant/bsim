from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, Dict, Set, TYPE_CHECKING

if TYPE_CHECKING:  # pragma: no cover - typing only
    from .world import BioWorld, BioWorldEvent


class BioModule(ABC):
    """Base interface for modules that listen to world events.

    Optionally override `subscriptions` to declare a subset of events to receive.
    Returning an empty set means the module receives all events.
    """

    def subscriptions(self) -> Set["BioWorldEvent"]:
        return set()

    # Handle global world events. Default is a no-op; override as needed.
    def on_event(self, event: "BioWorldEvent", payload: Dict[str, Any], world: "BioWorld") -> None:
        return

    # Optional: handle directed module-to-module messages ("biosignals").
    # Default is a no-op so simple modules only implementing on_event work.
    def on_signal(
        self,
        topic: str,
        payload: Dict[str, Any],
        source: "BioModule",
        world: "BioWorld",
    ) -> None:
        return

    # --- Optional Port Metadata (for validation and tooling) ---
    # Return declared input and output port names. Defaults are empty, meaning
    # permissive (no validation). If non-empty, the wiring builder/loader will
    # validate connections against these sets.
    def inputs(self) -> Set[str]:
        return set()

    def outputs(self) -> Set[str]:
        return set()

    # Optional schema maps: port name -> schema/type object. If both source and
    # destination declare schemas for a connected port, simple equality checks
    # can be applied by tooling in the future. Currently unused.
    def input_schemas(self) -> Dict[str, Any]:
        return {}

    def output_schemas(self) -> Dict[str, Any]:
        return {}
