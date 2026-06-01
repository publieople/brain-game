"""LLM report generation service."""

import logging
import os
from typing import Optional

from openai import AsyncOpenAI

from brain_game.models.orm import GameSession, ProcessedMetric

logger = logging.getLogger(__name__)

GAME_NAME_MAP = {
    "star_raid": "星穹突袭（小行星射击）",
    "archery": "专注射箭训练",
    "reading_training": "拾光阅行（阅读训练）",
    "unknown": "未知游戏",
}


def _get_openai_client() -> AsyncOpenAI:
    api_key = os.getenv("OPENAI_API_KEY", "")
    base_url = os.getenv("OPENAI_BASE_URL", "https://api.deepseek.com/v1")
    return AsyncOpenAI(api_key=api_key, base_url=base_url)


def _shorten_text(value: Optional[str], max_len: int = 56) -> str:
    if not value:
        return ""
    text = value.strip().replace("\n", " ")
    return text[:max_len] + "..." if len(text) > max_len else text


async def generate_llm_report(
    session: GameSession,
    metrics: list[ProcessedMetric],
    db_session,
) -> Optional[str]:
    """Generate LLM report for a game session."""
    client = _get_openai_client()
    model_name = os.getenv("LLM_MODEL", "deepseek-chat")

    duration = 0.0
    if session.start_time and session.end_time:
        duration = (session.end_time - session.start_time).total_seconds()

    avg_signal_score = 0.0
    avg_stability = 0.0
    if metrics:
        avg_signal_score = sum(float(m.signal_score or 0.0) for m in metrics) / len(metrics)
        avg_stability = sum(float(m.stability_index or 0.0) for m in metrics) / len(metrics)

    game_display = GAME_NAME_MAP.get(session.game_name, session.game_name or "未知游戏")

    system_prompt = (
        "你是一位专业的脑机接口训练表现分析教练。"
        "请输出自然、具体、可执行的中文反馈，避免空泛鼓励和模板化套话。"
        "输出必须是一个自然段，不要分点、不要标题、不要Markdown。"
        "字数约100字（建议80-140字），且必须包含至少一条可立即执行的改进建议。"
        "若历史数据不足，只能基于本局数据判断，不得编造趋势。"
    )

    prompt = f"""
请基于以下脑控游戏数据生成教练评语。

【本局数据】
玩家名：{session.player_name}
测试项目：{game_display}
游戏得分：{int(session.score or 0)}
平均专注度：{float(session.avg_attention or 0.0):.1f}
有效游戏时长：{duration:.1f}秒
数据点数量：{len(metrics)}
平均信号分：{avg_signal_score:.1f}
平均稳定性：{avg_stability:.1f}

要求：
1) 输出一个自然段中文评语，不分点。
2) 包含：本局表现判断 + 一条可执行建议 + 简短趋势判断。
3) 字数控制在约100字。
"""

    try:
        response = await client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=500,
        )
        content = (response.choices[0].message.content or "").strip()
        return content if content else None
    except Exception as e:
        logger.error("LLM API error: %s", e)
        return None
