"""维度分析详情模型。"""

from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, JSON, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import DimensionType


class AnalysisDimension(Base):
    """单个维度的分析详情 — 每条分析记录对应 5 行。"""

    __tablename__ = "analysis_dimensions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, comment="主键")
    analysis_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("analyses.id"), nullable=False, comment="关联分析"
    )
    dimension_type: Mapped[DimensionType] = mapped_column(
        Enum(DimensionType), nullable=False, comment="维度类型"
    )

    score: Mapped[float] = mapped_column(Float, default=0, comment="维度评分 0-10")
    detail: Mapped[dict] = mapped_column(JSON, default=dict, comment="维度详情 JSON")

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), server_default=func.now(), comment="创建时间"
    )

    # 反向关联
    analysis: Mapped["Analysis"] = relationship(back_populates="dimensions")


# ---------------------------------------------------------------------------
# 辅助
# ---------------------------------------------------------------------------

def _empty_detail(dim_type: DimensionType) -> dict:
    """返回单个维度的空详情结构。"""
    return {
        DimensionType.design: {
            "packaging": "", "colorOptions": [], "sizeOptions": [],
            "userLikes": [], "userHates": [], "gapOpportunities": [],
        },
        DimensionType.pricing: {
            "competitorPrice": 0, "ourPrice": 0,
            "hasFreeTrial": False, "hasInstallment": False,
            "plans": [], "pricingGaps": [],
        },
        DimensionType.functionality: {
            "solves": [], "gaps": [], "painPoints": [],
        },
        DimensionType.quality: {
            "easeOfUse": "", "durability": "",
            "qualityIssues": [],
            "userFeedback": {"positive": [], "negative": []},
        },
        DimensionType.service: {
            "responseStyle": "", "avgResponseTime": "",
            "commonComplaints": [], "serviceLikes": [],
        },
    }.get(dim_type, {})
