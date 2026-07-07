"""竞品分析 - 数据库模型。"""

from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, JSON, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ProductAnalysis(Base):
    """竞品分析记录表。"""

    __tablename__ = "product_analyses"

    # ------------------------------------------------------------------
    # 主键 & 业务标识
    # ------------------------------------------------------------------
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    url: Mapped[str] = mapped_column(String(2048), nullable=False, comment="商品链接")
    platform: Mapped[str] = mapped_column(String(32), nullable=False, comment="平台")

    # ------------------------------------------------------------------
    # 商品基本信息
    # ------------------------------------------------------------------
    name: Mapped[str] = mapped_column(String(512), nullable=False, comment="商品名称")
    image: Mapped[str] = mapped_column(String(8), default="📦", comment="商品图标")
    current_price: Mapped[float] = mapped_column(Float, nullable=False, comment="当前售价")
    original_price: Mapped[float] = mapped_column(Float, nullable=True, comment="原价")
    monthly_sales: Mapped[int] = mapped_column(Integer, default=0, comment="月销量")
    shop_name: Mapped[str] = mapped_column(String(256), default="", comment="店铺名称")
    category: Mapped[str] = mapped_column(String(256), default="", comment="商品类目")
    rating: Mapped[float] = mapped_column(Float, default=0, comment="评分")
    reviews: Mapped[int] = mapped_column(Integer, default=0, comment="评论数")

    # ------------------------------------------------------------------
    # 五维度评分
    # ------------------------------------------------------------------
    design_score: Mapped[float] = mapped_column(Float, default=0, comment="设计评分")
    pricing_score: Mapped[float] = mapped_column(Float, default=0, comment="定价评分")
    functionality_score: Mapped[float] = mapped_column(Float, default=0, comment="功能评分")
    quality_score: Mapped[float] = mapped_column(Float, default=0, comment="质量评分")
    service_score: Mapped[float] = mapped_column(Float, default=0, comment="客服评分")

    # ------------------------------------------------------------------
    # 原始数据 & 分析详情 (JSON)
    # ------------------------------------------------------------------
    raw_data: Mapped[dict | None] = mapped_column(JSON, nullable=True, comment="JustOneAPI 原始返回")
    dimensions: Mapped[dict | None] = mapped_column(JSON, nullable=True, comment="五维度分析详情")

    # ------------------------------------------------------------------
    # 建议 (供前端直接展示)
    # ------------------------------------------------------------------
    highlights: Mapped[list | None] = mapped_column(JSON, nullable=True, comment="优势亮点")
    warnings: Mapped[list | None] = mapped_column(JSON, nullable=True, comment="风险提示")
    gap_opportunities: Mapped[list | None] = mapped_column(JSON, nullable=True, comment="机会点")

    # ------------------------------------------------------------------
    # 时间戳
    # ------------------------------------------------------------------
    analyzed_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), comment="分析时间"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), server_default=func.now(), comment="创建时间"
    )

    def to_dict(self) -> dict:
        """将 ORM 对象转换为前端期望的 ProductAnalysis 字典。"""
        dims = self.dimensions or {}
        return {
            "id": str(self.id),
            "name": self.name,
            "platform": self.platform,
            "image": self.image,
            "currentPrice": self.current_price,
            "originalPrice": self.original_price or self.current_price,
            "monthlySales": self.monthly_sales,
            "shopName": self.shop_name,
            "category": self.category,
            "rating": self.rating,
            "reviews": self.reviews,
            "analyzedAt": (
                self.analyzed_at.isoformat() if self.analyzed_at else ""
            ),
            "design": {
                "score": self.design_score,
                "highlights": self.highlights or [],
                "warnings": self.warnings or [],
                "packaging": dims.get("design", {}).get("packaging", ""),
                "colorOptions": dims.get("design", {}).get("colorOptions", []),
                "sizeOptions": dims.get("design", {}).get("sizeOptions", []),
                "userLikes": dims.get("design", {}).get("userLikes", []),
                "userHates": dims.get("design", {}).get("userHates", []),
                "gapOpportunities": dims.get("design", {}).get("gapOpportunities", []),
            },
            "pricing": {
                "score": self.pricing_score,
                "highlights": [],
                "warnings": [],
                "competitorPrice": self.current_price,
                "ourPrice": dims.get("pricing", {}).get("ourPrice", self.current_price),
                "hasFreeTrial": dims.get("pricing", {}).get("hasFreeTrial", False),
                "hasInstallment": dims.get("pricing", {}).get("hasInstallment", False),
                "plans": dims.get("pricing", {}).get("plans", []),
                "pricingGaps": dims.get("pricing", {}).get("pricingGaps", []),
            },
            "functionality": {
                "score": self.functionality_score,
                "highlights": [],
                "warnings": [],
                "solves": dims.get("functionality", {}).get("solves", []),
                "gaps": dims.get("functionality", {}).get("gaps", []),
                "painPoints": dims.get("functionality", {}).get("painPoints", []),
            },
            "quality": {
                "score": self.quality_score,
                "highlights": [],
                "warnings": [],
                "easeOfUse": dims.get("quality", {}).get("easeOfUse", ""),
                "durability": dims.get("quality", {}).get("durability", ""),
                "qualityIssues": dims.get("quality", {}).get("qualityIssues", []),
                "userFeedback": dims.get("quality", {}).get("userFeedback", {
                    "positive": [],
                    "negative": [],
                }),
            },
            "service": {
                "score": self.service_score,
                "highlights": [],
                "warnings": [],
                "responseStyle": dims.get("service", {}).get("responseStyle", ""),
                "avgResponseTime": dims.get("service", {}).get("avgResponseTime", ""),
                "commonComplaints": dims.get("service", {}).get("commonComplaints", []),
                "serviceLikes": dims.get("service", {}).get("serviceLikes", []),
            },
        }
