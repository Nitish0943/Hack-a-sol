import secrets

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.api.v1.auth import success
from app.db.store import many, one

router = APIRouter(prefix="/ivr", tags=["ivr"])


class IvrIdentify(BaseModel):
    callId: str
    mobileNumber: str = Field(min_length=10, max_length=15)
    verificationCode: str


class IvrInput(BaseModel):
    callId: str
    mobileNumber: str = Field(min_length=10, max_length=15)
    language: str = "en"
    digit: str


@router.post("/incoming")
async def incoming_call(payload: dict) -> dict:
    call_id = f"demo-call-{secrets.token_hex(6)}"
    return success({
        "callId": call_id,
        "nextAction": "identify",
        "message": "Welcome to the KrishiSetu demonstration IVR.",
        "isDemo": True,
    }, "Simulated IVR call started")


@router.post("/identify-farmer")
async def identify_farmer(payload: IvrIdentify) -> dict:
    user = one("SELECT * FROM users WHERE mobile_number=?", (payload.mobileNumber,))
    if not user:
        raise HTTPException(status_code=404, detail="Registered mobile number not found")
    if payload.verificationCode != "123456":
        raise HTTPException(status_code=401, detail="Verification failed")
    return success({
        "identified": True,
        "nextAction": "menu",
        "message": "Identity verified for the demonstration.",
        "isDemo": True,
    }, "Demo IVR identity verified")


@router.post("/menu")
async def ivr_menu(payload: dict) -> dict:
    return success({
        "options": [
            {"digit": "1", "label": "Government scheme information"},
            {"digit": "2", "label": "Loan and subsidy information"},
            {"digit": "3", "label": "Application status"},
            {"digit": "4", "label": "Payment status"},
            {"digit": "5", "label": "Register grievance"},
            {"digit": "9", "label": "Repeat menu"},
        ],
        "isDemo": True,
    }, "IVR menu retrieved")


@router.post("/input")
async def ivr_input(payload: IvrInput) -> dict:
    user = one("SELECT * FROM users WHERE mobile_number=?", (payload.mobileNumber,))
    if not user:
        raise HTTPException(status_code=404, detail="Registered mobile number not found")
    if payload.digit == "3":
        rows = many("SELECT application_number,status FROM applications WHERE farmer_id=?", (user["id"],))
        message = "Your applications are: " + "; ".join(f"{row['application_number']} is {row['status']}" for row in rows)
        return success({"nextAction": "application_status", "message": message, "language": payload.language, "isDemo": True}, "IVR application status")
    if payload.digit == "4":
        rows = many("SELECT status,received_amount FROM benefits WHERE farmer_id=?", (user["id"],))
        received = sum(float(row["received_amount"] or 0) for row in rows)
        return success({"nextAction": "benefit_status", "message": f"Confirmed demo received amount is {received:.0f} rupees.", "language": payload.language, "isDemo": True}, "IVR benefit status")
    if payload.digit == "1":
        return success({"nextAction": "scheme_info", "message": "PM-KISAN and Kisan Credit Card are available in the KrishiSetu demonstration.", "language": payload.language, "isDemo": True}, "IVR scheme information")
    if payload.digit == "2":
        return success({"nextAction": "calculator", "message": "Loan and subsidy estimates are available in the web portal.", "language": payload.language, "isDemo": True}, "IVR calculator information")
    if payload.digit == "5":
        return success({"nextAction": "grievance", "message": "A grievance requires review and confirmation in the portal.", "language": payload.language, "isDemo": True}, "IVR grievance information")
    if payload.digit == "9":
        return success({"nextAction": "menu", "message": "Repeating the menu.", "language": payload.language, "isDemo": True}, "IVR menu repeated")
    return success({"nextAction": "invalid", "message": "Invalid selection. Please choose an option from the menu.", "language": payload.language, "isDemo": True}, "Invalid IVR selection")
