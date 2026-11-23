from typing import Any
from pydantic import BaseModel


class FarmerDashboardResponse(BaseModel):
    farmer_name: str
    farmer_id_code: str
    village: str
    district: str
    profile_completion: int
    potential_benefits: int
    applications_count: int
    sanctioned_amount: int
    received_amount: int
    pending_actions_count: int
    recommended_schemes: list[dict[str, Any]]
    recent_applications: list[dict[str, Any]]
    recent_activities: list[dict[str, Any]]


class OfficerDashboardResponse(BaseModel):
    officer_name: str
    total_farmers_count: int
    pending_applications_count: int
    active_discrepancies_count: int
    open_grievances_count: int
    pending_verifications_count: int
    priority_alerts: list[dict[str, Any]]
    scheme_distribution: list[dict[str, Any]]


class AdminDashboardResponse(BaseModel):
    total_users: int
    total_schemes: int
    active_policies: int
    audit_events_count: int
    system_health: str
    recent_audit_logs: list[dict[str, Any]]
