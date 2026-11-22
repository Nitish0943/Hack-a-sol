from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models.farmer import Farmer
from app.models.user import User
from app.models.verification import CultivatorVerification
from app.schemas.verification import (
    CultivatorVerificationCreate,
    CultivatorVerificationResponse,
    CultivatorVerificationReview,
)

router = APIRouter(prefix="/verifications", tags=["verifications"])


@router.get("", response_model=list[CultivatorVerificationResponse])
async def list_verifications(status: str | None = None, db: AsyncSession = Depends(get_db)) -> list[CultivatorVerificationResponse]:
    query = (
        select(CultivatorVerification, Farmer.farmer_id, Farmer.village, User.name)
        .join(Farmer, CultivatorVerification.farmer_id == Farmer.id)
        .join(User, Farmer.user_id == User.id)
    )
    if status and status.lower() != "all":
        query = query.where(CultivatorVerification.status.ilike(f"%{status}%"))

    result = await db.execute(query)
    rows = result.all()

    output = []
    for ver, farmer_code, village, user_name in rows:
        output.append(
            CultivatorVerificationResponse(
                id=ver.id,
                farmer_id=ver.farmer_id,
                farmer_name=user_name,
                farmer_id_code=farmer_code,
                village=village,
                cultivator_type=ver.cultivator_type,
                declaration_text=ver.declaration_text,
                evidence_document_name=ver.evidence_document_name,
                status=ver.status,
                officer_notes=ver.officer_notes,
                verified_at=ver.verified_at,
            )
        )
    return output


@router.post("", response_model=CultivatorVerificationResponse)
async def submit_verification(
    data: CultivatorVerificationCreate,
    db: AsyncSession = Depends(get_db),
) -> CultivatorVerificationResponse:
    farmer_res = await db.execute(select(Farmer))
    farmer = farmer_res.scalars().first()
    if not farmer:
        raise HTTPException(status_code=400, detail="Farmer profile not found")

    new_id = f"ver-{int(datetime.now().timestamp())}"
    ver = CultivatorVerification(
        id=new_id,
        farmer_id=farmer.id,
        cultivator_type=data.cultivator_type,
        declaration_text=data.declaration_text,
        evidence_document_name=data.evidence_document_name,
        status="Pending",
        officer_notes="Dossier submitted by cultivator. Scheduled for RAEO field review.",
    )
    db.add(ver)
    await db.commit()
    await db.refresh(ver)

    user_res = await db.execute(select(User).where(User.id == farmer.user_id))
    user = user_res.scalars().first()

    return CultivatorVerificationResponse(
        id=ver.id,
        farmer_id=ver.farmer_id,
        farmer_name=user.name if user else "",
        farmer_id_code=farmer.farmer_id,
        village=farmer.village,
        cultivator_type=ver.cultivator_type,
        declaration_text=ver.declaration_text,
        evidence_document_name=ver.evidence_document_name,
        status=ver.status,
        officer_notes=ver.officer_notes,
        verified_at=ver.verified_at,
    )


@router.get("/{verification_id}", response_model=CultivatorVerificationResponse)
async def get_verification(verification_id: str, db: AsyncSession = Depends(get_db)) -> CultivatorVerificationResponse:
    result = await db.execute(
        select(CultivatorVerification, Farmer.farmer_id, Farmer.village, User.name)
        .join(Farmer, CultivatorVerification.farmer_id == Farmer.id)
        .join(User, Farmer.user_id == User.id)
        .where(CultivatorVerification.id == verification_id)
    )
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Verification request not found")

    ver, farmer_code, village, user_name = row
    return CultivatorVerificationResponse(
        id=ver.id,
        farmer_id=ver.farmer_id,
        farmer_name=user_name,
        farmer_id_code=farmer_code,
        village=village,
        cultivator_type=ver.cultivator_type,
        declaration_text=ver.declaration_text,
        evidence_document_name=ver.evidence_document_name,
        status=ver.status,
        officer_notes=ver.officer_notes,
        verified_at=ver.verified_at,
    )


@router.put("/{verification_id}", response_model=CultivatorVerificationResponse)
async def review_verification(
    verification_id: str,
    review: CultivatorVerificationReview,
    db: AsyncSession = Depends(get_db),
) -> CultivatorVerificationResponse:
    result = await db.execute(select(CultivatorVerification).where(CultivatorVerification.id == verification_id))
    ver = result.scalars().first()
    if not ver:
        raise HTTPException(status_code=404, detail="Verification request not found")

    ver.status = review.status
    ver.officer_notes = review.officer_notes
    ver.verified_at = datetime.now().strftime("%d %b %Y")
    await db.commit()
    await db.refresh(ver)

    return await get_verification(verification_id, db)
