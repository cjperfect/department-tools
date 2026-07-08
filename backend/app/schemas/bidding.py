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
