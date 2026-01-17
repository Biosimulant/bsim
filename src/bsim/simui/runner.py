from __future__ import annotations

import threading
import time
from dataclasses import dataclass, field
from typing import Any, Callable, Dict, Optional


@dataclass
class RunStatus:
    running: bool = False
    started_at: Optional[float] = None
    finished_at: Optional[float] = None
    step_count: int = 0
    error: Optional[str] = None
    paused: bool = False


class SimulationManager:
    """Runs world.simulate in a background thread and tracks status.

    This manager enforces a single active run at a time. Cancellation is not
    supported as a hard, immediate cancellation in v1. A cooperative stop is
    supported via `BioWorld.request_stop()`, and will take effect at STEP
    boundaries (so the run can still emit AFTER_SIMULATION and clean up).
    """

    def __init__(self, world: "BioWorld") -> None:
        self._world = world
        self._lock = threading.Lock()
        self._thread: Optional[threading.Thread] = None
        self._status = RunStatus()
        self._stop_requested = False  # reserved for future cooperative stop

    # External API ---------------------------------------------------------
    def start_run(self, *, steps: int, dt: float, on_start: Optional[Callable[[], None]] = None) -> bool:
        """Attempt to start a background run. Returns False if already running."""
        with self._lock:
            if self._status.running:
                return False
            if on_start is not None:
                on_start()
            # Initialize status and spawn the worker thread
            self._status = RunStatus(running=True, started_at=time.time(), step_count=0, error=None)
            self._stop_requested = False
            self._thread = threading.Thread(target=self._worker, args=(steps, dt), daemon=True)
            self._thread.start()
            return True

    def status(self) -> Dict[str, Any]:
        st = self._status
        return {
            "running": st.running,
            "paused": st.paused,
            "started_at": _ts(st.started_at),
            "finished_at": _ts(st.finished_at),
            "step_count": st.step_count,
            "error": {"message": st.error} if st.error else None,
        }

    def join(self, timeout: Optional[float] = None) -> None:
        t = self._thread
        if t is not None:
            t.join(timeout=timeout)

    def request_stop(self) -> None:
        # Cooperative stop via BioWorld
        try:
            self._world.request_stop()  # type: ignore[attr-defined]
        except Exception:
            # Best-effort: legacy solvers may ignore
            pass
        self._stop_requested = True

    def pause(self) -> None:
        if not self._status.running:
            return
        try:
            self._world.request_pause()  # type: ignore[attr-defined]
        except Exception:
            pass
        with self._lock:
            self._status.paused = True

    def resume(self) -> None:
        try:
            self._world.request_resume()  # type: ignore[attr-defined]
        except Exception:
            pass
        with self._lock:
            self._status.paused = False

    def reset(self) -> None:
        """Reset internal status if not running."""
        if self._status.running:
            # Best-effort stop, then allow reset
            self.request_stop()
            t = self._thread
            if t is not None:
                t.join(timeout=2.0)
        with self._lock:
            if not self._status.running:
                self._status = RunStatus()

    # Internal -------------------------------------------------------------
    def _worker(self, steps: int, dt: float) -> None:
        try:
            # Track STEP via a temporary listener to increment step_count
            from bsim.world import BioWorldEvent  # lazy to avoid circulars

            def _counter(ev, payload):
                if ev == BioWorldEvent.STEP:
                    # best-effort; no lock for perf
                    self._status.step_count += 1

            self._world.on(_counter)
            try:
                self._world.simulate(steps=steps, dt=dt)
            finally:
                self._world.off(_counter)
        except Exception as exc:  # pragma: no cover - error path surface
            with self._lock:
                self._status.error = str(exc)
                self._status.running = False
                self._status.finished_at = time.time()
            return
        with self._lock:
            self._status.running = False
            self._status.finished_at = time.time()



def _ts(t: Optional[float]) -> Optional[str]:
    if t is None:
        return None
    # ISO8601-ish string
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(t))
