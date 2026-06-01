"""Telemetry API endpoints."""

import json
import logging
import time

from fastapi import APIRouter
from fastapi import WebSocket, WebSocketDisconnect

from brain_game.models.schemas import TelemetryData
from brain_game.ws import get_manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api")


@router.post("/telemetry")
async def post_telemetry(data: TelemetryData):
    manager = get_manager()
    timestamp = float(data.timestamp or time.time())
    manager.update_telemetry({
        "timestamp": timestamp,
        "eeg": data.eeg or {},
        "vision": data.vision or {},
    })
    await manager.broadcast_json({"action": "telemetry", "value": manager.latest_telemetry})
    return {"status": "success"}


@router.get("/telemetry")
async def get_telemetry():
    return {"status": "success", "item": get_manager().latest_telemetry}


@router.post("/reset_state")
async def reset_control_state():
    manager = get_manager()
    await manager.broadcast_json({"action": "reset_state", "value": True})
    logger.info("Broadcast reset_state to all clients")
    return {"status": "success", "message": "Control state reset"}
