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
