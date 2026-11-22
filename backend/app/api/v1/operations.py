import json
import secrets

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.api.v1.auth import require_role, success
from app.db.store import execute, many, one

router = APIRouter(tags=["operations"])


class ApplicationCreate(BaseModel):
    schemeId: str
    applicationNumber: str | None = None
    remarks: str | None = None


class GrievanceCreate(BaseModel):
    category: str
    subject: str
    description: str = Field(min_length=10)
    schemeId: str | None = None
    applicationId: str | None = None


@router.get("/benefits/summary")
async def benefit_summary(user: dict = Depends(require_role("farmer", "admin"))) -> dict:
    rows = many("SELECT * FROM benefits WHERE farmer_id=?", (user["id"],))
    def total(field: str) -> float:
        return sum(float(row[field] or 0) for row in rows)
    data = {
        "potentialAmount": total("expected_amount"),
        "appliedAmount": total("applied_amount"),
        "approvedAmount": total("approved_amount"),
        "sanctionedAmount": total("sanctioned_amount"),
        "disbursedAmount": total("disbursed_amount"),
        "receivedAmount": total("received_amount"),
        "pendingAmount": max(0, total("approved_amount") - total("received_amount")),
        "currency": "INR",
        "verificationStatus": "partially_verified",
        "isDemo": True,
    }
    return success(data, "Benefit summary retrieved")


@router.get("/benefits")
async def benefits(user: dict = Depends(require_role("farmer", "admin"))) -> dict:
    return success(many("SELECT * FROM benefits WHERE farmer_id=?", (user["id"],)), "Benefit records retrieved")


@router.get("/benefits/{benefit_id}")
async def benefit_detail(benefit_id: str, user: dict = Depends(require_role("farmer", "officer", "admin"))) -> dict:
    row = one("SELECT * FROM benefits WHERE id=?", (benefit_id,))
    if not row:
        raise HTTPException(status_code=404, detail="Benefit record not found")
    if user["role"] == "farmer" and row["farmer_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Permission denied")
    alerts = many("SELECT * FROM discrepancies WHERE benefit_id=? ORDER BY created_at DESC", (benefit_id,))
    return success({"benefit": row, "discrepancies": alerts}, "Benefit record retrieved")


@router.get("/applications")
async def applications(user: dict = Depends(require_role("farmer", "officer", "admin"))) -> dict:
    if user["role"] == "farmer":
        rows = many("SELECT * FROM applications WHERE farmer_id=? ORDER BY updated_at DESC", (user["id"],))
    else:
        rows = many("SELECT * FROM applications ORDER BY updated_at DESC")
    return success(rows, "Applications retrieved")


@router.post("/applications")
async def create_application(payload: ApplicationCreate, user: dict = Depends(require_role("farmer"))) -> dict:
    application_id = f"application-{secrets.token_hex(8)}"
    number = payload.applicationNumber or f"KS-{secrets.token_hex(6).upper()}"
    if one("SELECT id FROM applications WHERE application_number=?", (number,)):
        raise HTTPException(status_code=409, detail="Application reference already exists")
    execute(
        "INSERT INTO applications(id,application_number,farmer_id,scheme_id,status,submitted_at,remarks,is_demo) VALUES(?,?,?,?,?,?,?,1)",
        (application_id, number, user["id"], payload.schemeId, "draft", None, payload.remarks),
    )
    return success({"id": application_id, "applicationNumber": number, "status": "draft", "isDemo": True}, "Application draft created", )


@router.post("/applications/{application_id}/submit")
async def submit_application(application_id: str, user: dict = Depends(require_role("farmer"))) -> dict:
    application = one("SELECT * FROM applications WHERE id=? AND farmer_id=?", (application_id, user["id"]))
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    if application["status"] != "draft":
        raise HTTPException(status_code=409, detail="Only draft applications can be submitted")
    execute("UPDATE applications SET status='submitted',submitted_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=?", (application_id,))
    execute(
        "INSERT INTO application_history(id,application_id,previous_status,new_status,changed_by,remarks) VALUES(?,?,?,?,?,?)",
        (f"history-{secrets.token_hex(8)}", application_id, "draft", "submitted", user["id"], "Submitted by farmer"),
    )
    execute(
        "INSERT INTO notifications(id,user_id,title,message,notification_type,reference_type,reference_id,is_read) VALUES(?,?,?,?,?,?,?,0)",
        (f"notification-{secrets.token_hex(8)}", user["id"], "Application submitted", f"Application {application['application_number']} was submitted.", "application", "application", application_id),
    )
    return success({"id": application_id, "status": "submitted"}, "Application submitted")


@router.get("/applications/{application_id}")
async def application_detail(application_id: str, user: dict = Depends(require_role("farmer", "officer", "admin"))) -> dict:
    row = one("SELECT * FROM applications WHERE id=?", (application_id,))
    if not row:
        raise HTTPException(status_code=404, detail="Application not found")
    if user["role"] == "farmer" and row["farmer_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Permission denied")
    history = many("SELECT * FROM application_history WHERE application_id=? ORDER BY created_at", (application_id,))
    return success({"application": row, "history": history}, "Application retrieved")


@router.get("/grievances")
async def grievances(user: dict = Depends(require_role("farmer", "officer", "admin"))) -> dict:
    if user["role"] == "farmer":
        rows = many("SELECT * FROM grievances WHERE farmer_id=? ORDER BY created_at DESC", (user["id"],))
    else:
        rows = many("SELECT * FROM grievances ORDER BY created_at DESC")
    return success(rows, "Grievances retrieved")


@router.post("/grievances")
async def create_grievance(payload: GrievanceCreate, user: dict = Depends(require_role("farmer"))) -> dict:
    grievance_id = f"grievance-{secrets.token_hex(8)}"
    number = f"GRV-CG-{secrets.token_hex(4).upper()}"
    execute(
        "INSERT INTO grievances(id,grievance_number,farmer_id,scheme_id,application_id,category,subject,description,priority,status,is_demo) VALUES(?,?,?,?,?,?,?,?,?,?,1)",
        (grievance_id, number, user["id"], payload.schemeId, payload.applicationId, payload.category, payload.subject, payload.description, "medium", "submitted"),
    )
    execute(
        "INSERT INTO grievance_history(id,grievance_id,status,remark) VALUES(?,?,?,?)",
        (f"history-{secrets.token_hex(8)}", grievance_id, "submitted", "Complaint submitted by farmer"),
    )
    return success({"id": grievance_id, "grievanceNumber": number, "status": "submitted", "isDemo": True}, "Grievance submitted")


@router.get("/grievances/{grievance_id}")
async def grievance_detail(grievance_id: str, user: dict = Depends(require_role("farmer", "officer", "admin"))) -> dict:
    row = one("SELECT * FROM grievances WHERE id=?", (grievance_id,))
    if not row:
        raise HTTPException(status_code=404, detail="Grievance not found")
    if user["role"] == "farmer" and row["farmer_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Permission denied")
    history = many("SELECT * FROM grievance_history WHERE grievance_id=? ORDER BY created_at", (grievance_id,))
    return success({"grievance": row, "history": history}, "Grievance retrieved")


@router.get("/discrepancies")
async def discrepancies(user: dict = Depends(require_role("farmer", "officer", "admin"))) -> dict:
    if user["role"] == "farmer":
        rows = many("SELECT * FROM discrepancies WHERE farmer_id=? ORDER BY created_at DESC", (user["id"],))
    else:
        rows = many("SELECT * FROM discrepancies ORDER BY created_at DESC")
    return success(rows, "Discrepancy alerts retrieved")


@router.get("/notifications")
async def notifications(user: dict = Depends(require_role("farmer", "officer", "admin"))) -> dict:
    rows = many("SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC", (user["id"],))
    return success(rows, "Notifications retrieved")


@router.post("/notifications/read-all")
async def read_all_notifications(user: dict = Depends(require_role("farmer", "officer", "admin"))) -> dict:
    execute("UPDATE notifications SET is_read=1 WHERE user_id=?", (user["id"],))
    return success({"updated": True}, "Notifications marked read")
