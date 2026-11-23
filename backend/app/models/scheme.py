from datetime import datetime, timezone
from sqlalchemy import Boolean, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class Scheme(Base):
    __tablename__ = "schemes"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)  # slug id e.g. "pm-kisan", "kcc"
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    name_hi: Mapped[str] = mapped_column(String(150), nullable=False)
    name_cghi: Mapped[str] = mapped_column(String(150), nullable=True)
    
    department: Mapped[str] = mapped_column(String(150), nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False)  # Income support, Credit, Insurance, Subsidy, Pension, Irrigation
    benefit_type: Mapped[str] = mapped_column(String(50), nullable=False)  # Direct Cash Transfer, Subsidized Credit, Premium Subsidy, Capital Subsidy
    
    benefit_summary: Mapped[str] = mapped_column(String(200), nullable=False)
    benefit_summary_hi: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    description_hi: Mapped[str] = mapped_column(Text, nullable=False)
    
    eligibility_criteria_json: Mapped[str] = mapped_column(Text, nullable=False)  # JSON list of textual criteria
    required_documents_json: Mapped[str] = mapped_column(Text, nullable=False)  # JSON list of documents
    application_steps_json: Mapped[str] = mapped_column(Text, nullable=False)  # JSON list of steps
    
    official_url: Mapped[str] = mapped_column(String(255), nullable=False)
    source_url: Mapped[str] = mapped_column(String(255), nullable=False)
    policy_version: Mapped[str] = mapped_column(String(50), default="2026-v1.0", nullable=False)
    financial_year: Mapped[str] = mapped_column(String(20), default="2026-27", nullable=False)
    state: Mapped[str] = mapped_column(String(50), default="All-India", nullable=False)  # All-India or specific state
    last_verified: Mapped[str] = mapped_column(String(30), default="20 Nov 2026", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
