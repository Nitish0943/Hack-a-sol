from fastapi import APIRouter
from app.services.blocker_diagnosis import AccessBlockerDiagnosis

router = APIRouter(prefix="/diagnosis", tags=["diagnosis"])


@router.get("")
async def diagnose_blockers(symptom: str | None = None):
    return AccessBlockerDiagnosis.diagnose(symptom)
