"""WebSocket endpoint handlers."""

import json
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from brain_game.ws import get_manager

logger = logging.getLogger(__name__)

router = APIRouter()


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
    manager = get_manager()
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                action = msg.get("action")

                # Forward keydown/keyup
                if action in ("keydown", "keyup"):
                    key = msg.get("key")
                    if key:
                        await manager.broadcast_json({"action": action, "key": key})

                # Forward control/value messages
                elif "value" in msg:
                    if action == "telemetry" and isinstance(msg.get("value"), dict):
                        payload = msg["value"]
                        manager.update_telemetry({
                            "timestamp": float(payload.get("timestamp", 0)),
                            "eeg": payload.get("eeg", {}),
                            "vision": payload.get("vision", {}),
                        })
                    await manager.broadcast_json({"action": action, "value": msg["value"]})
            except json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.debug("WS connection error: %s", e)
    finally:
        manager.disconnect(websocket)
