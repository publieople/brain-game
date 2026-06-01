"""API router — aggregate all endpoint modules."""

from fastapi import APIRouter

from . import sessions, telemetry, thresholds, analytics

api_router = APIRouter()

api_router.include_router(sessions.router)
api_router.include_router(telemetry.router)
api_router.include_router(thresholds.router)
api_router.include_router(analytics.router)
