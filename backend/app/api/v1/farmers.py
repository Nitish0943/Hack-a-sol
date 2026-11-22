from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.api.v1.auth import current_user, require_role, success
from app.db.store import execute, many, one

router = APIRouter(prefix="/farmers", tags=["farmers"])


class FarmerProfileUpdate(BaseModel):
    fullName: str | None = Field(default=None, min_length=2, max_length=100)
    state: str | None = None
    district: str | None = None
    block: str | None = None
    village: str | None = None
    pincode: str | None = None
    cultivatorStatus: str | None = None
    cultivatedArea: float | None = Field(default=None, ge=0)
    crops: list[str] | None = None


@router.get("/me")
async def own_profile(user: dict = Depends(require_role("farmer", "admin"))) -> dict:
    user_row = one("SELECT * FROM users WHERE id=?", (user["id"],))
    farmer = one("SELECT * FROM farmers WHERE id=?", (user["id"],))
    return success({"user": user_row, "farmer": farmer}, "Farmer profile retrieved")


@router.patch("/me")
async def update_own_profile(payload: FarmerProfileUpdate, user: dict = Depends(require_role("farmer", "admin"))) -> dict:
    if payload.fullName is not None:
        execute("UPDATE users SET full_name=? WHERE id=?", (payload.fullName, user["id"]))
    fields = {
        "state": payload.state,
        "district": payload.district,
        "block": payload.block,
        "village": payload.village,
        "pincode": payload.pincode,
        "cultivator_status": payload.cultivatorStatus,
        "cultivated_area": payload.cultivatedArea,
        "crops": None if payload.crops is None else __import__("json").dumps(payload.crops),
    }
    present = {key: value for key, value in fields.items() if value is not None}
    if present:
        set_clause = ",".join(f"{key}=?" for key in present)
        execute(f"UPDATE farmers SET {set_clause} WHERE id=?", (*present.values(), user["id"]))
    farmer = one("SELECT * FROM farmers WHERE id=?", (user["id"],))
    return success({"user": one("SELECT * FROM users WHERE id=?", (user["id"],)), "farmer": farmer}, "Farmer profile updated")


@router.get("/me/dashboard")
async def farmer_dashboard(user: dict = Depends(require_role("farmer", "admin"))) -> dict:
    farmer = one("SELECT * FROM farmers WHERE id=?", (user["id"],))
    benefits = many("SELECT * FROM benefits WHERE farmer_id=?", (user["id"],))
    applications = many("SELECT * FROM applications WHERE farmer_id=? ORDER BY submitted_at DESC", (user["id"],))
    notifications = many("SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 10", (user["id"],))
    discrepancies = many("SELECT * FROM discrepancies WHERE farmer_id=? AND status!='resolved'", (user["id"],))
    potential = sum(float(row["expected_amount"] or 0) for row in benefits)
    sanctioned = sum(float(row["sanctioned_amount"] or 0) for row in benefits)
    received = sum(float(row["received_amount"] or 0) for row in benefits)
    return success({
        "farmer": farmer,
        "financialOverview": {
            "potentialBenefits": potential,
            "sanctionedAmount": sanctioned,
            "receivedAmount": received,
            "applications": len(applications),
            "pendingActions": len(discrepancies) + 1,
        },
        "applications": applications,
        "notifications": notifications,
        "isDemo": True,
    }, "Farmer dashboard retrieved")
