"""商品分析服务。

负责：
1. 解析商品 URL
2. 调用 JustOneAPI 获取商品详情
3. 映射为 ProductAnalysis 模型并持久化
4. 预留 AI 分析接口
"""

from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product import ProductAnalysis
from app.services.justone import justone_service
from app.services.url_parser import (
    UNSUPPORTED_PLATFORMS,
    parse_product_url,
)


class UnsupportedPlatformError(Exception):
    """不支持的平台异常。"""

    def __init__(self, platform: str) -> None:
        self.platform = platform
        super().__init__(f"暂不支持{platform}平台")


class ProductNotFoundError(Exception):
    """商品未找到异常。"""

    def __init__(self) -> None:
        super().__init__("未找到该商品")


class ProductAnalyzer:
    """商品分析器。

    使用方式：:

        analyzer = ProductAnalyzer(db_session)
        result = await analyzer.analyze("https://item.jd.com/xxx.html")
    """

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    # ------------------------------------------------------------------
    # 核心方法
    # ------------------------------------------------------------------

    async def analyze(self, url: str) -> dict:
        """解析并分析商品链接。

        抛出:
            UnsupportedPlatformError: 平台暂不支持
            ProductNotFoundError: 商品未找到
        """
        # 1. 解析 URL
        parsed = parse_product_url(url)
        if parsed is None:
            raise ProductNotFoundError()

        if not parsed.is_supported:
            raise UnsupportedPlatformError(parsed.platform)

        # 2. 获取商品详情
        raw_data = await justone_service.get_product_detail(
            parsed.platform, parsed.product_id
        )
        if raw_data is None:
            raise ProductNotFoundError()

        # 3. 映射数据
        mapped = self._map_raw_to_product(parsed.platform, url, raw_data)

        # 4. 持久化
        record = ProductAnalysis(**mapped)
        self._db.add(record)
        await self._db.commit()
        await self._db.refresh(record)

        return record.to_dict()

    async def get_records(self, query: str = "") -> list[dict]:
        """查询历史分析记录。"""
        stmt = select(ProductAnalysis).order_by(
            ProductAnalysis.created_at.desc()
        )
        if query.strip():
            q = f"%{query.strip()}%"
            stmt = stmt.where(
                ProductAnalysis.name.like(q)
                | ProductAnalysis.platform.like(q)
                | ProductAnalysis.shop_name.like(q)
            )

        result = await self._db.execute(stmt)
        records = result.scalars().all()
        return [r.to_dict() for r in records]

    async def delete_record(self, record_id: int) -> bool:
        """删除分析记录。"""
        stmt = select(ProductAnalysis).where(ProductAnalysis.id == record_id)
        result = await self._db.execute(stmt)
        record = result.scalar_one_or_none()
        if record is None:
            return False

        await self._db.delete(record)
        await self._db.commit()
        return True

    # ------------------------------------------------------------------
    # 数据映射 (JustOneAPI 原始数据 → 模型字段)
    # ------------------------------------------------------------------

    def _map_raw_to_product(
        self, platform: str, url: str, raw: dict
    ) -> dict:
        """将 JustOneAPI 返回的原始数据映射为 ProductAnalysis 字段。"""
        return {
            "url": url,
            "platform": platform,
            "name": self._extract_name(raw),
            "image": self._guess_icon(raw),
            "current_price": self._extract_price(raw),
            "original_price": self._extract_original_price(raw),
            "monthly_sales": self._extract_sales(raw),
            "shop_name": self._extract_shop_name(raw),
            "category": self._extract_category(raw),
            "rating": self._extract_rating(raw),
            "reviews": self._extract_review_count(raw),
            # 评分为占位值，后续可通过 AI 填充
            "design_score": 7.0,
            "pricing_score": 7.0,
            "functionality_score": 7.0,
            "quality_score": 7.0,
            "service_score": 7.0,
            "raw_data": raw,
            "dimensions": self._build_default_dimensions(raw),
            "highlights": ["商品数据已接入", "支持实时价格查询"],
            "warnings": ["AI 深度分析尚未接入"],
            "gap_opportunities": ["接入 AI 分析获取竞品差异"],
            "analyzed_at": datetime.now(),
        }

    # ------------------------------------------------------------------
    # 字段提取辅助方法
    # ------------------------------------------------------------------

    @staticmethod
    def _extract_name(raw: dict) -> str:
        for key in ("title", "name", "item_title", "product_name"):
            if val := raw.get(key):
                return str(val)
        return "未知商品"

    @staticmethod
    def _extract_price(raw: dict) -> float:
        for key in ("price", "current_price", "sale_price", "item_price"):
            if (val := raw.get(key)) is not None:
                try:
                    return float(val)
                except (TypeError, ValueError):
                    pass
        # 尝试从 sku 列表中取最低价
        if skus := raw.get("skus") or raw.get("sku_list"):
            try:
                return min(
                    float(s.get("price", 999999))
                    for s in skus
                    if s.get("price")
                )
            except (TypeError, ValueError):
                pass
        return 0.0

    @staticmethod
    def _extract_original_price(raw: dict) -> float | None:
        for key in ("original_price", "market_price", "org_price"):
            if (val := raw.get(key)) is not None:
                try:
                    return float(val)
                except (TypeError, ValueError):
                    pass
        return None

    @staticmethod
    def _extract_sales(raw: dict) -> int:
        for key in ("sales", "monthly_sales", "sale_count", "sold"):
            if (val := raw.get(key)) is not None:
                try:
                    return int(val)
                except (TypeError, ValueError):
                    pass
        return 0

    @staticmethod
    def _extract_shop_name(raw: dict) -> str:
        shop = raw.get("shop") or raw.get("seller") or {}
        if isinstance(shop, dict):
            return str(shop.get("name", shop.get("shop_name", "")))
        return str(shop)

    @staticmethod
    def _extract_category(raw: dict) -> str:
        cat = raw.get("category", raw.get("categories", ""))
        if isinstance(cat, list):
            return " > ".join(str(c) for c in cat)
        return str(cat)

    @staticmethod
    def _extract_rating(raw: dict) -> float:
        for key in ("rating", "score", "avg_score"):
            if (val := raw.get(key)) is not None:
                try:
                    return float(val)
                except (TypeError, ValueError):
                    pass
        return 0.0

    @staticmethod
    def _extract_review_count(raw: dict) -> int:
        for key in ("reviews", "comment_count", "total_comments"):
            if (val := raw.get(key)) is not None:
                try:
                    return int(val)
                except (TypeError, ValueError):
                    pass
        return 0

    @staticmethod
    def _guess_icon(raw: dict) -> str:
        name = ProductAnalyzer._extract_name(raw)
        icons = {
            "耳机": "🎧", "手机": "📱", "电脑": "💻", "笔记本": "💻",
            "显示器": "🖥️", "键盘": "⌨️", "鼠标": "🖱️", "平板": "📱",
            "手表": "⌚", "音箱": "🔊", "相机": "📷", "游戏": "🎮",
            "咖啡": "☕", "茶": "🍵", "鞋": "👟", "衣服": "👕",
            "裤子": "👖", "包": "🎒", "化妆品": "💄", "食品": "🍜",
        }
        for kw, icon in icons.items():
            if kw in name:
                return icon
        return "📦"

    @staticmethod
    def _build_default_dimensions(raw: dict) -> dict:
        """构建默认的五维度结构（AI 未介入前的占位数据）。"""
        name = ProductAnalyzer._extract_name(raw)
        price = ProductAnalyzer._extract_price(raw)
        return {
            "design": {
                "packaging": "暂无包装数据",
                "colorOptions": [],
                "sizeOptions": [],
                "userLikes": [],
                "userHates": [],
                "gapOpportunities": [],
            },
            "pricing": {
                "ourPrice": price,
                "hasFreeTrial": False,
                "hasInstallment": False,
                "plans": [{"name": "标准版", "price": price}],
                "pricingGaps": [],
            },
            "functionality": {
                "solves": [],
                "gaps": [],
                "painPoints": [],
            },
            "quality": {
                "easeOfUse": "",
                "durability": "",
                "qualityIssues": [],
                "userFeedback": {"positive": [], "negative": []},
            },
            "service": {
                "responseStyle": "",
                "avgResponseTime": "",
                "commonComplaints": [],
                "serviceLikes": [],
            },
        }
