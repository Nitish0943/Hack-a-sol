from datetime import datetime, timezone
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class EligibilityResult(Base):
    __tablename__ = "eligibility_results"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    farmer_id: Mapped[int] = mapped_column(ForeignKey("farmers.id"), nullable=False, index=True)
    scheme_id: Mapped[str] = mapped_column(ForeignKey("schemes.id"), nullable=False, index=True)
    
    # 4 explicit outcomes per specification
    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )  # POTENTIALLY_ELIGIBLE, NOT_ELIGIBLE, NEEDS_ADDITIONAL_VERIFICATION, INCOMPLETE_INFORMATION
    
    conditions_passed_json: Mapped[str] = mapped_column(Text, default="[]", nullable=False)
    conditions_failed_json: Mapped[str] = mapped_column(Text, default="[]", nullable=False)
    conditions_unknown_json: Mapped[str] = mapped_column(Text, default="[]", nullable=False)
    missing_documents_json: Mapped[str] = mapped_column(Text, default="[]", nullable=False)
    
    policy_version: Mapped[str] = mapped_column(String(50), nullable=False)
    recommended_action: Mapped[str] = mapped_column(Text, nullable=False)
    recommended_action_hi: Mapped[str] = mapped_column(Text, nullable=False)
    
    evaluated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    scheme = relationship("Scheme")
    farmer = relationship("Farmer")
