from pydantic import BaseModel, ConfigDict


class BenefitLedgerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    farmer_id: int
    scheme_id: str
    scheme_name: str | None = None
    scheme_category: str | None = None
    status: str
    estimated_amount: int
    applied_amount: int
    approved_amount: int
    sanctioned_amount: int
    disbursed_amount: int
    received_amount: int
    financial_year: str
    installment_info: str
    last_action_date: str


class BenefitSummaryResponse(BaseModel):
    total_potential: int
    total_applied: int
    total_approved: int
    total_sanctioned: int
    total_disbursed: int
    total_received: int
    active_schemes_count: int
    pending_actions_count: int
