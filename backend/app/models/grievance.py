from datetime import datetime, timezone
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class Grievance(Base):
    __tablename__ = "grievances"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)  # e.g. "grv-1"
    farmer_id: Mapped[int] = mapped_column(ForeignKey("farmers.id"), nullable=False, index=True)
    scheme_id: Mapped[str] = mapped_column(ForeignKey("schemes.id"), nullable=False, index=True)
    
    reference_number: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)  # Payment not received, Sanction mismatch, Delayed application, Eligibility dispute
    description: Mapped[Text] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="Under review", nullable=False)  # Submitted, Under review, Resolved, Closed
    
    officer_resolution: Mapped[str] = mapped_column(Text, default="", nullable=False)
    resolution_date: Mapped[str] = mapped_column(String(30), default="", nullable=False)
    
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
