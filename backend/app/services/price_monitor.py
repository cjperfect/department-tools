"""价格监控服务。

负责监控商品的增删查以及价格刷新逻辑。
"""

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.monitor import PriceMonitor
from app.services.justone import justone_service
from app.services.url_parser import UNSUPPORTED_PLATFORMS, parse_product_url


class MonitorError(Exception):
    """监控操作异常。"""

    def __init__(self, message: str) -> None:
        super().__init__(message)


class PriceMonitorService:
    """价格监控服务。"""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    # ------------------------------------------------------------------
    # 监控列表
    # ------------------------------------------------------------------

    async def get_list(self) -> list[dict]:
        """获取所有监控商品列表。"""
        stmt = select(PriceMonitor).order_by(PriceMonitor.created_at.desc())
        result = await self._db.execute(stmt)
        return [r.to_dict() for r in result.scalars().all()]

    # ------------------------------------------------------------------
    # 添加监控
    # ------------------------------------------------------------------

    async def add_monitor(self, url: str, target_price: float) -> dict:
        """添加商品到监控列表。"""
        # 1. 解析 URL
        parsed = parse_product_url(url)
        if parsed is None:
            raise MonitorError("未识别该商品链接")

        if not parsed.is_supported:
            raise MonitorError(f"暂不支持{parsed.platform}平台")

        # 2. 获取商品详情
        raw = await justone_service.get_product_detail(
            parsed.platform, parsed.product_id
        )
        if raw is None:
            raise MonitorError("未找到该商品")

        # 3. 提取价格
        current_price = self._extract_price(raw)
        product_name = self._extract_name(raw)

        # 4. 创建监控记录
        diff = current_price - target_price
        status = "已触发" if current_price <= target_price else "监控中"

        record = PriceMonitor(
            url=url,
            platform=parsed.platform,
            product_name=product_name,
            sku=parsed.product_id,
            current_price=current_price,
            target_price=target_price,
            diff=diff,
            status=status,
        )
        self._db.add(record)
        await self._db.commit()
        await self._db.refresh(record)

        return record.to_dict()

    # ------------------------------------------------------------------
    # 删除监控
    # ------------------------------------------------------------------

    async def delete_monitor(self, monitor_id: int) -> bool:
        """删除监控记录。"""
        stmt = select(PriceMonitor).where(PriceMonitor.id == monitor_id)
        result = await self._db.execute(stmt)
        record = result.scalar_one_or_none()
        if record is None:
            return False

        await self._db.delete(record)
        await self._db.commit()
        return True

    # ------------------------------------------------------------------
    # 统计
    # ------------------------------------------------------------------

    async def get_stats(self) -> dict:
        """获取监控统计概览。"""
        total_result = await self._db.execute(
            select(func.count(PriceMonitor.id))
        )
        total = total_result.scalar() or 0

        triggered_result = await self._db.execute(
            select(func.count(PriceMonitor.id)).where(
                PriceMonitor.status == "已触发"
            )
        )
        triggered = triggered_result.scalar() or 0

        monitoring = total - triggered

        # 降价数量（diff < 0）
        down_result = await self._db.execute(
            select(func.count(PriceMonitor.id)).where(PriceMonitor.diff < 0)
        )
        price_down = down_result.scalar() or 0

        # 涨价数量（diff > 0）
        up_result = await self._db.execute(
            select(func.count(PriceMonitor.id)).where(PriceMonitor.diff > 0)
        )
        price_up = up_result.scalar() or 0

        return {
            "total": total,
            "monitoring": monitoring,
            "triggered": triggered,
            "priceDown": price_down,
            "priceUp": price_up,
        }

    # ------------------------------------------------------------------
    # 比价 & 历史 (MVP 阶段返回基础数据)
    # ------------------------------------------------------------------

    async def get_compare(self, monitor_id: int) -> dict | None:
        """获取跨平台比价数据。"""
        stmt = select(PriceMonitor).where(PriceMonitor.id == monitor_id)
        result = await self._db.execute(stmt)
        record = result.scalar_one_or_none()
        if record is None:
            return None

        return {
            "id": record.id,
            "name": record.product_name,
            "prices": [
                {"platform": record.platform, "price": record.current_price},
            ],
        }

    async def get_history(self, monitor_id: int) -> dict | None:
        """获取历史价格走势。"""
        stmt = select(PriceMonitor).where(PriceMonitor.id == monitor_id)
        result = await self._db.execute(stmt)
        record = result.scalar_one_or_none()
        if record is None:
            return None

        return {
            "id": record.id,
            "name": record.product_name,
            "data": [
                {"date": record.created_at.strftime("%m-%d"), "price": record.current_price},
            ],
        }

    # ------------------------------------------------------------------
    # 辅助方法
    # ------------------------------------------------------------------

    @staticmethod
    def _extract_price(raw: dict) -> float:
        """提取价格。淘宝 API 返回分，需 /100。"""
        # 淘宝折扣价 (分)
        if (val := raw.get("DiscountPrice")) is not None:
            try:
                p = float(val)
                return p / 100 if p > 1000 else p
            except (TypeError, ValueError):
                pass
        # 淘宝原价 (分)
        if (val := raw.get("itemPrice")) is not None:
            try:
                p = float(val)
                return p / 100 if p > 1000 else p
            except (TypeError, ValueError):
                pass
        # 通用字段
        for key in ("price", "current_price", "sale_price", "item_price"):
            if (val := raw.get(key)) is not None:
                try:
                    return float(val)
                except (TypeError, ValueError):
                    pass
        return 0.0

    @staticmethod
    def _extract_name(raw: dict) -> str:
        for key in ("title", "name", "item_title", "product_name"):
            if val := raw.get(key):
                return str(val)
        return "未知商品"
