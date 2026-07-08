"""商品基础信息模型。"""

from datetime import datetime

from sqlalchemy import DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Product(Base):
    """商品基础信息表 — 每个 URL 唯一，不变属性存这里。"""

    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, comment="主键")
    url: Mapped[str] = mapped_column(
        String(768), nullable=False, unique=True, comment="商品链接"
    )
    platform: Mapped[str] = mapped_column(String(32), nullable=False, comment="平台")
    name: Mapped[str] = mapped_column(String(512), nullable=False, comment="商品名称")
    image: Mapped[str] = mapped_column(String(8), default="📦", comment="图标")
    shop_name: Mapped[str] = mapped_column(String(256), default="", comment="店铺名称")
    category: Mapped[str] = mapped_column(String(256), default="", comment="商品类目")

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), server_default=func.now(), comment="首次收录时间"
    )

    # 反向关联
    analyses: Mapped[list["Analysis"]] = relationship(
        back_populates="product", cascade="all, delete-orphan"
    )
