"""原始 API 数据模型。"""

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, JSON, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class RawData(Base):
    """JustOneAPI 原始返回 — 为后续 AI 深度分析预留。"""

    __tablename__ = "raw_data"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, comment="主键")
    analysis_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("analyses.id"), unique=True, nullable=False, comment="关联分析"
    )
    data: Mapped[dict] = mapped_column(JSON, nullable=False, comment="API 原始 JSON")

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), server_default=func.now(), comment="创建时间"
    )

    # 反向关联
    analysis: Mapped["Analysis"] = relationship(back_populates="raw_data_entry")
