"""Analytics dashboard API endpoints."""

import math
import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from brain_game.models import get_db
from brain_game.models.orm import GameSession, TelemetryLog, ProcessedMetric, EventLog

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/analytics")


@router.get("/summary")
async def get_summary(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(GameSession).order_by(GameSession.start_time.desc()).limit(200)
    )
    sessions = result.scalars().all()
    count = len(sessions)

    if count == 0:
        return {
            "status": "success",
            "item": {
                "session_count": 0, "avg_score": 0.0, "avg_attention": 0.0,
                "max_score": 0, "avg_duration_seconds": 0.0,
            },
        }

    scores = [int(s.score or 0) for s in sessions]
    atts = [float(s.avg_attention or 0.0) for s in sessions]
    durations = []
    active_durations = []
    for s in sessions:
        d = 0.0
        if s.start_time and s.end_time:
            d = max(0.0, (s.end_time - s.start_time).total_seconds())
        durations.append(d)
        active_durations.append(max(0.0, d - float(s.paused_duration_seconds or 0.0)))

    return {
        "status": "success",
        "item": {
            "session_count": count,
            "avg_score": round(sum(scores) / count, 3),
            "avg_attention": round(sum(atts) / count, 3),
            "max_score": max(scores),
            "avg_duration_seconds": round(sum(durations) / count, 3),
            "avg_active_duration_seconds": round(sum(active_durations) / count, 3),
        },
    }


@router.get("/sessions")
async def list_sessions(page: int = 1, page_size: int = 20, db: AsyncSession = Depends(get_db)):
    safe_page = max(1, page)
    safe_size = max(1, min(100, page_size))
    offset = (safe_page - 1) * safe_size

    total_result = await db.execute(select(func.count(GameSession.id)))
    total = total_result.scalar() or 0

    result = await db.execute(
        select(GameSession)
        .order_by(GameSession.start_time.desc())
        .offset(offset)
        .limit(safe_size)
    )
    sessions = result.scalars().all()

    items = []
    for s in sessions:
        duration = 0.0
        if s.start_time and s.end_time:
            duration = max(0.0, (s.end_time - s.start_time).total_seconds())
        items.append({
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
        })

    return {
        "status": "success",
        "items": items,
        "pagination": {
            "page": safe_page,
            "page_size": safe_size,
            "total": total,
            "total_pages": math.ceil(total / safe_size) if safe_size else 0,
        },
    }


@router.get("/session/{session_id}")
async def get_session_detail(session_id: int, limit: int = 300, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(GameSession).where(GameSession.id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="session not found")

    safe_limit = max(50, min(2000, limit))

    raw_result = await db.execute(
        select(TelemetryLog)
        .where(TelemetryLog.session_id == session_id)
        .order_by(TelemetryLog.timestamp.desc())
        .limit(safe_limit)
    )
    raw_events = list(reversed(raw_result.scalars().all()))

    proc_result = await db.execute(
        select(ProcessedMetric)
        .where(ProcessedMetric.session_id == session_id)
        .order_by(ProcessedMetric.timestamp.desc())
        .limit(safe_limit)
    )
    proc_events = list(reversed(proc_result.scalars().all()))

    life_result = await db.execute(
        select(EventLog)
        .where(EventLog.session_id == session_id)
        .order_by(EventLog.timestamp.asc())
        .limit(500)
    )
    life_events = life_result.scalars().all()

    duration = 0.0
    if session.start_time and session.end_time:
        duration = max(0.0, (session.end_time - session.start_time).total_seconds())

    return {
        "status": "success",
        "session": {
            "session_id": session.id,
            "player_name": session.player_name,
            "start_time": session.start_time.isoformat() if session.start_time else None,
            "end_time": session.end_time.isoformat() if session.end_time else None,
            "score": int(session.score or 0),
            "avg_attention": float(session.avg_attention or 0.0),
            "status": session.status or "running",
            "pause_count": int(session.pause_count or 0),
            "duration_seconds": round(duration, 3),
            "llm_report": session.llm_report,
        },
        "raw": [
            {"timestamp": e.timestamp.isoformat() if e.timestamp else None,
             "attention": float(e.attention or 0.0),
             "meditation": float(e.meditation or 0.0),
             "signal_quality": float(e.signal_quality or -1.0),
             "score": int(e.score or 0)}
            for e in raw_events
        ],
        "processed": [
            {"timestamp": e.timestamp.isoformat() if e.timestamp else None,
             "attention_smooth": float(e.attention_smooth or 0.0),
             "meditation_smooth": float(e.meditation_smooth or 0.0),
             "signal_score": float(e.signal_score or 0.0),
             "signal_grade": e.signal_grade or "UNKNOWN",
             "stability_index": float(e.stability_index or 0.0),
             "phase_label": e.phase_label or "early"}
            for e in proc_events
        ],
        "events": [
            {"timestamp": e.timestamp.isoformat() if e.timestamp else None,
             "event_type": e.event_type or "tick",
             "attention_value": float(e.attention_value or 0.0)}
            for e in life_events
        ],
    }
