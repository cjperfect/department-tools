"""JustOneAPI 客户端封装。

统一管理第三方 API 调用，提供平台级的产品查询方法。
"""

from justoneapi import JustOneAPIClient

from app.config import settings
from app.services.url_parser import (
    PLATFORM_JD,
    PLATFORM_TAOBAO,
    PLATFORM_TMALL,
)


class JustOneService:
    """JustOneAPI 业务封装。

    负责：
    - 根据平台调用对应的 API 方法
    - 统一返回数据结构
    - 错误处理与日志

    Token 缺失时跳过 SD K初始化，所有 API 调用返回 None。
    """

    def __init__(self, token: str | None = None) -> None:
        self._token = token or settings.justone_api_token
        self._client = None
        if self._token:
            self._client = JustOneAPIClient(token=self._token)

    # ------------------------------------------------------------------
    # 公开方法：按平台获取商品详情
    # ------------------------------------------------------------------

    async def get_product_detail(
        self, platform: str, product_id: str
    ) -> dict | None:
        """根据平台获取商品详情。"""
        if self._client is None:
            return None
        if platform in (PLATFORM_JD,):
            return await self._get_jd_detail(product_id)
        if platform in (PLATFORM_TMALL, PLATFORM_TAOBAO):
            return await self._get_taobao_detail(product_id)
        return None

    async def get_product_comments(
        self, platform: str, product_id: str
    ) -> dict | None:
        """根据平台获取商品评论。"""
        if self._client is None:
            return None
        if platform in (PLATFORM_JD,):
            return await self._get_jd_comments(product_id)
        if platform in (PLATFORM_TMALL, PLATFORM_TAOBAO):
            return await self._get_taobao_comments(product_id)
        return None

    # ------------------------------------------------------------------
    # 京东
    # ------------------------------------------------------------------

    async def _get_jd_detail(self, product_id: str) -> dict | None:
        """获取京东商品详情 (V2)。"""
        try:
            resp = self._client.jd.get_item_detail_v2(item_id=product_id)
            if resp.success and resp.data:
                item = resp.data.get("item", resp.data)
                return item
            return None
        except Exception:
            return None

    async def _get_jd_comments(self, product_id: str) -> dict | None:
        """获取京东商品评论。"""
        try:
            resp = self._client.jd.get_item_comments_v2(
                item_id=product_id, page=1, page_size=20
            )
            if resp.success and resp.data:
                return resp.data
            return None
        except Exception:
            return None

    async def _get_jd_price(self, product_id: str) -> dict | None:
        """获取京东商品价格。"""
        try:
            resp = self._client.jd.get_item_price_v1(item_id=product_id)
            if resp.success and resp.data:
                return resp.data
            return None
        except Exception:
            return None

    # ------------------------------------------------------------------
    # 淘宝 / 天猫
    # ------------------------------------------------------------------

    async def _get_taobao_detail(self, product_id: str) -> dict | None:
        """获取淘宝/天猫商品详情 (V4)。"""
        try:
            resp = self._client.taobao.get_item_detail_v4(item_id=product_id)
            if resp.success and resp.data:
                return resp.data
            return None
        except Exception:
            return None

    async def _get_taobao_comments(self, product_id: str) -> dict | None:
        """获取淘宝/天猫商品评论。"""
        try:
            resp = self._client.taobao.get_item_comment_v3(
                item_id=product_id, page=1, page_size=20
            )
            if resp.success and resp.data:
                return resp.data
            return None
        except Exception:
            return None


# 模块级单例
justone_service = JustOneService()
