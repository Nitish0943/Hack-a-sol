from datetime import datetime, timezone
from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class Farmer(Base):
    __tablename__ = "farmers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False)
    farmer_id: Mapped[str] = mapped_column(String(30), unique=True, index=True, nullable=False)  # e.g., KS-CG-10482
    
    # Geographic location
    state: Mapped[str] = mapped_column(String(50), default="Chhattisgarh", nullable=False)
    district: Mapped[str] = mapped_column(String(50), default="Raipur", nullable=False)
    block: Mapped[str] = mapped_column(String(50), default="Arang", nullable=False)
    village: Mapped[str] = mapped_column(String(50), default="Khamtarai", nullable=False)
    pincode: Mapped[str] = mapped_column(String(10), default="492001", nullable=False)
    
    # Agricultural categorization
    farmer_category: Mapped[str] = mapped_column(String(50), default="Small & Marginal", nullable=False)  # Small & Marginal, Medium, Large
    cultivator_status: Mapped[str] = mapped_column(
        String(50),
        default="Landowner",
        nullable=False,
    )  # Landowner, Tenant Farmer, Sharecropper, Joint Landholder, Mutation Pending, Other
    
    # Land & Crop metrics
    landholding_acres: Mapped[float] = mapped_column(Float, default=2.0, nullable=False)
    cultivated_area: Mapped[float] = mapped_column(Float, default=2.0, nullable=False)
    crops_json: Mapped[str] = mapped_column(Text, default='["Paddy", "Kodo-Kutki"]', nullable=False)
    farming_season: Mapped[str] = mapped_column(String(30), default="Kharif", nullable=False)  # Kharif, Rabi, Zaid
    irrigation_type: Mapped[str] = mapped_column(String(50), default="Tube well", nullable=False)
    
    profile_completion: Mapped[int] = mapped_column(Integer, default=85, nullable=False)
    
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

    user = relationship("User", backref="farmer_profile")
