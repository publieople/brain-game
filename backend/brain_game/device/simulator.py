"""EEG signal simulator for testing without hardware."""

import math
import time
import random
from typing import Generator


class EEGSimulator:
    """Generates simulated EEG attention/meditation values."""

    def __init__(self, mode: str = "steady") -> None:
        self.mode = mode  # steady, fluctuating, focused, distracted
        self._t = 0.0
        self._base_attention = 50.0
        self._base_meditation = 50.0

    def set_mode(self, mode: str) -> None:
        self.mode = mode

    def read(self) -> dict:
        """Generate a simulated EEG reading."""
        self._t += 0.1
        t = self._t

        if self.mode == "steady":
            att = 50 + 10 * math.sin(t * 0.5) + random.gauss(0, 3)
            med = 50 + 8 * math.sin(t * 0.3 + 1) + random.gauss(0, 3)

        elif self.mode == "fluctuating":
            att = 50 + 30 * math.sin(t * 0.8) + random.gauss(0, 5)
            med = 50 + 20 * math.sin(t * 0.6 + 0.5) + random.gauss(0, 5)

        elif self.mode == "focused":
            att = 75 + 10 * math.sin(t * 0.2) + random.gauss(0, 2)
            med = 40 + 10 * math.sin(t * 0.3) + random.gauss(0, 2)

        elif self.mode == "distracted":
            att = 25 + 15 * abs(math.sin(t * 1.5)) + random.gauss(0, 8)
            med = 60 + 15 * math.sin(t * 0.4) + random.gauss(0, 5)

        else:
            att = 50 + random.gauss(0, 5)
            med = 50 + random.gauss(0, 5)

        sig_quality = random.uniform(0, 30)

        return {
            "attention": max(0, min(100, att)),
            "meditation": max(0, min(100, med)),
            "signal_quality": sig_quality,
            "timestamp": time.time(),
        }

    def stream(self, interval: float = 0.1) -> Generator[dict, None, None]:
        """Generator that yields readings at the given interval."""
        while True:
            yield self.read()
            time.sleep(interval)
