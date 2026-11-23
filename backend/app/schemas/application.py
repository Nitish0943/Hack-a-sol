from pydantic import BaseModel, ConfigDict


class ApplicationCreate(BaseModel):
    scheme_id: str
    reference_number: str
    submission_date: str | None = None
    channel: str = "Self Portal / CSC"
    remarks: str = ""


class ApplicationStatusUpdate(BaseModel):
    status: str
    remarks: str | None = None
    pending_action: str | None = None


class ApplicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    farmer_id: int
    scheme_id: str
    scheme_name: str | None = None
    reference_number: str
    submission_date: str
    status: str
    channel: str
    rejection_reason: str
    pending_action: str
    timeline_json: str
    remarks: str
