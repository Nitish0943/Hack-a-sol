import secrets

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.api.v1.auth import require_role, success
from app.db.store import execute, many, one

router = APIRouter(tags=["officer and administration"])


class StatusUpdate(BaseModel):
    status: str
    remarks: str | None = None


class SchemeCreate(BaseModel):
    name: str
    department: str
    category: str
    state: str = "Central"
    description: str
    policyVersion: str


def audit(actor_id: str, action: str, entity_type: str, entity_id: str, old_values: object | None = None, new_values: object | None = None) -> None:
    import json
    execute(
        "INSERT INTO audit_logs(id,actor_id,action,entity_type,entity_id,old_values,new_values) VALUES(?,?,?,?,?,?,?)",
        (f"audit-{secrets.token_hex(8)}", actor_id, action, entity_type, entity_id, json.dumps(old_values) if old_values else None, json.dumps(new_values) if new_values else None),
    )


@router.get("/officer/dashboard")
async def officer_dashboard(user: dict = Depends(require_role("officer", "admin"))) -> dict:
    return success({
        "totalFarmers": len(many("SELECT id FROM farmers")),
        "totalApplications": len(many("SELECT id FROM applications")),
        "pendingReviews": len(many("SELECT id FROM applications WHERE status IN ('submitted','under_review','documents_required')")),
        "openDiscrepancies": len(many("SELECT id FROM discrepancies WHERE status!='resolved'")),
        "openGrievances": len(many("SELECT id FROM grievances WHERE status NOT IN ('resolved','closed')")),
        "pendingVerifications": len(many("SELECT id FROM cultivator_verifications WHERE verification_status!='verified'")),
        "isDemo": True,
    }, "Officer dashboard retrieved")


@router.get("/officer/farmers")
async def officer_farmers(user: dict = Depends(require_role("officer", "admin"))) -> dict:
    rows = many(
        "SELECT u.id,u.full_name,u.role,f.farmer_id,f.district,f.village,f.cultivator_status,f.profile_completion,f.is_demo FROM users u LEFT JOIN farmers f ON f.id=u.id WHERE u.role='farmer' ORDER BY u.full_name"
    )
    return success(rows, "Farmer records retrieved")


@router.get("/officer/farmers/{farmer_id}")
async def officer_farmer_detail(farmer_id: str, user: dict = Depends(require_role("officer", "admin"))) -> dict:
    profile = one("SELECT u.*,f.farmer_id,f.state,f.district,f.block,f.village,f.pincode,f.cultivator_status,f.cultivated_area,f.crops,f.profile_completion FROM users u LEFT JOIN farmers f ON f.id=u.id WHERE u.id=?", (farmer_id,))
    if not profile:
        raise HTTPException(status_code=404, detail="Farmer not found")
    return success({
        "profile": profile,
        "applications": many("SELECT * FROM applications WHERE farmer_id=?", (farmer_id,)),
        "benefits": many("SELECT * FROM benefits WHERE farmer_id=?", (farmer_id,)),
        "grievances": many("SELECT * FROM grievances WHERE farmer_id=?", (farmer_id,)),
    }, "Farmer detail retrieved")


@router.get("/officer/applications")
async def officer_applications(user: dict = Depends(require_role("officer", "admin"))) -> dict:
    return success(many("SELECT * FROM applications ORDER BY updated_at DESC"), "Officer applications retrieved")


@router.post("/officer/applications/{application_id}/review")
async def review_application(application_id: str, payload: StatusUpdate, user: dict = Depends(require_role("officer", "admin"))) -> dict:
    allowed = {"under_review", "documents_required", "approved", "rejected", "sanctioned", "disbursed", "closed"}
    if payload.status not in allowed:
        raise HTTPException(status_code=422, detail="Invalid application status")
    row = one("SELECT * FROM applications WHERE id=?", (application_id,))
    if not row:
        raise HTTPException(status_code=404, detail="Application not found")
    execute(
        "UPDATE applications SET status=?,remarks=?,updated_at=CURRENT_TIMESTAMP WHERE id=?",
        (payload.status, payload.remarks, application_id),
    )
    execute(
        "INSERT INTO application_history(id,application_id,previous_status,new_status,changed_by,remarks) VALUES(?,?,?,?,?,?)",
        (f"history-{secrets.token_hex(8)}", application_id, row["status"], payload.status, user["id"], payload.remarks),
    )
    audit(user["id"], "review_application", "application", application_id, {"status": row["status"]}, {"status": payload.status})
    return success({"id": application_id, "status": payload.status}, "Application status updated")


@router.get("/officer/grievances")
async def officer_grievances(user: dict = Depends(require_role("officer", "admin"))) -> dict:
    return success(many("SELECT * FROM grievances ORDER BY created_at DESC"), "Officer grievances retrieved")


@router.post("/officer/grievances/{grievance_id}/update-status")
async def update_grievance(grievance_id: str, payload: StatusUpdate, user: dict = Depends(require_role("officer", "admin"))) -> dict:
    allowed = {"acknowledged", "assigned", "under_review", "awaiting_farmer", "resolved", "reopened", "closed"}
    if payload.status not in allowed:
        raise HTTPException(status_code=422, detail="Invalid grievance status")
    row = one("SELECT * FROM grievances WHERE id=?", (grievance_id,))
    if not row:
        raise HTTPException(status_code=404, detail="Grievance not found")
    execute("UPDATE grievances SET status=?,resolution_note=?,updated_at=CURRENT_TIMESTAMP,resolved_at=CURRENT_TIMESTAMP WHERE id=?", (payload.status, payload.remarks, grievance_id))
    execute("INSERT INTO grievance_history(id,grievance_id,status,remark) VALUES(?,?,?,?)", (f"history-{secrets.token_hex(8)}", grievance_id, payload.status, payload.remarks))
    audit(user["id"], "update_grievance", "grievance", grievance_id, {"status": row["status"]}, {"status": payload.status})
    return success({"id": grievance_id, "status": payload.status}, "Grievance updated")


@router.get("/officer/discrepancies")
async def officer_discrepancies(user: dict = Depends(require_role("officer", "admin"))) -> dict:
    return success(many("SELECT * FROM discrepancies ORDER BY created_at DESC"), "Discrepancy queue retrieved")


@router.post("/officer/discrepancies/{alert_id}/resolve")
async def resolve_discrepancy(alert_id: str, payload: StatusUpdate, user: dict = Depends(require_role("officer", "admin"))) -> dict:
    row = one("SELECT * FROM discrepancies WHERE id=?", (alert_id,))
    if not row:
        raise HTTPException(status_code=404, detail="Discrepancy not found")
    execute("UPDATE discrepancies SET status='resolved',resolution_note=? WHERE id=?", (payload.remarks, alert_id))
    audit(user["id"], "resolve_discrepancy", "discrepancy", alert_id, {"status": row["status"]}, {"status": "resolved"})
    return success({"id": alert_id, "status": "resolved"}, "Discrepancy resolved")


@router.get("/officer/verifications")
async def officer_verifications(user: dict = Depends(require_role("officer", "admin"))) -> dict:
    return success(many("SELECT * FROM cultivator_verifications ORDER BY submitted_at DESC"), "Verification queue retrieved")


@router.post("/officer/verifications/{verification_id}/approve")
async def approve_verification(verification_id: str, payload: StatusUpdate, user: dict = Depends(require_role("officer", "admin"))) -> dict:
    row = one("SELECT * FROM cultivator_verifications WHERE id=?", (verification_id,))
    if not row:
        raise HTTPException(status_code=404, detail="Verification not found")
    execute("UPDATE cultivator_verifications SET verification_status='verified',officer_remarks=? WHERE id=?", (payload.remarks, verification_id))
    audit(user["id"], "verify_cultivator", "cultivator_verification", verification_id, {"status": row["verification_status"]}, {"status": "verified"})
    return success({"id": verification_id, "status": "verified"}, "Cultivator verified")


@router.get("/admin/dashboard")
async def admin_dashboard(user: dict = Depends(require_role("admin"))) -> dict:
    return success({
        "totalUsers": len(many("SELECT id FROM users")),
        "totalFarmers": len(many("SELECT id FROM farmers")),
        "activeSchemes": len(many("SELECT id FROM schemes WHERE status='active'")),
        "openDiscrepancies": len(many("SELECT id FROM discrepancies WHERE status!='resolved'")),
        "policyVersions": len(many("SELECT DISTINCT policy_version FROM schemes")),
        "isDemo": True,
    }, "Admin dashboard retrieved")


@router.get("/admin/users")
async def admin_users(user: dict = Depends(require_role("admin"))) -> dict:
    return success(many("SELECT id,mobile_number,full_name,role,is_active,created_at FROM users ORDER BY created_at"), "Users retrieved")


@router.get("/admin/schemes")
async def admin_schemes(user: dict = Depends(require_role("admin"))) -> dict:
    return success(many("SELECT * FROM schemes ORDER BY name"), "Schemes retrieved")


@router.post("/admin/schemes")
async def create_scheme(payload: SchemeCreate, user: dict = Depends(require_role("admin"))) -> dict:
    scheme_id = f"scheme-{secrets.token_hex(8)}"
    execute(
        "INSERT INTO schemes(id,name,department,category,state,description,benefit_description,eligibility_summary,required_documents,official_url,policy_version,last_updated,status,is_demo) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,1)",
        (scheme_id, payload.name, payload.department, payload.category, payload.state, payload.description, "Benefit details require verified policy configuration", "Deterministic policy review required", "[]", "", payload.policyVersion, "2026-11-22", "active"),
    )
    audit(user["id"], "create_scheme", "scheme", scheme_id, None, payload.model_dump())
    return success({"id": scheme_id}, "Scheme created")


@router.get("/admin/audit-logs")
async def admin_audit_logs(user: dict = Depends(require_role("admin"))) -> dict:
    return success(many("SELECT * FROM audit_logs ORDER BY created_at DESC"), "Audit logs retrieved")
