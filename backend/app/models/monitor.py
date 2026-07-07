"""价格监控 - 数据库模型。"""

from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class PriceMonitor(Base):
    """价格监控表。"""

    __tablename__ = "price_monitors"

    # ------------------------------------------------------------------
    # 主键
    # ------------------------------------------------------------------
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    # ------------------------------------------------------------------
    # 商品信息
    # ------------------------------------------------------------------
    url: Mapped[str] = mapped_column(String(2048), nullable=False, comment="商品链接")
    platform: Mapped[str] = mapped_column(String(32), nullable=False, comment="平台")
    product_name: Mapped[str] = mapped_column(String(512), nullable=False, comment="商品名称")
    sku: Mapped[str] = mapped_column(String(128), default="", comment="SKU 编码")

    # ------------------------------------------------------------------
    # 价格信息
    # ------------------------------------------------------------------
    current_price: Mapped[float] = mapped_column(Float, nullable=False, comment="当前价格")
    target_price: Mapped[float] = mapped_column(Float, nullable=False, comment="目标价格")
    diff: Mapped[float] = mapped_column(Float, default=0, comment="差价")
    status: Mapped[str] = mapped_column(
        String(16), default="监控中", comment="监控状态：监控中 / 已触发"
    )

    # ------------------------------------------------------------------
    # 时间戳
    # ------------------------------------------------------------------
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), server_default=func.now(), comment="创建时间"
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=func.now(),
        onupdate=func.now(),
        server_default=func.now(),
        comment="更新时间",
    )

    def to_dict(self) -> dict:
        """将 ORM 对象转换为前端期望的 MonitorItem 字典。"""
        return {
            "id": self.id,
            "name": self.product_name,
            "sku": self.sku,
            "platform": self.platform,
            "currentPrice": self.current_price,
            "targetPrice": self.target_price,
            "diff": self.diff,
            "status": self.status,
        }
