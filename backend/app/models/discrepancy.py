from datetime import datetime, timezone
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class Discrepancy(Base):
    __tablename__ = "discrepancies"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)  # e.g., "alert-1"
    farmer_id: Mapped[int] = mapped_column(ForeignKey("farmers.id"), nullable=False, index=True)
    scheme_id: Mapped[str] = mapped_column(ForeignKey("schemes.id"), nullable=False, index=True)
    benefit_id: Mapped[str] = mapped_column(ForeignKey("benefit_ledger.id"), nullable=False, index=True)
    
    alert_type: Mapped[str] = mapped_column(String(100), nullable=False)  # Sanction Amount Mismatch, Delayed Installment, Missing Record
    severity: Mapped[str] = mapped_column(String(20), default="High", nullable=False)  # Low, Medium, High, Critical
    
    expected_amount: Mapped[int] = mapped_column(Integer, nullable=False)
    actual_amount: Mapped[int] = mapped_column(Integer, nullable=False)
    difference: Mapped[int] = mapped_column(Integer, nullable=False)
    
    explanation: Mapped[str] = mapped_column(Text, nullable=False)
    policy_clause: Mapped[str] = mapped_column(String(150), nullable=False)
    policy_version: Mapped[str] = mapped_column(String(50), nullable=False)
    
    status: Mapped[str] = mapped_column(String(30), default="Pending", nullable=False)  # Pending, Verified, Dismissed
    officer_notes: Mapped[str] = mapped_column(Text, default="", nullable=False)
    
    detected_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    scheme = relationship("Scheme")
    farmer = relationship("Farmer")
    benefit = relationship("BenefitLedger")
