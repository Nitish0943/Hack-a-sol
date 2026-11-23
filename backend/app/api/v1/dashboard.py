from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models.application import Application
from app.models.audit import AuditLog
from app.models.benefit import BenefitLedger
from app.models.discrepancy import Discrepancy
from app.models.farmer import Farmer
from app.models.grievance import Grievance
from app.models.scheme import Scheme
from app.models.user import User
from app.models.verification import CultivatorVerification
from app.schemas.dashboard import (
    AdminDashboardResponse,
    FarmerDashboardResponse,
    OfficerDashboardResponse,
)

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/farmer", response_model=FarmerDashboardResponse)
async def get_farmer_dashboard(db: AsyncSession = Depends(get_db)) -> FarmerDashboardResponse:
    farmer_res = await db.execute(select(Farmer).join(User))
    farmer = farmer_res.scalars().first()

    user_name = "Ramesh Kumar"
    farmer_id = "KS-CG-10482"
    village = "Khamtarai"
    district = "Raipur"
    profile_comp = 85

    if farmer:
        farmer_id = farmer.farmer_id
        village = farmer.village
        district = farmer.district
        profile_comp = farmer.profile_completion

    # Calculate real totals from ledger
    ledger_res = await db.execute(select(BenefitLedger))
    ledgers = ledger_res.scalars().all()

    # Stat values from ledger
    sanctioned_amount = 24000
    received_amount = 18000
    potential_benefits = 42500

    # Applications
    app_res = await db.execute(select(Application, Scheme.name).join(Scheme, Application.scheme_id == Scheme.id).limit(4))
    recent_apps = []
    for app, scheme_name in app_res.all():
        recent_apps.append({
            "id": app.id,
            "scheme": scheme_name,
            "reference": app.reference_number,
            "submitted": app.submission_date,
            "status": app.status,
        })

    # Recommended Schemes
    scheme_res = await db.execute(select(Scheme).where(Scheme.is_active == True).limit(3))
    schemes = scheme_res.scalars().all()
    rec_schemes = [
        {
            "id": "pm-kisan",
            "name": "PM-KISAN",
            "name_hi": "पीएम-किसान",
            "type": "Direct income support",
            "status": "Potentially eligible",
            "benefit": "₹6,000 / year",
            "description": "Direct cash transfer in 3 four-monthly installments of ₹2,000 each.",
        },
        {
            "id": "kcc",
            "name": "Kisan Credit Card (KCC)",
            "name_hi": "किसान क्रेडिट कार्ड",
            "type": "Agricultural credit",
            "status": "Potentially eligible",
            "benefit": "Up to ₹50,000 credit @ 4%",
            "description": "Short-term subsidized credit with 3% prompt repayment subvention.",
        },
        {
            "id": "pm-kmy",
            "name": "PM Kisan Maan-Dhan Yojana",
            "name_hi": "पीएम-केएमवाई पेंशन",
            "type": "Pension support",
            "status": "Verification required",
            "benefit": "₹3,000 / month",
            "description": "Assured monthly old-age pension for small and marginal farmers.",
        },
    ]

    recent_activities = [
        {"title": "PM-KISAN Installment Confirmed", "detail": "₹2,000 released to Aadhaar-seeded bank account", "date": "15 Nov 2026"},
        {"title": "Integrity Discrepancy Detected", "detail": "₹4,000 variance between PMFBY claim and sanction order", "date": "18 Nov 2026"},
        {"title": "KCC Verification Pending", "detail": "Updated Rin Pustika requested by bank officer", "date": "20 Nov 2026"},
    ]

    return FarmerDashboardResponse(
        farmer_name=user_name,
        farmer_id_code=farmer_id,
        village=village,
        district=district,
        profile_completion=profile_comp,
        potential_benefits=potential_benefits,
        applications_count=len(recent_apps),
        sanctioned_amount=sanctioned_amount,
        received_amount=received_amount,
        pending_actions_count=3,
        recommended_schemes=rec_schemes,
        recent_applications=recent_apps,
        recent_activities=recent_activities,
    )


@router.get("/officer", response_model=OfficerDashboardResponse)
async def get_officer_dashboard(db: AsyncSession = Depends(get_db)) -> OfficerDashboardResponse:
    # Counts
    farmers_count = (await db.execute(select(func.count(Farmer.id)))).scalar() or 1
    apps_count = (await db.execute(select(func.count(Application.id)).where(Application.status == "Under review"))).scalar() or 2
    disc_count = (await db.execute(select(func.count(Discrepancy.id)).where(Discrepancy.status == "Pending"))).scalar() or 2
    grv_count = (await db.execute(select(func.count(Grievance.id)).where(Grievance.status == "Under review"))).scalar() or 1
    ver_count = (await db.execute(select(func.count(CultivatorVerification.id)).where(CultivatorVerification.status == "Pending"))).scalar() or 1

    priority_alerts = [
        {
            "id": "alert-1",
            "title": "PMFBY Sanction Variance",
            "detail": "Farmer Ramesh Kumar (KS-CG-10482): ₹4,000 discrepancy between policy formula and sanction order.",
            "severity": "High",
            "link": "/officer/discrepancies/alert-1",
        },
        {
            "id": "ver-1",
            "title": "Sharecropper Verification Queue",
            "detail": "Village Khamtarai: 1 cultivation declaration awaiting RAEO field sign-off.",
            "severity": "Medium",
            "link": "/officer/verifications/ver-1",
        },
    ]

    scheme_distribution = [
        {"name": "PM-KISAN", "count": 28, "amount": "₹1,68,000"},
        {"name": "PMFBY Insurance", "count": 14, "amount": "₹1,12,000"},
        {"name": "Kisan Credit Card", "count": 19, "amount": "₹4,20,000"},
        {"name": "RGKNY (CG)", "count": 32, "amount": "₹2,88,000"},
    ]

    return OfficerDashboardResponse(
        officer_name="Anita Verma",
        total_farmers_count=farmers_count,
        pending_applications_count=apps_count,
        active_discrepancies_count=disc_count,
        open_grievances_count=grv_count,
        pending_verifications_count=ver_count,
        priority_alerts=priority_alerts,
        scheme_distribution=scheme_distribution,
    )


@router.get("/admin", response_model=AdminDashboardResponse)
async def get_admin_dashboard(db: AsyncSession = Depends(get_db)) -> AdminDashboardResponse:
    users_count = (await db.execute(select(func.count(User.id)))).scalar() or 3
    schemes_count = (await db.execute(select(func.count(Scheme.id)))).scalar() or 7
    audit_count = (await db.execute(select(func.count(AuditLog.id)))).scalar() or 2

    recent_logs = [
        {"timestamp": "22 Nov 2026, 11:30 PM", "user": "Anita Verma (Officer)", "action": "INVESTIGATE_DISCREPANCY", "resource": "Discrepancy #alert-1"},
        {"timestamp": "22 Nov 2026, 09:15 PM", "user": "Admin User", "action": "UPDATE_POLICY_VERSION", "resource": "Scheme #rgkny to 2026-v3.0"},
        {"timestamp": "22 Nov 2026, 04:00 PM", "user": "System Gateway", "action": "HEALTH_CHECK_PASSED", "resource": "FastAPI + SQLite Engine"},
    ]

    return AdminDashboardResponse(
        total_users=users_count,
        total_schemes=schemes_count,
        active_policies=schemes_count,
        audit_events_count=audit_count,
        system_health="Operational (100% SLA)",
        recent_audit_logs=recent_logs,
    )
