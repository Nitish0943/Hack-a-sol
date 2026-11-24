from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.api.v1.auth import current_user, require_role, success
from app.db.store import execute, many, one
from app.services.recommendation_engine import evaluate_farmer_recommendations

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
    landholdingAcres: float | None = Field(default=None, ge=0)
    irrigationType: str | None = None
    crops: list[str] | None = None


@router.get("/me")
async def own_profile(user: dict = Depends(require_role("farmer", "admin"))) -> dict:
    """Retrieve authenticated farmer's own profile."""
    user_row = one("SELECT id, email, mobile_number, full_name, role, preferred_language, created_at FROM users WHERE id=?", (user["id"],))
    farmer = one("SELECT * FROM farmers WHERE id=?", (user["id"],))
    return success({"user": user_row, "farmer": farmer}, "Farmer profile retrieved")


@router.patch("/me")
async def update_own_profile(payload: FarmerProfileUpdate, user: dict = Depends(require_role("farmer", "admin"))) -> dict:
    """Update permitted farmer profile fields."""
    if payload.fullName is not None:
        execute("UPDATE users SET full_name=?, updated_at=CURRENT_TIMESTAMP WHERE id=?", (payload.fullName, user["id"]))
    
    fields = {
        "state": payload.state,
        "district": payload.district,
        "block": payload.block,
        "village": payload.village,
        "pincode": payload.pincode,
        "cultivator_status": payload.cultivatorStatus,
        "cultivated_area": payload.cultivatedArea,
        "landholding_acres": payload.landholdingAcres,
        "irrigation_type": payload.irrigationType,
        "crops": None if payload.crops is None else __import__("json").dumps(payload.crops),
    }
    present = {key: value for key, value in fields.items() if value is not None}
    if present:
        set_clause = ",".join(f"{key}=?" for key in present)
        execute(f"UPDATE farmers SET {set_clause} WHERE id=?", (*present.values(), user["id"]))
        
    farmer = one("SELECT * FROM farmers WHERE id=?", (user["id"],))
    user_row = one("SELECT id, email, mobile_number, full_name, role, preferred_language, created_at FROM users WHERE id=?", (user["id"],))
    return success({"user": user_row, "farmer": farmer}, "Farmer profile updated")


@router.get("/me/dashboard")
async def farmer_dashboard(user: dict = Depends(require_role("farmer", "admin"))) -> dict:
    """Return complete personalized dashboard for authenticated farmer."""
    farmer = one("SELECT * FROM farmers WHERE id=?", (user["id"],))
    if not farmer:
        # Fallback to demo farmer 1 if farmer table is missing a row
        farmer = one("SELECT * FROM farmers LIMIT 1") or {}

    benefits = many("SELECT * FROM benefits WHERE farmer_id=?", (user["id"],))
    applications = many("SELECT a.*, s.name as scheme_name, s.category as scheme_category FROM applications a LEFT JOIN schemes s ON s.id=a.scheme_id WHERE a.farmer_id=? ORDER BY a.submitted_at DESC", (user["id"],))
    notifications = many("SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 10", (user["id"],))
    discrepancies = many("SELECT * FROM discrepancies WHERE farmer_id=? AND status!='resolved'", (user["id"],))
    
    potential = sum(float(row["expected_amount"] or 0) for row in benefits)
    sanctioned = sum(float(row["sanctioned_amount"] or 0) for row in benefits)
    received = sum(float(row["received_amount"] or 0) for row in benefits)

    # Evaluate dynamic personalized recommendations
    recommendations_data = evaluate_farmer_recommendations(farmer)

    return success({
        "user": {
            "id": user["id"],
            "full_name": user["full_name"],
            "email": user.get("email"),
            "mobile_number": user["mobile_number"],
            "role": user["role"],
        },
        "farmer": farmer,
        "financialOverview": {
            "potentialBenefits": potential,
            "sanctionedAmount": sanctioned,
            "receivedAmount": received,
            "applications": len(applications),
            "pendingActions": len(discrepancies) + (1 if farmer.get("profile_completion", 100) < 90 else 0),
        },
        "benefits": benefits,
        "applications": applications,
        "notifications": notifications,
        "discrepancies": discrepancies,
        "recommendations": recommendations_data,
        "nextBestActions": recommendations_data.get("next_best_actions", []),
        "isDemo": bool(farmer.get("is_demo", 1)),
    }, "Farmer dashboard retrieved")


@router.get("/me/recommendations")
async def farmer_recommendations(user: dict = Depends(require_role("farmer", "admin"))) -> dict:
    """Return deterministic scheme and loan recommendations evaluated against authenticated farmer's profile."""
    farmer = one("SELECT * FROM farmers WHERE id=?", (user["id"],))
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer profile not found")
    
    results = evaluate_farmer_recommendations(farmer)
    return success(results, "Personalized recommendations retrieved")


@router.get("/me/applications")
async def farmer_applications(user: dict = Depends(require_role("farmer", "admin"))) -> dict:
    """Return recorded applications for authenticated farmer."""
    rows = many(
        """SELECT a.*, s.name as scheme_name, s.category as scheme_category, s.official_url
           FROM applications a
           LEFT JOIN schemes s ON s.id=a.scheme_id
           WHERE a.farmer_id=? ORDER BY a.submitted_at DESC""",
        (user["id"],),
    )
    return success(rows, "Applications retrieved")


@router.get("/me/benefits")
async def farmer_benefits(user: dict = Depends(require_role("farmer", "admin"))) -> dict:
    """Return Financial Digital Twin benefit distribution records for authenticated farmer."""
    rows = many(
        """SELECT b.*, s.name as scheme_name, s.category as scheme_category
           FROM benefits b
           LEFT JOIN schemes s ON s.id=b.scheme_id
           WHERE b.farmer_id=? ORDER BY b.updated_at DESC""",
        (user["id"],),
    )
    return success(rows, "Benefit records retrieved")


@router.get("/{farmer_id}")
async def get_farmer_by_id(farmer_id: str, user: dict = Depends(current_user)) -> dict:
    """
    IDOR-Protected Farmer Record Lookup.
    - Farmers CANNOT access other farmers' private records (returns 403).
    - Officers and Admins can access records within their administrative scope.
    """
    # IDOR Check: Farmer can ONLY access their own record
    if user["role"] == "farmer":
        farmer_row = one("SELECT farmer_id FROM farmers WHERE id=?", (user["id"],))
        allowed_ids = {user["id"]}
        if farmer_row and farmer_row.get("farmer_id"):
            allowed_ids.add(farmer_row["farmer_id"])
            
        if farmer_id not in allowed_ids:
            raise HTTPException(
                status_code=403,
                detail="Access denied: You are not authorized to view another farmer's records.",
            )

    # Government Officer Scope Check
    if user["role"] in ["officer", "government"]:
        gov = one("SELECT * FROM government_profiles WHERE user_id=?", (user["id"],))
        target_farmer = one("SELECT * FROM farmers WHERE id=? OR farmer_id=?", (farmer_id, farmer_id))
        if target_farmer and gov:
            # Enforce district boundary if assigned
            if gov.get("district") and target_farmer.get("district"):
                if gov["district"].strip().lower() != target_farmer["district"].strip().lower():
                    raise HTTPException(
                        status_code=403,
                        detail=f"Access denied: Farmer is in district '{target_farmer['district']}', outside your assigned scope '{gov['district']}'.",
                    )

    farmer = one(
        """SELECT u.id, u.email, u.mobile_number, u.full_name, u.role,
                  f.farmer_id, f.state, f.district, f.block, f.village, f.pincode,
                  f.cultivator_status, f.cultivated_area, f.landholding_acres,
                  f.crops, f.irrigation_type, f.farmer_category, f.profile_completion
           FROM users u
           JOIN farmers f ON f.id=u.id
           WHERE u.id=? OR f.farmer_id=?""",
        (farmer_id, farmer_id),
    )
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer record not found.")

    return success(farmer, "Farmer profile retrieved")
