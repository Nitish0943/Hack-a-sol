from typing import Any
from pydantic import BaseModel


class EligibilityCheckRequest(BaseModel):
    scheme_id: str
    farmer_id: int | None = None  # If omitted, defaults to authenticated/demo farmer


class EligibilityResponse(BaseModel):
    status: str  # POTENTIALLY_ELIGIBLE, NOT_ELIGIBLE_BASED_ON_AVAILABLE_INFO, NEEDS_ADDITIONAL_VERIFICATION, INCOMPLETE_INFORMATION
    scheme_id: str
    scheme_name: str
    scheme_name_hi: str
    policy_version: str
    passed_conditions: list[dict[str, Any]]
    failed_conditions: list[dict[str, Any]]
    unknown_conditions: list[dict[str, Any]]
    missing_documents: list[str]
    recommended_action: str
    recommended_action_hi: str
