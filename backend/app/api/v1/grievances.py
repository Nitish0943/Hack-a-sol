from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models.farmer import Farmer
from app.models.grievance import Grievance
from app.models.scheme import Scheme
from app.schemas.grievance import GrievanceCreate, GrievanceResponse

router = APIRouter(prefix="/grievances", tags=["grievances"])


@router.get("", response_model=list[GrievanceResponse])
async def list_grievances(status: str | None = None, db: AsyncSession = Depends(get_db)) -> list[GrievanceResponse]:
    query = select(Grievance, Scheme.name).join(Scheme, Grievance.scheme_id == Scheme.id)
    if status and status.lower() != "all":
        query = query.where(Grievance.status.ilike(f"%{status}%"))

    result = await db.execute(query)
    rows = result.all()

    output = []
    for grv, scheme_name in rows:
        output.append(
            GrievanceResponse(
                id=grv.id,
                farmer_id=grv.farmer_id,
                scheme_id=grv.scheme_id,
                scheme_name=scheme_name,
                reference_number=grv.reference_number,
                category=grv.category,
                description=grv.description,
                status=grv.status,
                officer_resolution=grv.officer_resolution,
                resolution_date=grv.resolution_date,
                created_at=grv.created_at.strftime("%d %b %Y"),
            )
        )
    return output


@router.post("", response_model=GrievanceResponse)
async def create_grievance(data: GrievanceCreate, db: AsyncSession = Depends(get_db)) -> GrievanceResponse:
    farmer_res = await db.execute(select(Farmer))
    farmer = farmer_res.scalars().first()
    if not farmer:
        raise HTTPException(status_code=400, detail="No registered farmer profile found")

    new_id = f"grv-{int(datetime.now().timestamp())}"
    ref_num = f"GRV-2026-{int(datetime.now().timestamp()) % 10000:04d}"

    grv = Grievance(
        id=new_id,
        farmer_id=farmer.id,
        scheme_id=data.scheme_id,
        reference_number=ref_num,
        category=data.category,
        description=data.description,
        status="Under review",
        officer_resolution="Automated ticket registered. Dossier queued for Agriculture Officer review.",
        resolution_date="Pending",
    )
    db.add(grv)
    await db.commit()
    await db.refresh(grv)

    scheme_res = await db.execute(select(Scheme).where(Scheme.id == grv.scheme_id))
    scheme = scheme_res.scalars().first()

    return GrievanceResponse(
        id=grv.id,
        farmer_id=grv.farmer_id,
        scheme_id=grv.scheme_id,
        scheme_name=scheme.name if scheme else "",
        reference_number=grv.reference_number,
        category=grv.category,
        description=grv.description,
        status=grv.status,
        officer_resolution=grv.officer_resolution,
        resolution_date=grv.resolution_date,
        created_at=grv.created_at.strftime("%d %b %Y"),
    )


@router.get("/{grievance_id}", response_model=GrievanceResponse)
async def get_grievance(grievance_id: str, db: AsyncSession = Depends(get_db)) -> GrievanceResponse:
    result = await db.execute(
        select(Grievance, Scheme.name)
        .join(Scheme, Grievance.scheme_id == Scheme.id)
        .where(Grievance.id == grievance_id)
    )
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Grievance not found")

    grv, scheme_name = row
    return GrievanceResponse(
        id=grv.id,
        farmer_id=grv.farmer_id,
        scheme_id=grv.scheme_id,
        scheme_name=scheme_name,
        reference_number=grv.reference_number,
        category=grv.category,
        description=grv.description,
        status=grv.status,
        officer_resolution=grv.officer_resolution,
        resolution_date=grv.resolution_date,
        created_at=grv.created_at.strftime("%d %b %Y"),
    )
