from sqlalchemy import Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class SchemeRule(Base):
    __tablename__ = "scheme_rules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    scheme_id: Mapped[str] = mapped_column(ForeignKey("schemes.id"), nullable=False, index=True)
    rule_type: Mapped[str] = mapped_column(String(50), nullable=False)  # location, landholding, cultivator_status, crop, farmer_category
    field_name: Mapped[str] = mapped_column(String(50), nullable=False)  # state, landholding_acres, cultivator_status, crops
    operator: Mapped[str] = mapped_column(String(20), nullable=False)  # eq, in, lte, gte, contains
    target_value: Mapped[str] = mapped_column(String(200), nullable=False)  # serialized value e.g. "2.0", "Chhattisgarh", '["Paddy"]'
    
    clause_reference: Mapped[str] = mapped_column(String(100), nullable=False)  # e.g., "Para 3.1 - Operational Guidelines"
    description: Mapped[str] = mapped_column(Text, nullable=False)
    description_hi: Mapped[str] = mapped_column(Text, nullable=False)
    
    scheme = relationship("Scheme", backref="rules")
