"""分析记录模型。"""

from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, JSON, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import DimensionType


class Analysis(Base):
    """一次竞品分析快照 — 同一商品可多次分析，记录分析时刻的价格快照。"""

    __tablename__ = "analyses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, comment="主键")
    product_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("products.id"), nullable=False, comment="关联商品"
    )

    # 价格快照（分析时刻的瞬时值）
    current_price: Mapped[float] = mapped_column(Float, nullable=False, comment="当前售价")
    original_price: Mapped[float | None] = mapped_column(Float, nullable=True, comment="原价")
    monthly_sales: Mapped[int] = mapped_column(Integer, default=0, comment="月销量")
    rating: Mapped[float] = mapped_column(Float, default=0, comment="评分")
    reviews: Mapped[int] = mapped_column(Integer, default=0, comment="评论数")

    # 概览数据
    highlights: Mapped[list | None] = mapped_column(JSON, nullable=True, comment="优势亮点")
    warnings: Mapped[list | None] = mapped_column(JSON, nullable=True, comment="风险提示")
    gap_opportunities: Mapped[list | None] = mapped_column(JSON, nullable=True, comment="机会点")

    # 时间戳
    analyzed_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), comment="分析时间"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), server_default=func.now(), comment="创建时间"
    )

    # 关联
    product: Mapped["Product"] = relationship(back_populates="analyses")
    dimensions: Mapped[list["AnalysisDimension"]] = relationship(
        back_populates="analysis", cascade="all, delete-orphan"
    )
    raw_data_entry: Mapped["RawData | None"] = relationship(
        back_populates="analysis", cascade="all, delete-orphan", uselist=False
    )

    # ------------------------------------------------------------------
    # 序列化
    # ------------------------------------------------------------------

    def to_dict(self) -> dict:
        """组装为前端期望的 ProductAnalysis 结构。"""
        from app.models.dimension import _empty_detail

        dim_map = {d.dimension_type.value: d for d in (self.dimensions or [])}

        def dim(dim_type: DimensionType) -> dict:
            d = dim_map.get(dim_type.value)
            if d is None:
                return {"score": 0, "highlights": [], "warnings": [], **_empty_detail(dim_type)}
            return {
                "score": d.score,
                "highlights": self.highlights or [],
                "warnings": self.warnings or [],
                **d.detail,
            }

        return {
            "id": str(self.id),
            "url": self.product.url,
            "name": self.product.name,
            "platform": self.product.platform,
            "image": self.product.image,
            "currentPrice": self.current_price,
            "originalPrice": self.original_price or self.current_price,
            "monthlySales": self.monthly_sales,
            "shopName": self.product.shop_name,
            "category": self.product.category,
            "rating": self.rating,
            "reviews": self.reviews,
            "analyzedAt": self.analyzed_at.isoformat() if self.analyzed_at else "",
            "design": dim(DimensionType.design),
            "pricing": dim(DimensionType.pricing),
            "functionality": dim(DimensionType.functionality),
            "quality": dim(DimensionType.quality),
            "service": dim(DimensionType.service),
        }
