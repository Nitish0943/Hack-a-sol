from typing import Any
from pydantic import BaseModel, ConfigDict


class FarmerBase(BaseModel):
    state: str = "Chhattisgarh"
    district: str = "Raipur"
    block: str = "Arang"
    village: str = "Khamtarai"
    pincode: str = "492001"
    farmer_category: str = "Small & Marginal"
    cultivator_status: str = "Landowner"
    landholding_acres: float = 2.0
    cultivated_area: float = 2.0
    crops_json: str = '["Paddy", "Kodo-Kutki"]'
    farming_season: str = "Kharif"
    irrigation_type: str = "Tube well"


class FarmerUpdate(BaseModel):
    name: str | None = None
    state: str | None = None
    district: str | None = None
    block: str | None = None
    village: str | None = None
    pincode: str | None = None
    farmer_category: str | None = None
    cultivator_status: str | None = None
    landholding_acres: float | None = None
    cultivated_area: float | None = None
    crops_json: str | None = None
    farming_season: str | None = None
    irrigation_type: str | None = None


class FarmerResponse(FarmerBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    farmer_id: str
    name: str | None = None
    phone: str | None = None
    profile_completion: int = 85
