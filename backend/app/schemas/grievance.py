from pydantic import BaseModel, ConfigDict


class GrievanceCreate(BaseModel):
    scheme_id: str
    category: str
    description: str


class GrievanceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    farmer_id: int
    scheme_id: str
    scheme_name: str | None = None
    reference_number: str
    category: str
    description: str
    status: str
    officer_resolution: str
    resolution_date: str
    created_at: str
