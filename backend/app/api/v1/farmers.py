from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models.farmer import Farmer
from app.models.user import User
from app.schemas.farmer import FarmerResponse, FarmerUpdate

router = APIRouter(prefix="/farmers", tags=["farmers"])


@router.get("/me", response_model=FarmerResponse)
async def get_my_profile(db: AsyncSession = Depends(get_db)) -> FarmerResponse:
    result = await db.execute(select(Farmer).join(User))
    farmer = result.scalars().first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer profile not found")

    user_result = await db.execute(select(User).where(User.id == farmer.user_id))
    user = user_result.scalars().first()

    return FarmerResponse(
        id=farmer.id,
        user_id=farmer.user_id,
        farmer_id=farmer.farmer_id,
        name=user.name if user else "Ramesh Kumar",
        phone=user.phone if user else "9876543210",
        state=farmer.state,
        district=farmer.district,
        block=farmer.block,
        village=farmer.village,
        pincode=farmer.pincode,
        farmer_category=farmer.farmer_category,
        cultivator_status=farmer.cultivator_status,
        landholding_acres=farmer.landholding_acres,
        cultivated_area=farmer.cultivated_area,
        crops_json=farmer.crops_json,
        farming_season=farmer.farming_season,
        irrigation_type=farmer.irrigation_type,
        profile_completion=farmer.profile_completion,
    )


@router.put("/me", response_model=FarmerResponse)
async def update_my_profile(update_data: FarmerUpdate, db: AsyncSession = Depends(get_db)) -> FarmerResponse:
    result = await db.execute(select(Farmer).join(User))
    farmer = result.scalars().first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer profile not found")

    user_result = await db.execute(select(User).where(User.id == farmer.user_id))
    user = user_result.scalars().first()

    if update_data.name and user:
        user.name = update_data.name

    for field, val in update_data.model_dump(exclude_unset=True).items():
        if field != "name" and hasattr(farmer, field):
            setattr(farmer, field, val)

    await db.commit()
    await db.refresh(farmer)

    return FarmerResponse(
        id=farmer.id,
        user_id=farmer.user_id,
        farmer_id=farmer.farmer_id,
        name=user.name if user else "Ramesh Kumar",
        phone=user.phone if user else "9876543210",
        state=farmer.state,
        district=farmer.district,
        block=farmer.block,
        village=farmer.village,
        pincode=farmer.pincode,
        farmer_category=farmer.farmer_category,
        cultivator_status=farmer.cultivator_status,
        landholding_acres=farmer.landholding_acres,
        cultivated_area=farmer.cultivated_area,
        crops_json=farmer.crops_json,
        farming_season=farmer.farming_season,
        irrigation_type=farmer.irrigation_type,
        profile_completion=farmer.profile_completion,
    )


@router.get("", response_model=list[FarmerResponse])
async def list_farmers(db: AsyncSession = Depends(get_db)) -> list[FarmerResponse]:
    result = await db.execute(select(Farmer))
    farmers = result.scalars().all()

    output = []
    for f in farmers:
        user_res = await db.execute(select(User).where(User.id == f.user_id))
        u = user_res.scalars().first()
        output.append(
            FarmerResponse(
                id=f.id,
                user_id=f.user_id,
                farmer_id=f.farmer_id,
                name=u.name if u else "Farmer",
                phone=u.phone if u else "N/A",
                state=f.state,
                district=f.district,
                block=f.block,
                village=f.village,
                pincode=f.pincode,
                farmer_category=f.farmer_category,
                cultivator_status=f.cultivator_status,
                landholding_acres=f.landholding_acres,
                cultivated_area=f.cultivated_area,
                crops_json=f.crops_json,
                farming_season=f.farming_season,
                irrigation_type=f.irrigation_type,
                profile_completion=f.profile_completion,
            )
        )
    return output


@router.get("/{farmer_id}", response_model=FarmerResponse)
async def get_farmer_by_id(farmer_id: str, db: AsyncSession = Depends(get_db)) -> FarmerResponse:
    result = await db.execute(select(Farmer).where((Farmer.farmer_id == farmer_id) | (Farmer.id == int(farmer_id) if farmer_id.isdigit() else False)))
    f = result.scalars().first()
    if not f:
        raise HTTPException(status_code=404, detail="Farmer not found")

    user_res = await db.execute(select(User).where(User.id == f.user_id))
    u = user_res.scalars().first()
    return FarmerResponse(
        id=f.id,
        user_id=f.user_id,
        farmer_id=f.farmer_id,
        name=u.name if u else "Farmer",
        phone=u.phone if u else "N/A",
        state=f.state,
        district=f.district,
        block=f.block,
        village=f.village,
        pincode=f.pincode,
        farmer_category=f.farmer_category,
        cultivator_status=f.cultivator_status,
        landholding_acres=f.landholding_acres,
        cultivated_area=f.cultivated_area,
        crops_json=f.crops_json,
        farming_season=f.farming_season,
        irrigation_type=f.irrigation_type,
        profile_completion=f.profile_completion,
    )
