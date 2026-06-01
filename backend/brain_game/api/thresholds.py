"""Threshold configuration API endpoints."""

import json
import logging
import os

from fastapi import APIRouter

from brain_game.models.schemas import ThresholdConfig

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
THRESHOLD_FILE = os.path.join(BASE_DIR, "..", "..", "outputs", "control_thresholds.json")


DEFAULT_THRESHOLDS = ThresholdConfig(
    attention_fire_on=68,
    attention_fire_off=60,
    meditation_shield_on=65,
    meditation_shield_off=57,
)


def _load_thresholds() -> ThresholdConfig:
    try:
        path = os.path.join(os.path.dirname(BASE_DIR), "outputs", "control_thresholds.json")
        if os.path.exists(path):
            with open(path) as f:
                data = json.load(f)
            return ThresholdConfig(**data)
    except (OSError, ValueError) as e:
        logger.warning("Failed to load thresholds: %s", e)
    return DEFAULT_THRESHOLDS


def _save_thresholds(config: ThresholdConfig) -> ThresholdConfig:
    path = os.path.join(os.path.dirname(BASE_DIR), "outputs", "control_thresholds.json")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        json.dump(config.model_dump(), f, indent=2)
    return config


@router.get("/thresholds")
async def get_thresholds():
    return {"status": "success", "items": _load_thresholds().model_dump()}


@router.put("/thresholds")
async def save_thresholds(data: ThresholdConfig):
    saved = _save_thresholds(data)
    return {"status": "success", "items": saved.model_dump()}
