"""JustOneAPI 客户端封装。

统一管理第三方 API 调用，提供平台级的产品查询方法。

已知限制:
- 京东详情/搜索/评论均为异步任务模式，需在控制台提交任务后获取结果
- 部分淘宝商品返回 code=202 (不支持)
- 淘宝销量接口偶发 COLLECT FAILED
"""

import logging

from justoneapi import JustOneAPIClient

logger = logging.getLogger(__name__)

from app.config import settings
from app.services.url_parser import (
    PLATFORM_JD,
    PLATFORM_TAOBAO,
    PLATFORM_TMALL,
)


class JustOneService:
    """JustOneAPI 业务封装。"""

    def __init__(self, token: str | None = None) -> None:
        self._token = token or settings.justone_api_token
        self._client = None
        if self._token:
            self._client = JustOneAPIClient(token=self._token)

    @property
    def is_available(self) -> bool:
        """Token 是否已配置。"""
        return self._client is not None

    # ------------------------------------------------------------------
    # 公开方法
    # ------------------------------------------------------------------

    async def get_product_detail(
        self, platform: str, product_id: str
    ) -> dict | None:
        """根据平台获取商品详情。"""
        if self._client is None:
            return None
        if platform in (PLATFORM_TMALL, PLATFORM_TAOBAO):
            return await self._get_taobao_detail(product_id)
        if platform in (PLATFORM_JD,):
            return await self._get_jd_detail(product_id)
        return None

    async def get_product_comments(
        self, platform: str, product_id: str
    ) -> dict | None:
        """根据平台获取商品评论。"""
        if self._client is None:
            return None
        if platform in (PLATFORM_TMALL, PLATFORM_TAOBAO):
            return await self._get_taobao_comments(product_id)
        if platform in (PLATFORM_JD,):
            return await self._get_jd_comments(product_id)
        return None

    async def get_product_price(
        self, platform: str, product_id: str
    ) -> dict | None:
        """根据平台获取额外价格信息（销量等）。"""
        if self._client is None:
            return None
        if platform in (PLATFORM_TMALL, PLATFORM_TAOBAO):
            return await self._get_taobao_sales(product_id)
        if platform in (PLATFORM_JD,):
            return await self._get_jd_price(product_id)
        return None

    async def search_products(
        self, platform: str, keyword: str
    ) -> list[dict]:
        """搜索商品列表，返回统一的简要结构。"""
        if self._client is None:
            return []
        if platform in (PLATFORM_TMALL, PLATFORM_TAOBAO):
            return await self._taobao_search(keyword)
        if platform in (PLATFORM_JD,):
            return await self._jd_search(keyword)
        return []

    # ------------------------------------------------------------------
    # 淘宝 / 天猫
    # ------------------------------------------------------------------

    async def _get_taobao_detail(self, product_id: str) -> dict | None:
        """获取淘宝/天猫商品详情 (V4)。"""
        try:
            resp = self._client.taobao.get_item_detail_v4(item_id=product_id)
            if resp.success and resp.data:
                return resp.data
            logger.warning(
                "淘宝商品详情失败 item_id=%s code=%s msg=%s",
                product_id, resp.code, resp.message,
            )
            return None
        except Exception as exc:
            logger.error("淘宝商品详情异常 item_id=%s: %s", product_id, exc)
            return None

    async def _get_taobao_comments(self, product_id: str) -> dict | None:
        """获取淘宝/天猫商品评论 (V3)。"""
        try:
            resp = self._client.taobao.get_item_comment_v3(
                item_id=product_id, page=1
            )
            if resp.success and resp.data:
                return resp.data
            return None
        except Exception:
            return None

    async def _get_taobao_sales(self, product_id: str) -> dict | None:
        """获取淘宝/天猫商品销量。"""
        try:
            resp = self._client.taobao.get_item_sale_v1(item_id=product_id)
            if resp.success and resp.data:
                return resp.data
            return None
        except Exception:
            return None

    async def _taobao_search(self, keyword: str) -> list[dict]:
        """淘宝关键词搜索。"""
        try:
            resp = self._client.taobao.search_item_list_v1(
                keyword=keyword, page=1
            )
            if resp.success and resp.data:
                return resp.data.get("model", {}).get("itemList", [])
            return []
        except Exception:
            return []

    # ------------------------------------------------------------------
    # 京东 (异步任务模式，直接调用大概率失败，留作占位)
    # ------------------------------------------------------------------

    async def _get_jd_detail(self, product_id: str) -> dict | None:
        try:
            resp = self._client.jd.get_item_detail_v2(item_id=product_id)
            if resp.success and resp.data:
                return resp.data.get("item", resp.data)
            return None
        except Exception:
            return None

    async def _get_jd_comments(self, product_id: str) -> dict | None:
        try:
            resp = self._client.jd.get_item_comments_v2(item_id=product_id)
            if resp.success and resp.data:
                return resp.data
            return None
        except Exception:
            return None

    async def _get_jd_price(self, product_id: str) -> dict | None:
        try:
            resp = self._client.jd.get_item_price_v1(item_id=product_id)
            if resp.success and resp.data:
                return resp.data
            return None
        except Exception:
            return None

    async def _jd_search(self, keyword: str) -> list[dict]:
        try:
            resp = self._client.jd.search_item_list_v2(
                keyword=keyword, page="1"
            )
            if resp.success and resp.data:
                return resp.data if isinstance(resp.data, list) else []
            return []
        except Exception:
            return []


# 模块级单例
justone_service = JustOneService()
