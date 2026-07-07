"""价格监控 API 路由。"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.monitor import AddMonitorRequest
from app.schemas.response import error, success
from app.services.price_monitor import MonitorError, PriceMonitorService

router = APIRouter(prefix="/api/price", tags=["价格监控"])


# ---------------------------------------------------------------------------
# 依赖注入
# ---------------------------------------------------------------------------

def _get_monitor_svc(db: AsyncSession = Depends(get_db)) -> PriceMonitorService:
    return PriceMonitorService(db)


# ---------------------------------------------------------------------------
# 路由
# ---------------------------------------------------------------------------


@router.get("/monitor", summary="获取监控列表")
async def get_monitor_list(
    svc: PriceMonitorService = Depends(_get_monitor_svc),
):
    """获取所有价格监控商品。"""
    records = await svc.get_list()
    return success({"records": records, "total": len(records)})


@router.post("/monitor", summary="添加价格监控")
async def add_monitor(
    body: AddMonitorRequest,
    svc: PriceMonitorService = Depends(_get_monitor_svc),
):
    """添加商品到价格监控列表。"""
    try:
        record = await svc.add_monitor(body.url, body.targetPrice)
        return success(record, "监控已添加")
    except MonitorError as exc:
        return error(code=400, message=str(exc))


@router.delete("/monitor/{monitor_id}", summary="删除监控")
async def delete_monitor(
    monitor_id: int,
    svc: PriceMonitorService = Depends(_get_monitor_svc),
):
    """删除指定的监控记录。"""
    deleted = await svc.delete_monitor(monitor_id)
    if not deleted:
        return error(code=404, message="监控记录不存在")
    return success(None, "已删除")


@router.get("/stats", summary="监控统计")
async def get_stats(
    svc: PriceMonitorService = Depends(_get_monitor_svc),
):
    """获取监控数据统计概览。"""
    return success(await svc.get_stats())


@router.get("/compare/{monitor_id}", summary="跨平台比价")
async def get_compare(
    monitor_id: int,
    svc: PriceMonitorService = Depends(_get_monitor_svc),
):
    """获取指定商品的多平台价格对比。"""
    data = await svc.get_compare(monitor_id)
    if data is None:
        return error(code=404, message="记录不存在")
    return success(data)


@router.get("/history/{monitor_id}", summary="价格历史走势")
async def get_history(
    monitor_id: int,
    svc: PriceMonitorService = Depends(_get_monitor_svc),
):
    """获取指定商品的历史价格走势。"""
    data = await svc.get_history(monitor_id)
    if data is None:
        return error(code=404, message="记录不存在")
    return success(data)
