"""数据库会话管理。

提供异步 engine、session 工厂，以及 FastAPI 依赖注入函数。
"""

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.config import settings

engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    pool_size=10,
    max_overflow=20,
)

async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db() -> AsyncSession:
    """FastAPI 依赖：获取数据库会话。

    在请求结束时自动关闭会话。
    """
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()
