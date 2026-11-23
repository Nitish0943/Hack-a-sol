from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models.farmer import Farmer
from app.models.scheme import Scheme
from app.models.scheme_rule import SchemeRule
from app.schemas.eligibility import EligibilityCheckRequest, EligibilityResponse
from app.services.eligibility_engine import EligibilityEngine

router = APIRouter(prefix="/eligibility", tags=["eligibility"])


@router.post("/check", response_model=EligibilityResponse)
async def check_eligibility(
    req: EligibilityCheckRequest,
    db: AsyncSession = Depends(get_db),
) -> EligibilityResponse:
    # Get Scheme
    scheme_res = await db.execute(select(Scheme).where(Scheme.id == req.scheme_id))
    scheme = scheme_res.scalars().first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")

    # Get Farmer
    if req.farmer_id:
        farmer_res = await db.execute(select(Farmer).where(Farmer.id == req.farmer_id))
    else:
        farmer_res = await db.execute(select(Farmer))
    farmer = farmer_res.scalars().first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer profile not found")

    # Get Rules
    rules_res = await db.execute(select(SchemeRule).where(SchemeRule.scheme_id == scheme.id))
    rules = rules_res.scalars().all()

    # Deterministic Evaluation
    evaluation = EligibilityEngine.evaluate(farmer, scheme, rules)

    return EligibilityResponse(**evaluation)
