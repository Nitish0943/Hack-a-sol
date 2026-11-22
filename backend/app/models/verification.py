from datetime import datetime, timezone
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class CultivatorVerification(Base):
    __tablename__ = "cultivator_verifications"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)  # e.g., "ver-1"
    farmer_id: Mapped[int] = mapped_column(ForeignKey("farmers.id"), nullable=False, index=True)
    cultivator_type: Mapped[str] = mapped_column(String(50), nullable=False)  # Tenant Farmer, Sharecropper, Mutation Pending
    declaration_text: Mapped[str] = mapped_column(Text, nullable=False)
    evidence_document_name: Mapped[str] = mapped_column(String(100), nullable=False)
    
    status: Mapped[str] = mapped_column(String(30), default="Pending", nullable=False)  # Pending, Approved, Rejected
    officer_notes: Mapped[str] = mapped_column(Text, default="", nullable=False)
    verified_at: Mapped[str] = mapped_column(String(30), default="", nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    farmer = relationship("Farmer")
