from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from sqlalchemy.ext.asyncio import (
    create_async_engine,
    async_sessionmaker,
    AsyncSession,
)
from sqlalchemy.orm import DeclarativeBase
from collections.abc import AsyncGenerator

from app.config import get_settings


def normalize_database_url(database_url: str) -> str:
    """Convert PostgreSQL URLs to asyncpg format; preserve other URLs."""
    parsed = urlsplit(database_url)

    # Critical: preserve SQLite's exact three-slash URL format.
    if parsed.scheme not in ("postgres", "postgresql", "postgresql+asyncpg"):
        return database_url

    query = parse_qsl(parsed.query, keep_blank_values=True)
    query = [
        ("ssl" if key == "sslmode" else key, value)
        for key, value in query
        if key != "channel_binding"
    ]

    return urlunsplit(
        (
            "postgresql+asyncpg",
            parsed.netloc,
            parsed.path,
            urlencode(query),
            parsed.fragment,
        )
    )


settings = get_settings()
database_url = normalize_database_url(settings.database_url)

engine = create_async_engine(
    database_url,
    echo=False,
    pool_pre_ping=True,
)
async_session = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session


async def init_models() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
