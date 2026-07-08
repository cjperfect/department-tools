"""竞品分析 API 路由。"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.bidding import AnalyzeRequest
from app.schemas.response import error, success
from app.services.product_analyzer import (
    ProductAnalyzer,
    ProductNotFoundError,
    UnsupportedPlatformError,
)

router = APIRouter(prefix="/api/bidding", tags=["竞品分析"])


# ---------------------------------------------------------------------------
# 依赖注入
# ---------------------------------------------------------------------------

def _get_analyzer(db: AsyncSession = Depends(get_db)) -> ProductAnalyzer:
    return ProductAnalyzer(db)


# ---------------------------------------------------------------------------
# 路由
# ---------------------------------------------------------------------------


@router.post("/analyze", summary="分析竞品链接")
async def analyze_product(
    body: AnalyzeRequest,
    analyzer: ProductAnalyzer = Depends(_get_analyzer),
):
    """提交电商商品链接，返回竞品分析结果。"""
    try:
        result = await analyzer.analyze(body.url)
        return success(result, "分析完成")
    except UnsupportedPlatformError as exc:
        return error(code=400, message=str(exc))
    except ProductNotFoundError as exc:
        return error(code=404, message=str(exc))


@router.get("/records", summary="查询历史记录")
async def search_records(
    q: str = "",
    analyzer: ProductAnalyzer = Depends(_get_analyzer),
):
    """按关键词搜索已分析的商品记录。"""
    records = await analyzer.get_records(q)
    return success({"records": records, "total": len(records)})


@router.delete("/records/{record_id}", summary="删除分析记录")
async def delete_record(
    record_id: int,
    analyzer: ProductAnalyzer = Depends(_get_analyzer),
):
    """删除指定的分析记录。"""
    deleted = await analyzer.delete_record(record_id)
    if not deleted:
        return error(code=404, message="记录不存在")
    return success(None, "已删除")
