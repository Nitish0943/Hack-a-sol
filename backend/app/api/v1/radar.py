from fastapi import APIRouter
from app.services.scheme_radar import SchemeChangeImpactRadar

router = APIRouter(prefix="/radar", tags=["radar"])


@router.get("")
async def get_radar_policy_updates(scheme_id: str | None = None):
    return SchemeChangeImpactRadar.get_radar_updates(scheme_id)
