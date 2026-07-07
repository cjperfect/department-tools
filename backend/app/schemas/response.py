"""统一 API 响应格式。

所有接口均返回以下 JSON 结构::

    {
        "code": 0,        # 0=成功, 非0=异常
        "message": "ok",  # 提示信息
        "data": { ... }   # 业务数据
    }
"""

from typing import Any


def success(data: Any = None, message: str = "ok") -> dict:
    """构建成功响应。"""
    return {"code": 0, "message": message, "data": data}


def error(code: int, message: str, data: Any = None) -> dict:
    """构建失败响应。"""
    return {"code": code, "message": message, "data": data}
