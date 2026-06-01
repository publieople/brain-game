"""Pydantic v2 schemas for all API data."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# ── Telemetry ──

class TelemetryData(BaseModel):
    timestamp: float = 0.0
    eeg: dict = {}
    vision: dict = {}


# ── Game Control ──

class GameControlData(BaseModel):
    action: str
    value: float = 1.0


# ── Sessions ──

class SessionStartRequest(BaseModel):
    player_name: str
    game_name: str = "unknown"


class SessionStateRequest(BaseModel):
    timestamp: float = 0.0


class SessionEventRequest(BaseModel):
    attention_value: float = 0.0
    meditation_value: float = 0.0
    signal_quality: float = -1.0
    score: int = 0
    timestamp: float = 0.0


class SessionEndRequest(BaseModel):
    score: int = 0
    avg_attention: float = 0.0
    avg_meditation: float = 0.0
    timestamp: float = 0.0


class SessionResponse(BaseModel):
    session_id: int
    player_name: str
    game_name: str
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    score: int = 0
    avg_attention: float = 0.0
    status: str = "running"
    pause_count: int = 0
    paused_duration_seconds: float = 0.0
    duration_seconds: float = 0.0
    active_duration_seconds: float = 0.0
    llm_report: Optional[str] = None


class SessionListResponse(BaseModel):
    status: str = "success"
    items: list[SessionResponse] = []
    pagination: dict = {}


# ── Thresholds ──

class ThresholdConfig(BaseModel):
    attention_fire_on: int = Field(default=68, ge=0, le=100)
    attention_fire_off: int = Field(default=60, ge=0, le=100)
    meditation_shield_on: int = Field(default=65, ge=0, le=100)
    meditation_shield_off: int = Field(default=57, ge=0, le=100)


# ── Score ──

class ScoreSaveRequest(BaseModel):
    player_name: str
    score: int
    avg_attention: float


# ── Processed Metrics ──

class ProcessedMetricsResponse(BaseModel):
    attention_smooth: float = 0.0
    meditation_smooth: float = 0.0
    signal_score: float = 0.0
    signal_grade: str = "UNKNOWN"
    stability_index: float = 0.0
    duration_seconds: float = 0.0
    phase_label: str = "early"


# ── Generic ──

class GenericResponse(BaseModel):
    status: str = "success"
    message: str = ""


class ReportResponse(BaseModel):
    status: str = "success"
    report: str = ""
