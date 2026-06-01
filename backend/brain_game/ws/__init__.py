"""WebSocket connection manager."""

import json
import logging
from typing import Any

from fastapi import WebSocket

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages active WebSocket connections and broadcast."""

    def __init__(self) -> None:
        self._connections: list[WebSocket] = []
        self._latest_telemetry: dict[str, Any] = {
            "timestamp": 0,
            "eeg": {},
            "vision": {},
        }

    @property
    def active_count(self) -> int:
        return len(self._connections)

    @property
    def latest_telemetry(self) -> dict[str, Any]:
        return dict(self._latest_telemetry)

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self._connections.append(websocket)
        logger.info("WS client connected. Active: %d", len(self._connections))

    def disconnect(self, websocket: WebSocket) -> None:
        if websocket in self._connections:
            self._connections.remove(websocket)
            logger.info("WS client disconnected. Active: %d", len(self._connections))

    async def broadcast(self, message: str) -> None:
        stale: list[WebSocket] = []
        for connection in list(self._connections):
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.debug("WS send failed, removing: %s", e)
                stale.append(connection)
        for connection in stale:
            self.disconnect(connection)

    async def broadcast_json(self, data: dict[str, Any]) -> None:
        await self.broadcast(json.dumps(data, ensure_ascii=False))

    def update_telemetry(self, data: dict[str, Any]) -> None:
        self._latest_telemetry.update(data)


manager = ConnectionManager()


def get_manager() -> ConnectionManager:
    return manager
