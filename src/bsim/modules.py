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

    @abstractmethod
    def on_event(self, event: "BioWorldEvent", payload: Dict[str, Any], world: "BioWorld") -> None:
        ...
