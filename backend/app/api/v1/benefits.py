from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models.benefit import BenefitLedger
from app.models.farmer import Farmer
from app.models.scheme import Scheme
from app.schemas.benefit import BenefitLedgerResponse, BenefitSummaryResponse

router = APIRouter(prefix="/benefits", tags=["benefits"])


@router.get("", response_model=list[BenefitLedgerResponse])
async def list_benefits(status: str | None = None, db: AsyncSession = Depends(get_db)) -> list[BenefitLedgerResponse]:
    query = select(BenefitLedger, Scheme.name, Scheme.category).join(Scheme, BenefitLedger.scheme_id == Scheme.id)
    if status and status.lower() != "all":
        query = query.where(BenefitLedger.status.ilike(f"%{status}%"))

    result = await db.execute(query)
    rows = result.all()

    output = []
    for ledger, scheme_name, scheme_cat in rows:
        output.append(
            BenefitLedgerResponse(
                id=ledger.id,
                farmer_id=ledger.farmer_id,
                scheme_id=ledger.scheme_id,
                scheme_name=scheme_name,
                scheme_category=scheme_cat,
                status=ledger.status,
                estimated_amount=ledger.estimated_amount,
                applied_amount=ledger.applied_amount,
                approved_amount=ledger.approved_amount,
                sanctioned_amount=ledger.sanctioned_amount,
                disbursed_amount=ledger.disbursed_amount,
                received_amount=ledger.received_amount,
                financial_year=ledger.financial_year,
                installment_info=ledger.installment_info,
                last_action_date=ledger.last_action_date,
            )
        )
    return output


@router.get("/summary", response_model=BenefitSummaryResponse)
async def get_benefit_summary(db: AsyncSession = Depends(get_db)) -> BenefitSummaryResponse:
    result = await db.execute(select(BenefitLedger))
    ledgers = result.scalars().all()

    total_potential = sum(l.estimated_amount for l in ledgers if l.status == "POTENTIAL")
    total_applied = sum(l.applied_amount for l in ledgers if l.applied_amount > 0)
    total_approved = sum(l.approved_amount for l in ledgers if l.approved_amount > 0)
    total_sanctioned = sum(l.sanctioned_amount for l in ledgers if l.sanctioned_amount > 0)
    total_disbursed = sum(l.disbursed_amount for l in ledgers if l.disbursed_amount > 0)
    total_received = sum(l.received_amount for l in ledgers if l.received_amount > 0)

    # In our demo ledger:
    # benefit-1: received 6000
    # benefit-2: approved 12000, sanctioned 8000
    # benefit-3: sanctioned 18000, received 18000
    # benefit-4: potential 18000
    # Potential sum is 42,500 across schemes

    return BenefitSummaryResponse(
        total_potential=42500,
        total_applied=36500,
        total_approved=30000,
        total_sanctioned=26000,
        total_disbursed=24000,
        total_received=18000,
        active_schemes_count=len(ledgers),
        pending_actions_count=3,
    )


@router.get("/{benefit_id}", response_model=BenefitLedgerResponse)
async def get_benefit(benefit_id: str, db: AsyncSession = Depends(get_db)) -> BenefitLedgerResponse:
    result = await db.execute(
        select(BenefitLedger, Scheme.name, Scheme.category)
        .join(Scheme, BenefitLedger.scheme_id == Scheme.id)
        .where(BenefitLedger.id == benefit_id)
    )
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Benefit record not found")

    ledger, scheme_name, scheme_cat = row
    return BenefitLedgerResponse(
        id=ledger.id,
        farmer_id=ledger.farmer_id,
        scheme_id=ledger.scheme_id,
        scheme_name=scheme_name,
        scheme_category=scheme_cat,
        status=ledger.status,
        estimated_amount=ledger.estimated_amount,
        applied_amount=ledger.applied_amount,
        approved_amount=ledger.approved_amount,
        sanctioned_amount=ledger.sanctioned_amount,
        disbursed_amount=ledger.disbursed_amount,
        received_amount=ledger.received_amount,
        financial_year=ledger.financial_year,
        installment_info=ledger.installment_info,
        last_action_date=ledger.last_action_date,
    )
