"""EEG simulator WebSocket broadcast service."""

import asyncio
import json
import logging
import time

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from brain_game.device.simulator import EEGSimulator

logger = logging.getLogger(__name__)

router = APIRouter()

# Active simulator tasks
_simulator_tasks: set[asyncio.Task] = set()


@router.websocket("/ws/eeg")
async def eeg_simulator_endpoint(websocket: WebSocket):
    """WebSocket endpoint that streams simulated EEG data at ~10Hz."""
    await websocket.accept()
    logger.info("EEG simulator client connected")

    simulator = EEGSimulator(mode="steady")

    # Listen for mode changes from client
    async def listen_for_mode():
        try:
            while True:
                data = await websocket.receive_text()
                try:
                    msg = json.loads(data)
                    if msg.get("action") == "set_mode":
                        simulator.set_mode(msg.get("mode", "steady"))
                        await websocket.send_text(json.dumps({
                            "action": "mode_changed",
                            "mode": simulator.mode,
                        }))
                except json.JSONDecodeError:
                    pass
        except WebSocketDisconnect:
            pass

    listen_task = asyncio.create_task(listen_for_mode())
    _simulator_tasks.add(listen_task)

    try:
        while True:
            reading = simulator.read()
            payload = {
                "action": "telemetry",
                "value": {
                    "timestamp": reading["timestamp"],
                    "eeg": {
                        "attention": round(reading["attention"], 1),
                        "meditation": round(reading["meditation"], 1),
                        "signal_quality": round(reading["signal_quality"], 1),
                        "source": "simulator",
                    },
                    "vision": {},
                },
            }
            await websocket.send_text(json.dumps(payload))
            await asyncio.sleep(0.1)  # 10Hz
    except WebSocketDisconnect:
        pass
    except asyncio.CancelledError:
        pass
    finally:
        listen_task.cancel()
        _simulator_tasks.discard(listen_task)
        logger.info("EEG simulator client disconnected")


@router.post("/api/eeg/set-mode")
async def set_simulator_mode(mode: str = "steady"):
    """Set the simulator mode. Call via REST for external control."""
    valid_modes = {"steady", "fluctuating", "focused", "distracted"}
    if mode not in valid_modes:
        return {"status": "error", "message": f"Invalid mode. Valid: {valid_modes}"}
    # Mode is set per-connection in the WS handler. This REST endpoint
    # is for future use with a global simulator instance.
    return {"status": "success", "mode": mode}
