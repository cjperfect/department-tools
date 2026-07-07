"""竞品分析 - 请求/响应 Schema。"""

from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    """分析请求。"""

    url: str = Field(
        ...,
        min_length=1,
        description="商品链接",
        examples=["https://item.jd.com/100012345678.html"],
    )


class AnalyzeResponse(BaseModel):
    """分析响应 — 直接返回 ProductAnalysis 字典。"""

    id: str
    name: str
    platform: str
    image: str
    currentPrice: float
    originalPrice: float
    monthlySales: int
    shopName: str
    category: str
    rating: float
    reviews: int
    analyzedAt: str
    design: dict
    pricing: dict
    functionality: dict
    quality: dict
    service: dict


class SearchResponse(BaseModel):
    """搜索响应。"""

    records: list[dict]
    total: int
