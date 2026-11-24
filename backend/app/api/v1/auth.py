import secrets
from datetime import datetime, timedelta, timezone
from typing import Literal

from fastapi import APIRouter, Depends, Header, HTTPException, Request, Response
from pydantic import BaseModel, Field

from app.core.config import get_settings
from app.core.security import (
    calculate_session_expiry,
    generate_session_token,
    hash_password,
    verify_password,
)
from app.db.store import execute, initialize_database, one, seed_demo_data

router = APIRouter(prefix="/auth", tags=["authentication"])


class SendOtpRequest(BaseModel):
    mobileNumber: str = Field(min_length=10, max_length=15)


class VerifyOtpRequest(BaseModel):
    mobileNumber: str = Field(min_length=10, max_length=15)
    otp: str = Field(min_length=4, max_length=8)
    role: str = "farmer"


class LoginRequest(BaseModel):
    identifier: str = Field(min_length=3, max_length=100)  # Email or 10-digit mobile number
    password: str | None = None
    otp: str | None = None


class ResetPasswordRequest(BaseModel):
    identifier: str = Field(min_length=3, max_length=100)
    newPassword: str = Field(min_length=6, max_length=100)
    otp: str | None = None


class DemoLoginRequest(BaseModel):
    account: Literal["farmer1", "farmer2", "farmer3", "officer", "admin"] | None = None
    role: Literal["farmer", "officer", "admin"] | None = None


class ProfileUpdate(BaseModel):
    fullName: str | None = Field(default=None, min_length=2, max_length=100)
    preferredLanguage: str | None = None
    district: str | None = None
    village: str | None = None


class RegistrationRequest(BaseModel):
    mobileNumber: str = Field(min_length=10, max_length=15)
    email: str | None = None
    password: str | None = None
    otp: str | None = None
    fullName: str = Field(min_length=2, max_length=100)
    preferredLanguage: str = "hi"
    state: str = Field(min_length=2, max_length=100, default="Chhattisgarh")
    district: str = Field(min_length=2, max_length=100, default="Raipur")
    block: str = Field(min_length=2, max_length=100, default="Arang")
    village: str = Field(min_length=2, max_length=100, default="Khamtarai")
    pincode: str | None = Field(default=None, max_length=10)
    farmerCategory: str = "Small & marginal farmer"
    cultivatorStatus: str = "Landowner"
    landholdingArea: float = Field(gt=0, default=2.0)


def success(data: object, message: str = "Success") -> dict[str, object]:
    return {"success": True, "message": message, "data": data, "meta": None}


def current_user(
    authorization: str | None = Header(default=None),
    request: Request = None,
) -> dict[str, object]:
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1]
    if not token and request:
        token = request.cookies.get("krishisetu_session")
    if not token:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    session = one("SELECT user_id, expires_at FROM sessions WHERE token=?", (token,))
    if not session:
        raise HTTPException(status_code=401, detail="Session is invalid or expired")
    
    # Check session expiry if set
    if session.get("expires_at"):
        try:
            if datetime.fromisoformat(session["expires_at"]) < datetime.now(timezone.utc):
                execute("DELETE FROM sessions WHERE token=?", (token,))
                raise HTTPException(status_code=401, detail="Session has expired. Please log in again.")
        except (ValueError, TypeError):
            pass

    user = one("SELECT * FROM users WHERE id=? AND is_active=1", (session["user_id"],))
    if not user:
        raise HTTPException(status_code=401, detail="Account is inactive or unavailable")
    return user


def require_role(*roles: str):
    def guard(user: dict[str, object] = Depends(current_user)):
        # Allow 'government' as an alias for 'officer'
        allowed = set(roles)
        if "government" in allowed:
            allowed.add("officer")
        if "officer" in allowed:
            allowed.add("government")
            
        user_role = user.get("role")
        if user_role not in allowed:
            raise HTTPException(status_code=403, detail=f"Permission denied. Required role: {', '.join(roles)}")
        return user
    return guard


@router.get("/demo-status")
async def demo_status() -> dict[str, object]:
    settings = get_settings()
    return success(
        {"demoLoginEnabled": bool(settings.demo_login_enabled)},
        "Demo status retrieved",
    )


@router.post("/send-otp")
async def send_otp(payload: SendOtpRequest) -> dict[str, object]:
    settings = get_settings()
    if not settings.demo_otp_enabled:
        raise HTTPException(status_code=503, detail="Demo OTP is not enabled")
    seed_demo_data()
    expires = (datetime.now(timezone.utc) + timedelta(minutes=5)).isoformat()
    execute(
        "INSERT INTO otp_challenges(mobile_number,otp,expires_at) VALUES(?,?,?) ON CONFLICT(mobile_number) DO UPDATE SET otp=excluded.otp,expires_at=excluded.expires_at",
        (payload.mobileNumber, settings.demo_otp, expires),
    )
    return success({"expiresInSeconds": 300, "demoOtp": settings.demo_otp}, "Demo OTP issued")


@router.post("/verify-otp")
async def verify_otp(payload: VerifyOtpRequest, response: Response) -> dict[str, object]:
    settings = get_settings()
    seed_demo_data()
    challenge = one("SELECT * FROM otp_challenges WHERE mobile_number=?", (payload.mobileNumber,))
    if not challenge or challenge["otp"] != payload.otp:
        raise HTTPException(status_code=401, detail="Invalid OTP")
    if datetime.fromisoformat(challenge["expires_at"]) < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="OTP has expired")

    user = one("SELECT * FROM users WHERE mobile_number=?", (payload.mobileNumber,))
    if not user:
        role = "farmer"  # Server-side safety: never self-promote
        user_id = f"user-farmer-{secrets.token_hex(4)}"
        execute(
            "INSERT INTO users(id,mobile_number,full_name,role,preferred_language,is_active) VALUES(?,?,?,?,?,1)",
            (user_id, payload.mobileNumber, "New KrishiSetu Farmer", role, "hi"),
        )
        execute(
            "INSERT INTO farmers(id,farmer_id,state,district,block,village,pincode,cultivator_status,cultivation_type,cultivated_area,crops,profile_completion,is_demo) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,1)",
            (user_id, f"KS-FARM-{secrets.token_hex(3).upper()}", "Chhattisgarh", "Raipur", "Arang", "Khamtarai", "493661", "Landowner", "landowner", 2.0, '["Paddy"]', 70),
        )
        user = one("SELECT * FROM users WHERE id=?", (user_id,))

    token = generate_session_token()
    expires_at = calculate_session_expiry(8)
    execute("INSERT INTO sessions(token,user_id,expires_at) VALUES(?,?,?)", (token, user["id"], expires_at))
    response.set_cookie(
        "krishisetu_session",
        token,
        httponly=True,
        samesite="lax",
        secure=settings.app_environment == "production",
        max_age=60 * 60 * 8,
    )
    execute("DELETE FROM otp_challenges WHERE mobile_number=?", (payload.mobileNumber,))
    farmer = one("SELECT * FROM farmers WHERE id=?", (user["id"],)) if user["role"] == "farmer" else None
    return success({"accessToken": token, "user": user, "farmer": farmer}, "OTP verified")


@router.post("/login")
async def password_or_otp_login(payload: LoginRequest, response: Response) -> dict[str, object]:
    """Standard password-based or OTP-based login."""
    settings = get_settings()
    seed_demo_data()
    ident = payload.identifier.strip()

    # Search by email or mobile number
    user = one("SELECT * FROM users WHERE email=? OR mobile_number=?", (ident, ident))
    if not user:
        raise HTTPException(status_code=401, detail="No registered account found with this email or mobile number.")

    # 1. Password verification
    if payload.password:
        stored_hash = user.get("password_hash")
        if not stored_hash or not verify_password(payload.password, stored_hash):
            raise HTTPException(status_code=401, detail="Invalid password.")
    # 2. OTP verification
    elif payload.otp:
        challenge = one("SELECT * FROM otp_challenges WHERE mobile_number=?", (user["mobile_number"],))
        if not challenge or challenge["otp"] != payload.otp:
            raise HTTPException(status_code=401, detail="Invalid OTP.")
        if datetime.fromisoformat(challenge["expires_at"]) < datetime.now(timezone.utc):
            raise HTTPException(status_code=401, detail="OTP has expired.")
        execute("DELETE FROM otp_challenges WHERE mobile_number=?", (user["mobile_number"],))
    else:
        raise HTTPException(status_code=400, detail="Please provide either password or OTP to authenticate.")

    if not user.get("is_active"):
        raise HTTPException(status_code=403, detail="Account has been deactivated. Please contact support.")

    token = generate_session_token()
    expires_at = calculate_session_expiry(8)
    execute("INSERT INTO sessions(token,user_id,expires_at) VALUES(?,?,?)", (token, user["id"], expires_at))
    response.set_cookie(
        "krishisetu_session",
        token,
        httponly=True,
        samesite="lax",
        secure=settings.app_environment == "production",
        max_age=60 * 60 * 8,
    )

    farmer = one("SELECT * FROM farmers WHERE id=?", (user["id"],)) if user["role"] == "farmer" else None
    gov_profile = one("SELECT * FROM government_profiles WHERE user_id=?", (user["id"],)) if user["role"] in ["officer", "government"] else None
    
    return success(
        {
            "accessToken": token,
            "user": user,
            "farmer": farmer,
            "government": gov_profile,
        },
        f"Welcome back, {user['full_name']}!",
    )


@router.post("/demo-login")
async def demo_login(payload: DemoLoginRequest, response: Response) -> dict[str, object]:
    """1-Click Demo Login for the 5 Canonical Identities."""
    settings = get_settings()
    if not settings.demo_login_enabled:
        raise HTTPException(status_code=403, detail="Demo login is disabled in this environment.")

    seed_demo_data()

    # Determine user by requested account or role
    user_id = None
    if payload.account:
        account_map = {
            "farmer1": "user-farmer-1",
            "farmer2": "user-farmer-2",
            "farmer3": "user-farmer-3",
            "officer": "user-officer-1",
            "admin": "user-admin-1",
        }
        user_id = account_map.get(payload.account)
    elif payload.role:
        role_map = {
            "farmer": "user-farmer-1",
            "officer": "user-officer-1",
            "admin": "user-admin-1",
        }
        user_id = role_map.get(payload.role)

    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid demo account selection.")

    user = one("SELECT * FROM users WHERE id=? AND is_active=1", (user_id,))
    if not user:
        raise HTTPException(status_code=404, detail="Demo account not found in database.")

    token = generate_session_token()
    expires_at = calculate_session_expiry(8)
    execute("INSERT INTO sessions(token,user_id,expires_at) VALUES(?,?,?)", (token, user["id"], expires_at))
    
    response.set_cookie(
        "krishisetu_session",
        token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=60 * 60 * 8,
    )

    farmer = one("SELECT * FROM farmers WHERE id=?", (user["id"],)) if user["role"] == "farmer" else None
    gov_profile = one("SELECT * FROM government_profiles WHERE user_id=?", (user["id"],)) if user["role"] in ["officer", "government"] else None

    return success(
        {
            "accessToken": token,
            "user": user,
            "farmer": farmer,
            "government": gov_profile,
            "isDemo": True,
        },
        f"Authenticated as demo persona: {user['full_name']} ({user['role'].upper()})",
    )


@router.post("/register")
async def register_farmer(payload: RegistrationRequest, response: Response) -> dict[str, object]:
    """Farmer Self-Registration with password and profile details."""
    settings = get_settings()
    seed_demo_data()

    # Check mobile number uniqueness
    existing_mob = one("SELECT id FROM users WHERE mobile_number=?", (payload.mobileNumber,))
    if existing_mob:
        raise HTTPException(status_code=409, detail="This mobile number is already registered. Please log in.")

    # Check email uniqueness if provided
    if payload.email:
        existing_email = one("SELECT id FROM users WHERE email=?", (payload.email,))
        if existing_email:
            raise HTTPException(status_code=409, detail="This email address is already registered.")

    # If OTP validation is required
    if payload.otp:
        challenge = one("SELECT * FROM otp_challenges WHERE mobile_number=?", (payload.mobileNumber,))
        if not challenge or challenge["otp"] != payload.otp:
            raise HTTPException(status_code=401, detail="Invalid OTP code.")
        if datetime.fromisoformat(challenge["expires_at"]) < datetime.now(timezone.utc):
            raise HTTPException(status_code=401, detail="OTP has expired.")
        execute("DELETE FROM otp_challenges WHERE mobile_number=?", (payload.mobileNumber,))

    language = "hi" if payload.preferredLanguage.lower().startswith("hi") else "en"
    user_id = f"user-farmer-{secrets.token_hex(4)}"
    farmer_id = f"KS-FARM-{secrets.token_hex(3).upper()}"
    pwd_hash = hash_password(payload.password) if payload.password else None

    # Server-Side Role Enforcement: Farmers ALWAYS register as 'farmer'
    execute(
        """INSERT INTO users(id, email, mobile_number, password_hash, full_name, role, preferred_language, is_active)
           VALUES(?,?,?,?,?,?,?,1)""",
        (user_id, payload.email, payload.mobileNumber, pwd_hash, payload.fullName, "farmer", language),
    )

    cult_type = "tenant" if "tenant" in payload.cultivatorStatus.lower() or "sharecropper" in payload.cultivatorStatus.lower() else "landowner"
    owned_acres = 0.0 if cult_type == "tenant" else payload.landholdingArea

    execute(
        """INSERT INTO farmers(id, farmer_id, state, district, block, village, pincode, cultivator_status, cultivation_type, cultivated_area, landholding_acres, crops, farmer_category, profile_completion, is_demo)
           VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,0)""",
        (
            user_id,
            farmer_id,
            payload.state,
            payload.district,
            payload.block,
            payload.village,
            payload.pincode,
            payload.cultivatorStatus,
            cult_type,
            payload.landholdingArea,
            owned_acres,
            '["Paddy"]',
            payload.farmerCategory,
            85,
        ),
    )

    token = generate_session_token()
    expires_at = calculate_session_expiry(8)
    execute("INSERT INTO sessions(token,user_id,expires_at) VALUES(?,?,?)", (token, user_id, expires_at))
    response.set_cookie(
        "krishisetu_session",
        token,
        httponly=True,
        samesite="lax",
        secure=settings.app_environment == "production",
        max_age=60 * 60 * 8,
    )

    user = one("SELECT * FROM users WHERE id=?", (user_id,))
    farmer = one("SELECT * FROM farmers WHERE id=?", (user_id,))
    return success(
        {"accessToken": token, "user": user, "farmer": farmer},
        "Farmer profile registered successfully",
    )


@router.post("/reset-password")
async def reset_password(payload: ResetPasswordRequest) -> dict[str, object]:
    ident = payload.identifier.strip()
    user = one("SELECT id FROM users WHERE email=? OR mobile_number=?", (ident, ident))
    if not user:
        raise HTTPException(status_code=404, detail="No account found matching this identifier.")

    new_hash = hash_password(payload.newPassword)
    execute("UPDATE users SET password_hash=?, updated_at=CURRENT_TIMESTAMP WHERE id=?", (new_hash, user["id"]))
    # Invalidate existing sessions on password reset for security
    execute("DELETE FROM sessions WHERE user_id=?", (user["id"],))
    return success({"reset": True}, "Password has been successfully updated. Please log in with your new password.")


@router.post("/logout")
async def logout(
    response: Response,
    authorization: str | None = Header(default=None),
    request: Request = None,
    user: dict[str, object] = Depends(current_user),
) -> dict[str, object]:
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1]
    if not token and request:
        token = request.cookies.get("krishisetu_session")
    if token:
        execute("DELETE FROM sessions WHERE token=?", (token,))
    response.delete_cookie("krishisetu_session")
    return success({"loggedOut": True}, "Logged out successfully")


@router.get("/me")
async def auth_me(user: dict[str, object] = Depends(current_user)) -> dict[str, object]:
    farmer = one("SELECT * FROM farmers WHERE id=?", (user["id"],)) if user["role"] == "farmer" else None
    gov_profile = one("SELECT * FROM government_profiles WHERE user_id=?", (user["id"],)) if user["role"] in ["officer", "government"] else None
    return success({"user": user, "farmer": farmer, "government": gov_profile}, "Current user retrieved")


@router.patch("/profile")
async def update_profile(payload: ProfileUpdate, user: dict[str, object] = Depends(current_user)) -> dict[str, object]:
    updates: dict[str, object] = {}
    if payload.fullName is not None:
        updates["full_name"] = payload.fullName
    if payload.preferredLanguage is not None:
        updates["preferred_language"] = payload.preferredLanguage
    if updates:
        set_clause = ",".join(f"{key}=?" for key in updates)
        execute(f"UPDATE users SET {set_clause}, updated_at=CURRENT_TIMESTAMP WHERE id=?", (*updates.values(), user["id"]))
    if payload.district is not None or payload.village is not None:
        farmer_updates = {}
        if payload.district is not None:
            farmer_updates["district"] = payload.district
        if payload.village is not None:
            farmer_updates["village"] = payload.village
        set_clause = ",".join(f"{key}=?" for key in farmer_updates)
        execute(f"UPDATE farmers SET {set_clause} WHERE id=?", (*farmer_updates.values(), user["id"]))
    return success(one("SELECT * FROM users WHERE id=?", (user["id"],)), "Profile updated")
