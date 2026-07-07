"""FastAPI 应用入口。"""

import logging

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.db.base import Base
from app.db.session import engine
from app.routers import monitor, product
from app.schemas.response import error

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# 生命周期
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理。"""
    if settings.debug:
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            logger.info("数据库表初始化完成")
        except Exception as e:
            logger.warning(f"数据库连接失败，跳过自动建表: {e}")
    yield
    await engine.dispose()


# ---------------------------------------------------------------------------
# 应用实例
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Department Tools API",
    description="部门业务工具后端 — 竞品分析 & 价格监控",
    version="1.0.0",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# 全局异常处理 — 统一返回 { code, message, data }
# ---------------------------------------------------------------------------

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """兜底异常处理。"""
    return JSONResponse(
        status_code=500,
        content=error(code=500, message=f"服务器内部错误: {str(exc)}"),
    )


# ---------------------------------------------------------------------------
# 路由注册
# ---------------------------------------------------------------------------

app.include_router(product.router)
app.include_router(monitor.router)


# ---------------------------------------------------------------------------
# 健康检查
# ---------------------------------------------------------------------------

@app.get("/api/health", tags=["系统"])
async def health_check():
    """健康检查接口。"""
    return {"code": 0, "message": "ok", "data": {"status": "ok", "version": "1.0.0"}}
