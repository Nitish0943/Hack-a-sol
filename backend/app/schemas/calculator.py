from typing import Any
from pydantic import BaseModel


class CalculatorRequest(BaseModel):
    calculator_type: str = "kcc"  # kcc, equipment, irrigation, rgkny
    area_acres: float = 2.0
    crop: str = "Paddy"
    loan_amount: int = 100000
    equipment_type: str = "Tractor (35-40 HP)"
    farmer_category: str = "Small & Marginal"
    state: str = "Chhattisgarh"
    financial_year: str = "2026-27"


class CalculatorResponse(BaseModel):
    calculator_type: str
    calculator_type_hi: str
    estimated_benefit: int
    benefit_label: str
    benefit_label_hi: str
    farmer_share: int
    farmer_share_label: str
    farmer_share_label_hi: str
    formula: str
    formula_hi: str
    breakdown: list[dict[str, Any]]
    policy_reference: str
    financial_year: str
    disclaimer: str
    effective_credit_limit: int | None = None
    interest_rates: dict[str, str] | None = None
    benchmark_cost: int | None = None
    subsidy_percentage: str | None = None
    total_project_cost: int | None = None
