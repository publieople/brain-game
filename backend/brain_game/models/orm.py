"""SQLAlchemy 2.0 async ORM models."""

from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from . import Base


class GameSession(Base):
    __tablename__ = "game_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    player_name: Mapped[str] = mapped_column(String(50), index=True)
    game_name: Mapped[str] = mapped_column(String(50), default="unknown", index=True)
    start_time: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    end_time: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    score: Mapped[int] = mapped_column(Integer, default=0)
    avg_attention: Mapped[float] = mapped_column(Float, default=0.0)
    avg_meditation: Mapped[float] = mapped_column(Float, default=0.0)
    status: Mapped[str] = mapped_column(String(16), default="running", index=True)
    pause_count: Mapped[int] = mapped_column(Integer, default=0)
    paused_duration_seconds: Mapped[float] = mapped_column(Float, default=0.0)
    paused_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    ended_at_source: Mapped[str] = mapped_column(String(32), default="unknown")
    llm_report: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    event_logs: Mapped[list["EventLog"]] = relationship(back_populates="session")
    telemetry_logs: Mapped[list["TelemetryLog"]] = relationship(back_populates="session")
    processed_metrics: Mapped[list["ProcessedMetric"]] = relationship(back_populates="session")


class EventLog(Base):
    __tablename__ = "event_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("game_sessions.id"))
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    attention_value: Mapped[float] = mapped_column(Float, default=0.0)
    event_type: Mapped[str] = mapped_column(String(32), default="tick", index=True)
    payload_json: Mapped[str] = mapped_column(Text, default="{}")

    session: Mapped["GameSession"] = relationship(back_populates="event_logs")


class TelemetryLog(Base):
    __tablename__ = "telemetry_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("game_sessions.id"), index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    attention: Mapped[float] = mapped_column(Float, default=0.0)
    meditation: Mapped[float] = mapped_column(Float, default=0.0)
    signal_quality: Mapped[float] = mapped_column(Float, default=-1.0)
    score: Mapped[int] = mapped_column(Integer, default=0)

    session: Mapped["GameSession"] = relationship(back_populates="telemetry_logs")


class ProcessedMetric(Base):
    __tablename__ = "processed_metrics"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("game_sessions.id"), index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    attention_smooth: Mapped[float] = mapped_column(Float, default=0.0)
    meditation_smooth: Mapped[float] = mapped_column(Float, default=0.0)
    signal_score: Mapped[float] = mapped_column(Float, default=0.0)
    signal_grade: Mapped[str] = mapped_column(String(8), default="UNKNOWN")
    stability_index: Mapped[float] = mapped_column(Float, default=0.0)
    duration_seconds: Mapped[float] = mapped_column(Float, default=0.0)
    phase_label: Mapped[str] = mapped_column(String(16), default="early")

    session: Mapped["GameSession"] = relationship(back_populates="processed_metrics")
