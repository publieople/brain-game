"""Fusion engine — multimodal fusion for EEG + vision control."""

from collections import deque


class FusionControlEngine:
    """Combines EEG attention/meditation with visual gaze data into game controls.

    Uses hysteresis thresholds to prevent flickering between states.
    """

    def __init__(self) -> None:
        self._attention_history: deque[float] = deque(maxlen=5)
        self._meditation_history: deque[float] = deque(maxlen=5)

        # Hysteresis thresholds
        self.attention_fire_on = 68
        self.attention_fire_off = 60
        self.meditation_shield_on = 65
        self.meditation_shield_off = 57

        # Current control state
        self.firing = False
        self.shield_active = False

        # Gaze tracking
        self.gaze_direction: str = "center"
        self.gaze_confidence: float = 0.0

    def update_thresholds(self, **kwargs) -> None:
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, max(0, min(100, int(value))))

        # Ensure hysteresis: on > off
        self.attention_fire_on = max(self.attention_fire_on, self.attention_fire_off)
        self.meditation_shield_on = max(self.meditation_shield_on, self.meditation_shield_off)

    def feed_eeg(self, attention: float, meditation: float) -> None:
        self._attention_history.append(float(attention))
        self._meditation_history.append(float(meditation))
        self._update_firing()
        self._update_shield()

    def feed_gaze(self, direction: str, confidence: float) -> None:
        self.gaze_direction = direction
        self.gaze_confidence = float(confidence)

    def _avg(self, data: deque[float]) -> float:
        return sum(data) / len(data) if data else 0.0

    def _update_firing(self) -> None:
        att = self._avg(self._attention_history)
        if self.firing:
            if att < self.attention_fire_off:
                self.firing = False
        else:
            if att >= self.attention_fire_on:
                self.firing = True

    def _update_shield(self) -> None:
        med = self._avg(self._meditation_history)
        if self.shield_active:
            if med < self.meditation_shield_off:
                self.shield_active = False
        else:
            if med >= self.meditation_shield_on:
                self.shield_active = True

    def get_control_state(self) -> dict:
        return {
            "firing": self.firing,
            "shield": self.shield_active,
            "gaze_direction": self.gaze_direction,
            "gaze_confidence": round(self.gaze_confidence, 3),
        }
