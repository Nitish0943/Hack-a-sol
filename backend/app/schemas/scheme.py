from pydantic import BaseModel, ConfigDict


class SchemeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    code: str
    name: str
    name_hi: str
    name_cghi: str | None = None
    department: str
    category: str
    benefit_type: str
    benefit_summary: str
    benefit_summary_hi: str
    description: str
    description_hi: str
    eligibility_criteria_json: str
    required_documents_json: str
    application_steps_json: str
    official_url: str
    source_url: str
    policy_version: str
    financial_year: str
    state: str
    last_verified: str
    is_active: bool
