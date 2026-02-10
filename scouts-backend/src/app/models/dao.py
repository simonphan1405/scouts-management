"""
Dao database model.
Represents organizational units within a Chau.
"""

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class Dao(Base, TimestampMixin):
    """
    Dao model representing organizational units within a Chau.

    Demonstrates SQLAlchemy 2.0 style with Mapped types and foreign key relationship.
    """

    __tablename__ = "DAO"

    dao_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    ten_dao: Mapped[str | None] = mapped_column(String, nullable=True)
    chau_id: Mapped[int] = mapped_column(Integer, ForeignKey("CHAU.chau_id"), nullable=False)
    dia_chi: Mapped[str | None] = mapped_column(String, nullable=True)
    mo_ta: Mapped[str | None] = mapped_column(String, nullable=True)

    # Relationship to Chau
    chau = relationship("Chau", backref="daos")

    def __repr__(self) -> str:
        return f"<Dao(dao_id={self.dao_id}, ten_dao={self.ten_dao}, chau_id={self.chau_id})>"
