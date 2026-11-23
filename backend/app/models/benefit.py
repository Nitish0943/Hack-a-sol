from datetime import datetime, timezone
from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class BenefitLedger(Base):
    __tablename__ = "benefit_ledger"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)  # e.g., "benefit-1"
    farmer_id: Mapped[int] = mapped_column(ForeignKey("farmers.id"), nullable=False, index=True)
    scheme_id: Mapped[str] = mapped_column(ForeignKey("schemes.id"), nullable=False, index=True)
    
    # Strict separation of financial stages
    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )  # POTENTIAL, APPLIED, APPROVED, SANCTIONED, DISBURSED, RECEIVED, REJECTED, CANCELLED, NOT_VERIFIED
    
    # All monetary amounts in Rupees (integer/float for clarity)
    estimated_amount: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    applied_amount: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    approved_amount: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    sanctioned_amount: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    disbursed_amount: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    received_amount: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    
    financial_year: Mapped[str] = mapped_column(String(20), default="2026-27", nullable=False)
    installment_info: Mapped[str] = mapped_column(String(100), default="Installment 1", nullable=False)
    last_action_date: Mapped[str] = mapped_column(String(30), default="22 Nov 2026", nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    scheme = relationship("Scheme")
    farmer = relationship("Farmer")
