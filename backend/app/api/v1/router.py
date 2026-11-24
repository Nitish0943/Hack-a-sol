from fastapi import APIRouter

from app.api.v1.rag import router as rag_router
from app.api.v1.status import router as status_router
from app.api.v1.auth import router as auth_router
from app.api.v1.farmers import router as farmers_router
from app.api.v1.schemes import router as schemes_router
from app.api.v1.engines import router as engines_router
from app.api.v1.operations import router as operations_router
from app.api.v1.officer_admin import router as officer_admin_router
from app.api.v1.ivr import router as ivr_router
from app.api.v1.voice import router as voice_router
from app.api.v1.assistant import router as assistant_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(status_router)
api_router.include_router(rag_router)
api_router.include_router(auth_router)
api_router.include_router(farmers_router)
api_router.include_router(schemes_router)
api_router.include_router(engines_router)
api_router.include_router(operations_router)
api_router.include_router(officer_admin_router)
api_router.include_router(ivr_router)
api_router.include_router(voice_router)
api_router.include_router(assistant_router)


@api_router.get("/private-schemes")
async def get_private_schemes_list() -> dict:
    from app.api.v1.auth import success
    from app.db.store import many
    rows = many("SELECT * FROM private_schemes WHERE is_active=1 ORDER BY last_verified DESC")
    return success(rows, "Private schemes retrieved")

