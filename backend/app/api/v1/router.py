from fastapi import APIRouter

from app.api.v1.applications import router as applications_router
from app.api.v1.auth import router as auth_router
from app.api.v1.benefits import router as benefits_router
from app.api.v1.calculator import router as calculator_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.diagnosis import router as diagnosis_router
from app.api.v1.discrepancies import router as discrepancies_router
from app.api.v1.eligibility import router as eligibility_router
from app.api.v1.farmers import router as farmers_router
from app.api.v1.grievances import router as grievances_router
from app.api.v1.ivr import router as ivr_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.radar import router as radar_router
from app.api.v1.schemes import router as schemes_router
from app.api.v1.status import router as status_router
from app.api.v1.verifications import router as verifications_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(status_router)
api_router.include_router(auth_router)
api_router.include_router(farmers_router)
api_router.include_router(schemes_router)
api_router.include_router(eligibility_router)
api_router.include_router(calculator_router)
api_router.include_router(benefits_router)
api_router.include_router(applications_router)
api_router.include_router(grievances_router)
api_router.include_router(discrepancies_router)
api_router.include_router(verifications_router)
api_router.include_router(radar_router)
api_router.include_router(diagnosis_router)
api_router.include_router(ivr_router)
api_router.include_router(notifications_router)
api_router.include_router(dashboard_router)
