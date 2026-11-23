from pydantic import BaseModel, ConfigDict


class DiscrepancyReviewRequest(BaseModel):
    status: str  # Verified, Dismissed, Pending
    officer_notes: str


class DiscrepancyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    farmer_id: int
    farmer_name: str | None = None
    farmer_id_code: str | None = None
    scheme_id: str
    scheme_name: str | None = None
    benefit_id: str
    alert_type: str
    severity: str
    expected_amount: int
    actual_amount: int
    difference: int
    explanation: str
    policy_clause: str
    policy_version: str
    status: str
    officer_notes: str
