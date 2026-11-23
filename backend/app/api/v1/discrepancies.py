from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models.discrepancy import Discrepancy
from app.models.farmer import Farmer
from app.models.scheme import Scheme
from app.models.user import User
from app.schemas.discrepancy import DiscrepancyResponse, DiscrepancyReviewRequest

router = APIRouter(prefix="/discrepancies", tags=["discrepancies"])


@router.get("", response_model=list[DiscrepancyResponse])
async def list_discrepancies(status: str | None = None, db: AsyncSession = Depends(get_db)) -> list[DiscrepancyResponse]:
    query = (
        select(Discrepancy, Scheme.name, Farmer.farmer_id, User.name)
        .join(Scheme, Discrepancy.scheme_id == Scheme.id)
        .join(Farmer, Discrepancy.farmer_id == Farmer.id)
        .join(User, Farmer.user_id == User.id)
    )
    if status and status.lower() != "all":
        query = query.where(Discrepancy.status.ilike(f"%{status}%"))

    result = await db.execute(query)
    rows = result.all()

    output = []
    for disc, scheme_name, farmer_code, user_name in rows:
        output.append(
            DiscrepancyResponse(
                id=disc.id,
                farmer_id=disc.farmer_id,
                farmer_name=user_name,
                farmer_id_code=farmer_code,
                scheme_id=disc.scheme_id,
                scheme_name=scheme_name,
                benefit_id=disc.benefit_id,
                alert_type=disc.alert_type,
                severity=disc.severity,
                expected_amount=disc.expected_amount,
                actual_amount=disc.actual_amount,
                difference=disc.difference,
                explanation=disc.explanation,
                policy_clause=disc.policy_clause,
                policy_version=disc.policy_version,
                status=disc.status,
                officer_notes=disc.officer_notes,
            )
        )
    return output


@router.get("/{alert_id}", response_model=DiscrepancyResponse)
async def get_discrepancy(alert_id: str, db: AsyncSession = Depends(get_db)) -> DiscrepancyResponse:
    result = await db.execute(
        select(Discrepancy, Scheme.name, Farmer.farmer_id, User.name)
        .join(Scheme, Discrepancy.scheme_id == Scheme.id)
        .join(Farmer, Discrepancy.farmer_id == Farmer.id)
        .join(User, Farmer.user_id == User.id)
        .where(Discrepancy.id == alert_id)
    )
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Discrepancy alert not found")

    disc, scheme_name, farmer_code, user_name = row
    return DiscrepancyResponse(
        id=disc.id,
        farmer_id=disc.farmer_id,
        farmer_name=user_name,
        farmer_id_code=farmer_code,
        scheme_id=disc.scheme_id,
        scheme_name=scheme_name,
        benefit_id=disc.benefit_id,
        alert_type=disc.alert_type,
        severity=disc.severity,
        expected_amount=disc.expected_amount,
        actual_amount=disc.actual_amount,
        difference=disc.difference,
        explanation=disc.explanation,
        policy_clause=disc.policy_clause,
        policy_version=disc.policy_version,
        status=disc.status,
        officer_notes=disc.officer_notes,
    )


@router.put("/{alert_id}", response_model=DiscrepancyResponse)
async def review_discrepancy(
    alert_id: str,
    review: DiscrepancyReviewRequest,
    db: AsyncSession = Depends(get_db),
) -> DiscrepancyResponse:
    result = await db.execute(select(Discrepancy).where(Discrepancy.id == alert_id))
    disc = result.scalars().first()
    if not disc:
        raise HTTPException(status_code=404, detail="Discrepancy not found")

    disc.status = review.status
    disc.officer_notes = review.officer_notes
    await db.commit()
    await db.refresh(disc)

    # Fetch enriched data
    return await get_discrepancy(alert_id, db)
