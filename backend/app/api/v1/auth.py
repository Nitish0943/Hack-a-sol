import secrets
from datetime import datetime, timedelta, timezone
from typing import Literal

from fastapi import APIRouter, Depends, Header, HTTPException, Request, Response
from pydantic import BaseModel, Field

from app.core.config import get_settings
from app.db.store import execute, initialize_database, one, seed_demo_data

router = APIRouter(prefix="/auth", tags=["authentication"])


class SendOtpRequest(BaseModel):
    mobileNumber: str = Field(min_length=10, max_length=15)


class VerifyOtpRequest(BaseModel):
    mobileNumber: str = Field(min_length=10, max_length=15)
    otp: str = Field(min_length=4, max_length=8)
    role: str = "farmer"


class DemoLoginRequest(BaseModel):
    role: Literal["farmer", "officer", "admin"]


class ProfileUpdate(BaseModel):
    fullName: str | None = Field(default=None, min_length=2, max_length=100)
    preferredLanguage: str | None = None
    district: str | None = None
    village: str | None = None


class RegistrationRequest(BaseModel):
    mobileNumber: str = Field(min_length=10, max_length=15)
    otp: str = Field(min_length=4, max_length=8)
    fullName: str = Field(min_length=2, max_length=100)
    preferredLanguage: str
    state: str = Field(min_length=2, max_length=100)
    district: str = Field(min_length=2, max_length=100)
    block: str = Field(min_length=2, max_length=100)
    village: str = Field(min_length=2, max_length=100)
    pincode: str | None = Field(default=None, max_length=10)
    farmerCategory: str
    cultivatorStatus: str
    landholdingArea: float = Field(gt=0)


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
    session = one("SELECT user_id FROM sessions WHERE token=?", (token,))
    if not session:
        raise HTTPException(status_code=401, detail="Session is invalid or expired")
    user = one("SELECT * FROM users WHERE id=? AND is_active=1", (session["user_id"],))
    if not user:
        raise HTTPException(status_code=401, detail="Account is inactive or unavailable")
    return user


def require_role(*roles: str):
    def guard(user: dict[str, object] = Depends(current_user)):
        if user["role"] not in roles:
            raise HTTPException(status_code=403, detail="Permission denied")
        return user
    return guard


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
        role = payload.role if payload.role in {"farmer", "officer", "admin"} else "farmer"
        user_id = f"user-{role}-{secrets.token_hex(4)}"
        execute(
            "INSERT INTO users(id,mobile_number,full_name,role,preferred_language,is_active) VALUES(?,?,?,?,?,1)",
            (user_id, payload.mobileNumber, "New KrishiSetu User", role, "hi"),
        )
        if role == "farmer":
            execute(
                "INSERT INTO farmers(id,farmer_id,state,district,block,village,pincode,cultivator_status,cultivated_area,crops,profile_completion,is_demo) VALUES(?,?,?,?,?,?,?,?,?,?,?,1)",
                (user_id, f"KS-{secrets.token_hex(4).upper()}", "", "", "", "", "", "", 0, "[]", 20),
            )
        user = one("SELECT * FROM users WHERE id=?", (user_id,))

    token = secrets.token_urlsafe(32)
    execute("INSERT INTO sessions(token,user_id) VALUES(?,?)", (token, user["id"]))
    response.set_cookie(
        "krishisetu_session",
        token,
        httponly=True,
        samesite="lax",
        secure=settings.app_environment == "production",
        max_age=60 * 60 * 8,
    )
    execute("DELETE FROM otp_challenges WHERE mobile_number=?", (payload.mobileNumber,))
    return success({"accessToken": token, "user": user}, "OTP verified")


@router.post("/demo-login")
async def demo_login(payload: DemoLoginRequest, response: Response) -> dict[str, object]:
    settings = get_settings()
    if not settings.demo_login_enabled or settings.app_environment.lower() == "production":
        raise HTTPException(status_code=404, detail="Demo login is unavailable")

    seed_demo_data()
    user = one(
        "SELECT * FROM users WHERE role=? AND is_active=1 ORDER BY created_at,id LIMIT 1",
        (payload.role,),
    )
    if not user:
        raise HTTPException(status_code=404, detail="No demo account is configured for this role")

    token = secrets.token_urlsafe(32)
    execute("INSERT INTO sessions(token,user_id) VALUES(?,?)", (token, user["id"]))
    response.set_cookie(
        "krishisetu_session",
        token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=60 * 60 * 8,
    )
    return success(
        {"accessToken": token, "user": user, "isDemo": True},
        "Demo account signed in",
    )


@router.post("/register")
async def register_farmer(payload: RegistrationRequest, response: Response) -> dict[str, object]:
    settings = get_settings()
    seed_demo_data()

    existing = one("SELECT id FROM users WHERE mobile_number=?", (payload.mobileNumber,))
    if existing:
        raise HTTPException(status_code=409, detail="This mobile number is already registered")

    challenge = one("SELECT * FROM otp_challenges WHERE mobile_number=?", (payload.mobileNumber,))
    if not challenge or challenge["otp"] != payload.otp:
        raise HTTPException(status_code=401, detail="Invalid OTP")
    if datetime.fromisoformat(challenge["expires_at"]) < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="OTP has expired")

    language = "hi" if payload.preferredLanguage.lower().startswith("hi") else "en"
    user_id = f"user-farmer-{secrets.token_hex(4)}"
    farmer_id = f"KS-CG-{secrets.token_hex(4).upper()}"
    execute(
        "INSERT INTO users(id,mobile_number,full_name,role,preferred_language,is_active) VALUES(?,?,?,?,?,1)",
        (user_id, payload.mobileNumber, payload.fullName, "farmer", language),
    )
    execute(
        "INSERT INTO farmers(id,farmer_id,state,district,block,village,pincode,cultivator_status,cultivated_area,crops,farmer_category,profile_completion,is_demo) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,1)",
        (
            user_id,
            farmer_id,
            payload.state,
            payload.district,
            payload.block,
            payload.village,
            payload.pincode,
            payload.cultivatorStatus,
            payload.landholdingArea,
            "[]",
            payload.farmerCategory,
            85,
        ),
    )

    token = secrets.token_urlsafe(32)
    execute("INSERT INTO sessions(token,user_id) VALUES(?,?)", (token, user_id))
    execute("DELETE FROM otp_challenges WHERE mobile_number=?", (payload.mobileNumber,))
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
        "Farmer profile registered",
    )


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
    return success({"loggedOut": True}, "Logged out")


@router.get("/me")
async def auth_me(user: dict[str, object] = Depends(current_user)) -> dict[str, object]:
    farmer = one("SELECT * FROM farmers WHERE id=?", (user["id"],)) if user["role"] == "farmer" else None
    return success({"user": user, "farmer": farmer}, "Current user retrieved")


@router.patch("/profile")
async def update_profile(payload: ProfileUpdate, user: dict[str, object] = Depends(current_user)) -> dict[str, object]:
    updates: dict[str, object] = {}
    if payload.fullName is not None:
        updates["full_name"] = payload.fullName
    if payload.preferredLanguage is not None:
        updates["preferred_language"] = payload.preferredLanguage
    if updates:
        set_clause = ",".join(f"{key}=?" for key in updates)
        execute(f"UPDATE users SET {set_clause} WHERE id=?", (*updates.values(), user["id"]))
    if payload.district is not None or payload.village is not None:
        farmer_updates = {}
        if payload.district is not None:
            farmer_updates["district"] = payload.district
        if payload.village is not None:
            farmer_updates["village"] = payload.village
        set_clause = ",".join(f"{key}=?" for key in farmer_updates)
        execute(f"UPDATE farmers SET {set_clause} WHERE id=?", (*farmer_updates.values(), user["id"]))
    return success(one("SELECT * FROM users WHERE id=?", (user["id"],)), "Profile updated")
