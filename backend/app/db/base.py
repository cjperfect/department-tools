"""SQLAlchemy 声明性基类。

所有 ORM 模型均从此基类继承。
"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """ORM 模型基类。"""
    pass
