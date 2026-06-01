"""Session lifecycle API endpoints."""

import json
import logging
import math
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from brain_game.models import get_db
from brain_game.models.orm import GameSession, EventLog, TelemetryLog, ProcessedMetric
from brain_game.models.schemas import (
    SessionStartRequest,
    SessionStateRequest,
    SessionEventRequest,
    SessionEndRequest,
    SessionResponse,
    GenericResponse,
    ReportResponse,
)
from brain_game.processors.attention import AttentionProcessor
from brain_game.services.llm_reports import generate_llm_report

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/session")

# In-memory attention processors per session
_session_processors: dict[int, AttentionProcessor] = {}

DEFAULT_THRESHOLDS = {
    "attention_fire_on": 68,
    "attention_fire_off": 60,
    "meditation_shield_on": 65,
    "meditation_shield_off": 57,
}


def _clamp(v: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, v))


def _event_dt(timestamp: float) -> datetime:
    try:
        ts = float(timestamp)
    except (TypeError, ValueError):
        ts = 0.0
    return datetime.utcfromtimestamp(ts) if ts > 0 else datetime.utcnow()


def _active_duration(session: GameSession, now_dt: datetime) -> float:
    if not session.start_time:
        return 0.0
    paused = float(session.paused_duration_seconds or 0.0)
    if session.status == "paused" and session.paused_at:
        paused += max(0.0, (now_dt - session.paused_at).total_seconds())
    return max(0.0, (now_dt - session.start_time).total_seconds() - paused)


async def _append_event(
    db: AsyncSession,
    session_id: int,
    event_dt: datetime,
    event_type: str,
    attention_value: float,
    payload: dict | None = None,
) -> None:
    event = EventLog(
        session_id=session_id,
        timestamp=event_dt,
        event_type=event_type,
        attention_value=float(attention_value),
        payload_json=json.dumps(payload or {}, ensure_ascii=False),
    )
    db.add(event)


def _session_to_response(s: GameSession) -> dict:
    duration = 0.0
    if s.start_time and s.end_time:
        duration = max(0.0, (s.end_time - s.start_time).total_seconds())
    return {
        "session_id": s.id,
        "player_name": s.player_name,
        "game_name": s.game_name,
        "start_time": s.start_time.isoformat() if s.start_time else None,
        "end_time": s.end_time.isoformat() if s.end_time else None,
        "score": int(s.score or 0),
        "avg_attention": float(s.avg_attention or 0.0),
        "status": s.status or "running",
        "pause_count": int(s.pause_count or 0),
        "paused_duration_seconds": round(float(s.paused_duration_seconds or 0.0), 3),
        "duration_seconds": round(duration, 3),
        "active_duration_seconds": round(max(0.0, duration - float(s.paused_duration_seconds or 0.0)), 3),
        "llm_report": s.llm_report,
    }


# ── Start Session ──

@router.post("/start")
async def start_session(data: SessionStartRequest, db: AsyncSession = Depends(get_db)):
    new_session = GameSession(
        player_name=data.player_name,
        game_name=data.game_name,
        start_time=datetime.utcnow(),
        status="running",
        pause_count=0,
        paused_duration_seconds=0.0,
        ended_at_source="session_start",
    )
    db.add(new_session)
    await db.flush()

    await _append_event(db, new_session.id, datetime.utcnow(), "session_start", 0.0,
                        {"player_name": data.player_name})
    await db.commit()
    await db.refresh(new_session)

    _session_processors[new_session.id] = AttentionProcessor()
    logger.info("Session %d started for player '%s'", new_session.id, data.player_name)
    return {"status": "success", "session_id": new_session.id}


# ── Pause Session ──

@router.post("/{session_id}/pause")
async def pause_session(session_id: int, data: SessionStateRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(GameSession).where(GameSession.id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="session not found")

    if session.status == "ended":
        return {"status": "success", "session_status": "ended"}
    if session.status == "paused":
        return {"status": "success", "session_status": "paused"}

    event_dt = _event_dt(data.timestamp)
    session.status = "paused"
    session.paused_at = event_dt
    session.pause_count = (session.pause_count or 0) + 1
    await _append_event(db, session_id, event_dt, "pause", 0.0, {"pause_count": session.pause_count})
    await db.commit()
    return {"status": "success", "session_status": "paused"}


# ── Resume Session ──

@router.post("/{session_id}/resume")
async def resume_session(session_id: int, data: SessionStateRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(GameSession).where(GameSession.id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="session not found")

    if session.status == "ended":
        return {"status": "success", "session_status": "ended"}
    if session.status != "paused":
        return {"status": "success", "session_status": session.status or "running"}

    event_dt = _event_dt(data.timestamp)
    if session.paused_at:
        delta = max(0.0, (event_dt - session.paused_at).total_seconds())
        session.paused_duration_seconds = (session.paused_duration_seconds or 0.0) + delta
    session.paused_at = None
    session.status = "running"
    await _append_event(db, session_id, event_dt, "resume", 0.0,
                        {"paused_duration_seconds": session.paused_duration_seconds})
    await db.commit()
    return {"status": "success", "session_status": "running"}


# ── Event (tick) ──

@router.post("/{session_id}/event")
async def session_event(session_id: int, data: SessionEventRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(GameSession).where(GameSession.id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="session not found")
    if session.status == "ended":
        return {"status": "success", "ignored": True, "reason": "session ended"}

    event_dt = _event_dt(data.timestamp)
    att = _clamp(float(data.attention_value), 0.0, 100.0)
    med = _clamp(float(data.meditation_value), 0.0, 100.0)
    sig = float(data.signal_quality)

    processor = _session_processors.get(session_id)
    if processor is None:
        processor = AttentionProcessor()
        _session_processors[session_id] = processor

    processor.feed(att, med)
    duration_seconds = _active_duration(session, event_dt)
    metrics = processor.build_metrics(sig, duration_seconds)

    await _append_event(db, session_id, event_dt, "tick", att, {
        "meditation": med,
        "signal_quality": sig,
        "score": int(data.score),
    })

    telemetry = TelemetryLog(
        session_id=session_id, timestamp=event_dt,
        attention=att, meditation=med, signal_quality=sig, score=int(data.score),
    )
    processed = ProcessedMetric(
        session_id=session_id, timestamp=event_dt, **metrics,
    )
    db.add(telemetry)
    db.add(processed)
    await db.commit()

    return {"status": "success", "processed": {k: round(v, 3) if isinstance(v, float) else v
                                                for k, v in metrics.items()}}


# ── End Session ──

@router.post("/{session_id}/end")
async def end_session(session_id: int, data: SessionEndRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(GameSession).where(GameSession.id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="session not found")

    if session.status == "ended":
        return {"status": "success", "session_status": "ended",
                "score": session.score, "avg_attention": session.avg_attention}

    end_dt = _event_dt(data.timestamp)
    if session.status == "paused" and session.paused_at:
        delta = max(0.0, (end_dt - session.paused_at).total_seconds())
        session.paused_duration_seconds = (session.paused_duration_seconds or 0.0) + delta
        session.paused_at = None

    session.end_time = end_dt
    session.score = int(data.score)
    session.avg_attention = float(data.avg_attention)
    session.avg_meditation = float(data.avg_meditation)
    session.status = "ended"
    session.ended_at_source = "session_end_api"

    await _append_event(db, session_id, end_dt, "session_end", data.avg_attention, {
        "score": int(data.score),
        "avg_attention": float(data.avg_attention),
    })
    await db.commit()
    _session_processors.pop(session_id, None)

    return {"status": "success", "session_status": "ended",
            "score": session.score, "avg_attention": session.avg_attention}


# ── Generate LLM Report ──

@router.post("/{session_id}/generate_report")
async def generate_report(session_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(GameSession).where(GameSession.id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="session not found")

    if session.llm_report:
        return ReportResponse(report=session.llm_report)

    # Gather metrics
    metrics_result = await db.execute(
        select(ProcessedMetric).where(ProcessedMetric.session_id == session_id)
    )
    metrics = metrics_result.scalars().all()

    report = await generate_llm_report(session, list(metrics), db)
    if report:
        session.llm_report = report
        await db.commit()
        return ReportResponse(report=report)

    return {"status": "error", "message": "Failed to generate report"}
