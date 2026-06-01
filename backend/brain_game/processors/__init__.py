"""Attention metrics processor — rolling window analysis."""

import math
from collections import deque


class AttentionProcessor:
    """Processes raw EEG attention/meditation values into smoothed metrics."""

    def __init__(self, window_size: int = 12) -> None:
        self._att_window: deque[float] = deque(maxlen=window_size)
        self._med_window: deque[float] = deque(maxlen=window_size)

    def feed(self, attention: float, meditation: float) -> None:
        self._att_window.append(float(attention))
        self._med_window.append(float(meditation))

    def _avg(self, values: deque[float]) -> float:
        if not values:
            return 0.0
        return sum(values) / len(values)

    def _std(self, values: deque[float]) -> float:
        if len(values) < 2:
            return 0.0
        mean = sum(values) / len(values)
        variance = sum((v - mean) ** 2 for v in values) / len(values)
        return math.sqrt(variance)

    def build_metrics(self, signal_quality: float, duration_seconds: float) -> dict:
        att_smooth = self._avg(self._att_window)
        med_smooth = self._avg(self._med_window)
        att_std = self._std(self._att_window)
        stability = max(0.0, min(100.0, 100.0 - att_std * 2.5))

        if duration_seconds < 60:
            phase = "early"
        elif duration_seconds < 180:
            phase = "mid"
        else:
            phase = "late"

        signal_score = 0.0
        if signal_quality >= 0:
            signal_score = max(0.0, min(100.0, 100.0 - (signal_quality / 200.0) * 100.0))

        signal_grade = "UNKNOWN"
        if signal_quality >= 0:
            if signal_quality <= 25:
                signal_grade = "A"
            elif signal_quality <= 50:
                signal_grade = "B"
            elif signal_quality <= 100:
                signal_grade = "C"
            else:
                signal_grade = "D"

        return {
            "attention_smooth": att_smooth,
            "meditation_smooth": med_smooth,
            "signal_score": signal_score,
            "signal_grade": signal_grade,
            "stability_index": stability,
            "duration_seconds": max(0.0, float(duration_seconds)),
            "phase_label": phase,
        }
