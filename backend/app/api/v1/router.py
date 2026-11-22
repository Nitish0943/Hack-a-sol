from fastapi import APIRouter

from app.api.v1.rag import router as rag_router
from app.api.v1.status import router as status_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(status_router)
api_router.include_router(rag_router)
