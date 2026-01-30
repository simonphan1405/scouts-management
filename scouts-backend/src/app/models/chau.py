"""
Chau database model.
Represents organizational units or regions.
"""

from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class Chau(Base, TimestampMixin):
    """
    Chau model representing organizational units or regions.
    
    Demonstrates SQLAlchemy 2.0 style with Mapped types.
    """
    
    __tablename__ = "CHAU"
    
    chau_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    ten_chau: Mapped[str | None] = mapped_column(String, nullable=True)
    dia_chi: Mapped[str | None] = mapped_column(String, nullable=True)
    mo_ta: Mapped[str | None] = mapped_column(String, nullable=True)
    
    def __repr__(self) -> str:
        return f"<Chau(chau_id={self.chau_id}, ten_chau={self.ten_chau})>"
