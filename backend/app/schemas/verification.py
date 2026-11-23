from pydantic import BaseModel, ConfigDict


class CultivatorVerificationCreate(BaseModel):
    cultivator_type: str
    declaration_text: str
    evidence_document_name: str


class CultivatorVerificationReview(BaseModel):
    status: str  # Approved, Rejected, Pending
    officer_notes: str


class CultivatorVerificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    farmer_id: int
    farmer_name: str | None = None
    farmer_id_code: str | None = None
    village: str | None = None
    cultivator_type: str
    declaration_text: str
    evidence_document_name: str
    status: str
    officer_notes: str
    verified_at: str
