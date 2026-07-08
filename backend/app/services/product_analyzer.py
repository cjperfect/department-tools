"""商品分析服务。

负责：
1. 解析商品 URL
2. 调用 JustOneAPI 获取详情
3. 写入 products / analyses / analysis_dimensions / raw_data 四张表
4. 预留 AI 分析接口
"""

from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.analysis import Analysis
from app.models.dimension import AnalysisDimension, _empty_detail
from app.models.enums import DimensionType
from app.models.product import Product
from app.models.raw_data import RawData
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
    """商品分析器。"""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    # ------------------------------------------------------------------
    # 核心方法
    # ------------------------------------------------------------------

    async def analyze(self, url: str) -> dict:
        """解析并分析商品链接。"""
        # 1. 解析 URL
        parsed = parse_product_url(url)
        if parsed is None:
            raise ProductNotFoundError()
        if not parsed.is_supported:
            raise UnsupportedPlatformError(parsed.platform)

        # 2. 获取商品详情（必选）
        if not justone_service.is_available:
            raise ProductNotFoundError()
        raw = await justone_service.get_product_detail(
            parsed.platform, parsed.product_id
        )
        if raw is None:
            raise ProductNotFoundError()

        # 2b. 获取评论和价格（可选，失败不阻塞）
        raw_comments = await justone_service.get_product_comments(
            parsed.platform, parsed.product_id
        )
        raw_price = await justone_service.get_product_price(
            parsed.platform, parsed.product_id
        )

        # 3. 查找或创建商品
        product = await self._find_or_create_product(parsed.platform, url, raw)

        # 4. 提取字段（传入评论数据以获取评论数）
        ctx = {"platform": parsed.platform, "raw": raw, "comments": raw_comments}
        current_price = self._extract_price(ctx)
        original_price = self._extract_original_price(ctx)
        reviews = self._extract_review_count(ctx)

        # 5. 创建分析记录
        analysis = Analysis(
            product_id=product.id,
            current_price=current_price,
            original_price=original_price if original_price != current_price else None,
            monthly_sales=self._extract_sales(ctx),
            rating=self._extract_rating(ctx),
            reviews=reviews,
            highlights=["商品数据已接入", "支持实时价格查询"],
            warnings=["AI 深度分析尚未接入"],
            gap_opportunities=["接入 AI 分析获取竞品差异"],
            analyzed_at=datetime.now(),
        )
        self._db.add(analysis)
        await self._db.flush()

        # 6. 写入五个维度（占位数据）
        for dim_type in DimensionType:
            self._db.add(AnalysisDimension(
                analysis_id=analysis.id,
                dimension_type=dim_type,
                score=0,
                detail=self._build_dimension_detail(dim_type, current_price),
            ))

        # 6. 存储原始数据（详情 + 评论 + 价格）
        self._db.add(RawData(analysis_id=analysis.id, data={
            "detail": raw,
            "comments": raw_comments,
            "price": raw_price,
        }))

        await self._db.commit()

        # 7. 重新加载关联数据后序列化
        return await self._load_analysis(analysis.id)

    async def get_records(self, query: str = "") -> list[dict]:
        """查询历史分析记录。"""
        stmt = (
            select(Analysis)
            .options(selectinload(Analysis.product))
            .order_by(Analysis.created_at.desc())
        )
        if query.strip():
            q = f"%{query.strip()}%"
            stmt = stmt.join(Analysis.product).where(
                Product.name.like(q)
                | Product.platform.like(q)
                | Product.shop_name.like(q)
            )

        result = await self._db.execute(stmt)
        records = result.unique().scalars().all()
        return [r.to_dict() for r in records]

    async def delete_record(self, record_id: int) -> bool:
        """删除分析记录（级联删除维度和原始数据）。"""
        stmt = select(Analysis).where(Analysis.id == record_id)
        result = await self._db.execute(stmt)
        record = result.scalar_one_or_none()
        if record is None:
            return False

        await self._db.delete(record)
        await self._db.commit()
        return True

    # ------------------------------------------------------------------
    # 内部方法
    # ------------------------------------------------------------------

    async def _find_or_create_product(
        self, platform: str, url: str, raw: dict
    ) -> Product:
        """查找已有商品，不存在则创建。"""
        stmt = select(Product).where(Product.url == url)
        result = await self._db.execute(stmt)
        existing = result.scalar_one_or_none()
        if existing:
            return existing

        # 用 ctx 包装以复用提取器
        ctx = {"platform": platform, "raw": raw, "comments": None}
        product = Product(
            url=url,
            platform=platform,
            name=self._extract_name(ctx),
            image=self._guess_icon(ctx),
            shop_name=self._extract_shop_name(ctx),
            category=self._extract_category(ctx),
        )
        self._db.add(product)
        await self._db.flush()
        return product

    async def _load_analysis(self, analysis_id: int) -> dict:
        """重新加载分析记录（含关联的维度、原始数据）。"""
        stmt = (
            select(Analysis)
            .where(Analysis.id == analysis_id)
            .options(
                selectinload(Analysis.product),
                selectinload(Analysis.dimensions),
            )
        )
        result = await self._db.execute(stmt)
        return result.scalar_one().to_dict()

    def _build_dimension_detail(
        self, dim_type: DimensionType, price: float
    ) -> dict:
        """构建单个维度的详情 JSON（AI 未介入前的占位数据）。"""
        detail = _empty_detail(dim_type)
        if dim_type == DimensionType.pricing:
            detail["competitorPrice"] = price
            detail["ourPrice"] = price
            detail["plans"] = [{"name": "标准版", "price": price}]
        return detail

    # ------------------------------------------------------------------
    # 字段提取（ctx: {platform, raw, comments}）
    # ------------------------------------------------------------------

    @staticmethod
    def _raw(ctx: dict) -> dict:
        return ctx["raw"] or {}

    @staticmethod
    def _comments(ctx: dict) -> dict:
        return ctx["comments"] or {}

    @classmethod
    def _extract_name(cls, ctx: dict) -> str:
        r = cls._raw(ctx)
        # 淘宝: title; 京东: name
        for key in ("title", "name", "item_title", "product_name"):
            if val := r.get(key):
                return str(val)
        return "未知商品"

    @classmethod
    def _extract_price(cls, ctx: dict) -> float:
        """获取当前售价。淘宝 API 价格单位为分，需 /100。"""
        r = cls._raw(ctx)
        # 淘宝: itemPrice (分) / DiscountPrice (分)
        for key in ("DiscountPrice", "itemPrice"):
            if (val := r.get(key)) is not None:
                try:
                    price = float(val)
                    return price / 100 if price > 1000 else price
                except (TypeError, ValueError):
                    pass
        # 京东 & 通用: price 字段
        for key in ("price", "current_price", "sale_price", "item_price"):
            if (val := r.get(key)) is not None:
                try:
                    return float(val)
                except (TypeError, ValueError):
                    pass
        # SKU 最低价
        skus = r.get("sku2info") or r.get("skus") or r.get("sku_list") or []
        if skus:
            try:
                prices = []
                for s in skus:
                    p = s.get("finalSkuPrice") or s.get("finalPrice") or s.get("price", 999999)
                    prices.append(float(p) / 100 if float(p) > 1000 else float(p))
                return min(prices)
            except (TypeError, ValueError):
                pass
        return 0.0

    @classmethod
    def _extract_original_price(cls, ctx: dict) -> float:
        """获取原价。"""
        r = cls._raw(ctx)
        # 淘宝: itemPrice 是原价 (分)
        if val := r.get("itemPrice"):
            try:
                p = float(val)
                return p / 100 if p > 1000 else p
            except (TypeError, ValueError):
                pass
        for key in ("original_price", "market_price", "org_price"):
            if (val := r.get(key)) is not None:
                try:
                    return float(val)
                except (TypeError, ValueError):
                    pass
        return cls._extract_price(ctx)

    @classmethod
    def _extract_sales(cls, ctx: dict) -> int:
        r = cls._raw(ctx)
        for key in ("sales", "monthly_sales", "sale_count", "sold", "orderPayUV"):
            if (val := r.get(key)) is not None:
                try:
                    # "1万+" → 10000
                    if isinstance(val, str):
                        if "万+" in val:
                            return int(float(val.replace("万+", "")) * 10000)
                        if "万" in val:
                            return int(float(val.replace("万", "")) * 10000)
                    return int(val)
                except (TypeError, ValueError):
                    pass
        return 0

    @classmethod
    def _extract_shop_name(cls, ctx: dict) -> str:
        r = cls._raw(ctx)
        # 淘宝: shopName 在搜索结果的 model.itemList[].shopName
        shop = r.get("shop") or r.get("seller") or r.get("shopName", "")
        if isinstance(shop, dict):
            return str(shop.get("name", shop.get("shop_name", "")))
        return str(shop)

    @classmethod
    def _extract_category(cls, ctx: dict) -> str:
        r = cls._raw(ctx)
        # 淘宝: category 或 rootCategoryId
        cat = r.get("category") or r.get("categories") or r.get("categoryId", "")
        if isinstance(cat, list):
            return " > ".join(str(c) for c in cat)
        # 淘宝可能返回数字 ID
        if isinstance(cat, (int, float)):
            return str(int(cat))
        return str(cat)

    @classmethod
    def _extract_rating(cls, ctx: dict) -> float:
        r = cls._raw(ctx)
        # 淘宝: sellerGoodrat (万分制，10000=5.0)
        if val := r.get("sellerGoodrat"):
            try:
                return round(float(val) / 2000, 1)
            except (TypeError, ValueError):
                pass
        for key in ("rating", "score", "avg_score", "itemGradeAvg"):
            if (val := r.get(key)) is not None:
                try:
                    v = float(val)
                    return v / 2000 if v > 100 else v
                except (TypeError, ValueError):
                    pass
        return 0.0

    @classmethod
    def _extract_review_count(cls, ctx: dict) -> int:
        """获取评论数，优先从评论接口取 total。"""
        c = cls._comments(ctx)
        if val := c.get("total"):
            try:
                return int(val)
            except (TypeError, ValueError):
                pass
        r = cls._raw(ctx)
        for key in ("commentCount", "reviews", "comment_count", "total_comments"):
            if (val := r.get(key)) is not None:
                try:
                    return int(val)
                except (TypeError, ValueError):
                    pass
        return 0

    @classmethod
    def _guess_icon(cls, ctx: dict) -> str:
        name = cls._extract_name(ctx)
        icons = {
            "耳机": "🎧", "手机": "📱", "电脑": "💻", "笔记本": "💻",
            "显示器": "🖥️", "键盘": "⌨️", "鼠标": "🖱️",
            "手表": "⌚", "音箱": "🔊", "相机": "📷", "游戏": "🎮",
            "咖啡": "☕", "茶": "🍵", "鞋": "👟", "衣服": "👕",
            "裤子": "👖", "包": "🎒", "化妆品": "💄", "食品": "🍜",
        }
        for kw, icon in icons.items():
            if kw in name:
                return icon
        return "📦"
