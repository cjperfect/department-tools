"""价格监控 - 请求/响应 Schema。"""

from pydantic import BaseModel, Field


class AddMonitorRequest(BaseModel):
    """添加监控请求。"""

    url: str = Field(..., min_length=1, description="商品链接")
    targetPrice: float = Field(..., gt=0, description="目标价格")


class MonitorItem(BaseModel):
    """监控商品条目。"""

    id: int
    name: str
    sku: str
    platform: str
    currentPrice: float
    targetPrice: float
    diff: float
    status: str


class MonitorListResponse(BaseModel):
    """监控列表响应。"""

    records: list[MonitorItem]
    total: int


class MonitorStats(BaseModel):
    """监控统计。"""

    total: int
    monitoring: int
    triggered: int
    priceDown: int
    priceUp: int


class CompareResponse(BaseModel):
    """比价响应。"""

    id: int
    name: str
    prices: list[dict]


class HistoryResponse(BaseModel):
    """历史走势响应。"""

    id: int
    name: str
    data: list[dict]
