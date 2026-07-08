"""共享枚举类型。"""

import enum


class DimensionType(str, enum.Enum):
    """竞品分析维度。"""

    design = "design"
    pricing = "pricing"
    functionality = "functionality"
    quality = "quality"
    service = "service"
