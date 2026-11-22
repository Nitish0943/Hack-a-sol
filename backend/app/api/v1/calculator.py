from fastapi import APIRouter
from app.schemas.calculator import CalculatorRequest, CalculatorResponse
from app.services.calculator_service import CalculatorService

router = APIRouter(prefix="/calculator", tags=["calculator"])


@router.post("/calculate", response_model=CalculatorResponse)
async def calculate_benefit(req: CalculatorRequest) -> CalculatorResponse:
    result = CalculatorService.calculate(
        calculator_type=req.calculator_type,
        area_acres=req.area_acres,
        crop=req.crop,
        loan_amount=req.loan_amount,
        equipment_type=req.equipment_type,
        farmer_category=req.farmer_category,
        state=req.state,
        financial_year=req.financial_year,
    )
    return CalculatorResponse(**result)
