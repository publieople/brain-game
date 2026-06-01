"""Brain-Game Backend — FastAPI application factory."""

import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from brain_game.api.router import api_router
from brain_game.models import init_db
from brain_game.ws.handlers import router as ws_router
from brain_game.ws.eeg_stream import router as eeg_router

logger = logging.getLogger(__name__)

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Brain Game Server...")
    try:
        await init_db()
        logger.info("Database initialized")
    except Exception as e:
        logger.warning("Database initialization skipped: %s", e)
    yield
    logger.info("Shutting down Brain Game Server...")


def create_app() -> FastAPI:
    app = FastAPI(title="Brain Game Server", version="0.2.0", lifespan=lifespan)

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # API routes
    app.include_router(api_router)

    # WebSocket routes
    app.include_router(ws_router)
    app.include_router(eeg_router)

    # Static files (Vite build output)
    if STATIC_DIR.exists():
        app.mount("/assets", StaticFiles(directory=str(STATIC_DIR / "assets")), name="assets")

    # Health check
    @app.get("/")
    async def root():
        return {"status": "ok", "service": "Brain Game Server", "version": "0.2.0"}

    @app.get("/api/health")
    async def health():
        return {"status": "healthy", "version": "0.2.0"}

    @app.post("/control")
    async def post_control(action: str, value: float = 1.0):
        """Legacy control endpoint for hardware scripts."""
        from brain_game.ws import get_manager
        import json
        manager = get_manager()
        await manager.broadcast_json({"action": action, "value": value})
        return {"status": "success", "action": action, "value": value}

    # Score save (simple evaluation, no session creation)
    @app.post("/api/score/save")
    async def save_score(player_name: str, score: int, avg_attention: float):
        report = _evaluate_performance(avg_attention, score)
        return {"status": "success", "report": report}

    return app


def _evaluate_performance(attention: float, score: int) -> str:
    if attention > 70:
        advice = "专注度极高！这是你获得高分的关键。继续保持当前的用眼习惯和用脑状态。"
    elif attention > 40:
        advice = "专注度良好。如果想突破极限得分，尝试在测试时减缓呼吸频率，减少多余眨眼。"
    else:
        advice = (
            "专注度略低，可能产生疲劳。建议：\n"
            "1. 闭眼休息1-2分钟\n"
            "2. 确认设备接触良好\n"
            "3. 测试时避免剧烈头部晃动"
        )
    return (
        f"分析报告:\n"
        f"您的平均专注度为 **{attention:.1f}**，得分为 **{score}**。\n"
        f"AI教练评估：{advice}"
    )


app = create_app()
