"""电商链接解析器。

从商品 URL 中提取平台名称和商品 ID。
"""

import re
from dataclasses import dataclass

# ---------------------------------------------------------------------------
# 平台标识常量
# ---------------------------------------------------------------------------
PLATFORM_JD = "京东"
PLATFORM_TMALL = "天猫"
PLATFORM_TAOBAO = "淘宝"
PLATFORM_PINDUODUO = "拼多多"

# 暂不支持的平台列表
UNSUPPORTED_PLATFORMS = {PLATFORM_PINDUODUO}

# ---------------------------------------------------------------------------
# URL 解析规则
# ---------------------------------------------------------------------------
# 每条规则：(正则, 平台, 商品ID所在 group 名/索引)
_RULES: list[tuple[re.Pattern, str, str]] = [
    # 京东
    (re.compile(r"item\.jd\.com/(?P<id>\d+)"), PLATFORM_JD, "id"),
    # 天猫
    (re.compile(r"detail\.tmall\.com/.*[?&]id=(?P<id>\d+)"), PLATFORM_TMALL, "id"),
    # 淘宝
    (re.compile(r"item\.taobao\.com/.*[?&]id=(?P<id>\d+)"), PLATFORM_TAOBAO, "id"),
    # 拼多多
    (
        re.compile(r"(?:yangkeduo|pinduoduo)\.com/.*goods_id=(?P<id>\d+)"),
        PLATFORM_PINDUODUO,
        "id",
    ),
    (
        re.compile(r"(?:yangkeduo|pinduoduo)\.com/.*goods[./](?P<id>\d+)"),
        PLATFORM_PINDUODUO,
        "id",
    ),
]


@dataclass
class ParsedUrl:
    """URL 解析结果。"""

    platform: str
    product_id: str
    is_supported: bool


def parse_product_url(url: str) -> ParsedUrl | None:
    """解析商品链接，提取平台和商品 ID。

    返回 None 表示无法识别的链接格式。
    """
    cleaned = url.strip()

    for pattern, platform, group in _RULES:
        match = pattern.search(cleaned)
        if match:
            product_id = match.group(group)
            return ParsedUrl(
                platform=platform,
                product_id=product_id,
                is_supported=platform not in UNSUPPORTED_PLATFORMS,
            )

    return None
