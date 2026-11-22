from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models.scheme import Scheme
from app.schemas.scheme import SchemeResponse

router = APIRouter(prefix="/schemes", tags=["schemes"])


@router.get("", response_model=list[SchemeResponse])
async def list_schemes(
    category: str | None = None,
    state: str | None = None,
    search: str | None = None,
    db: AsyncSession = Depends(get_db),
) -> list[SchemeResponse]:
    query = select(Scheme).where(Scheme.is_active == True)

    if category and category.lower() != "all":
        query = query.where(Scheme.category.ilike(f"%{category}%"))
    if state and state.lower() != "all":
        query = query.where((Scheme.state == state) | (Scheme.state == "All-India"))
    if search:
        query = query.where(
            Scheme.name.ilike(f"%{search}%")
            | Scheme.name_hi.ilike(f"%{search}%")
            | Scheme.description.ilike(f"%{search}%")
            | Scheme.category.ilike(f"%{search}%")
        )

    result = await db.execute(query)
    schemes = result.scalars().all()
    return list(schemes)


@router.get("/{scheme_id}", response_model=SchemeResponse)
async def get_scheme(scheme_id: str, db: AsyncSession = Depends(get_db)) -> SchemeResponse:
    result = await db.execute(select(Scheme).where(Scheme.id == scheme_id))
    scheme = result.scalars().first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
    return scheme
