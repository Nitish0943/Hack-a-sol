from datetime import datetime, timezone
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)  # e.g., "app-1"
    farmer_id: Mapped[int] = mapped_column(ForeignKey("farmers.id"), nullable=False, index=True)
    scheme_id: Mapped[str] = mapped_column(ForeignKey("schemes.id"), nullable=False, index=True)
    
    reference_number: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    submission_date: Mapped[str] = mapped_column(String(30), nullable=False)
    status: Mapped[str] = mapped_column(
        String(50),
        default="Under review",
        nullable=False,
    )  # Approved, Under review, Documents required, Rejected, Completed
    
    channel: Mapped[str] = mapped_column(String(50), default="CSC / Portal", nullable=False)
    rejection_reason: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    pending_action: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    timeline_json: Mapped[str] = mapped_column(Text, default="[]", nullable=False)
    remarks: Mapped[str] = mapped_column(Text, default="", nullable=False)
    
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
