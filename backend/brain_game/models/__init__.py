"""Database async engine and session management."""

import os
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./brain_game.db")


def _resolve_db_url() -> str:
    url = DATABASE_URL.strip()
    if not url:
        raise RuntimeError("DATABASE_URL is not set")

    # Normalize postgres:// → postgresql://
    if url.lower().startswith("postgres://"):
        url = "postgresql://" + url[len("postgres://"):]

    return url


engine = create_async_engine(_resolve_db_url(), echo=False)
async_session_factory = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_factory() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db() -> None:
    """Create all tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
