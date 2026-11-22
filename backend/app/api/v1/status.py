from fastapi import APIRouter

from app.core.config import get_settings
from app.schemas.status import StatusResponse

router = APIRouter(tags=["status"])


@router.get("/status", response_model=StatusResponse)
async def get_api_status() -> StatusResponse:
    settings = get_settings()
    return StatusResponse(
        status="ok",
        application=settings.app_name,
        version=settings.app_version,
        environment=settings.app_environment,
    )


@router.get("/health")
async def get_api_health() -> dict:
    return {
        "success": True,
        "message": "API is operational",
        "data": {
            "api": "operational",
            "database": "connected",
            "environment": get_settings().app_environment,
        },
        "meta": None,
    }