import json
import secrets
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.api.v1.auth import require_role, success
from app.db.store import execute, many, one

router = APIRouter(tags=["business engines"])


class EligibilityRequest(BaseModel):
    schemeId: str
    farmerInputs: dict[str, object] | None = None


class LoanRequest(BaseModel):
    principalAmount: float = Field(gt=0)
    annualInterestRate: float = Field(ge=0)
    applicableSubventionRate: float = Field(ge=0)
    tenureMonths: int = Field(gt=0, le=360)
    calculationType: Literal["simple_interest"] = "simple_interest"


class SubsidyRequest(BaseModel):
    eligibleCost: float = Field(gt=0)
    subsidyPercentage: float = Field(ge=0, le=100)
    maximumSubsidy: float = Field(ge=0)


@router.post("/eligibility/check")
async def check_eligibility(payload: EligibilityRequest, user: dict = Depends(require_role("farmer", "admin"))) -> dict:
    scheme = one("SELECT * FROM schemes WHERE id=?", (payload.schemeId,))
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
    farmer = one("SELECT * FROM farmers WHERE id=?", (user["id"],))
    inputs = payload.farmerInputs or {}
    state = str(inputs.get("state") or farmer["state"] or "")
    land = inputs.get("landAreaAcres")
    if land is None:
        land = farmer["cultivated_area"]
    missing = []
    passed = []
    failed = []
    if not state:
        missing.append("State")
    else:
        passed.append({"rule": "location", "passed": True, "explanation": "A state is available for configured coverage review."})
    if land is None:
        missing.append("Landholding area")
    elif float(land) <= 0:
        failed.append({"rule": "landholding", "passed": False, "explanation": "Landholding area must be greater than zero."})
    else:
        passed.append({"rule": "landholding", "passed": True, "explanation": f"Landholding area is {land} acres."})
    cultivator = str(inputs.get("cultivatorType") or farmer["cultivator_status"] or "")
    if not cultivator:
        missing.append("Cultivator status")
    else:
        passed.append({"rule": "cultivator", "passed": True, "explanation": f"Cultivator status is recorded as {cultivator}."})
    status = "needs_information" if missing else ("not_eligible" if failed else "eligible")
    result_id = f"eligibility-{secrets.token_hex(8)}"
    execute(
        "INSERT INTO eligibility_results(id,farmer_id,scheme_id,status,passed_rules,failed_rules,missing_information,explanation,policy_version,is_demo) VALUES(?,?,?,?,?,?,?,?,?,1)",
        (result_id, user["id"], payload.schemeId, status, json.dumps(passed), json.dumps(failed), json.dumps(missing), "Deterministic demo policy evaluation. Not an official government approval.", scheme["policy_version"]),
    )
    return success({
        "resultId": result_id,
        "eligibilityStatus": status,
        "estimatedBenefit": None,
        "passedRules": passed,
        "failedRules": failed,
        "missingInformation": missing,
        "policyVersion": scheme["policy_version"],
        "isOfficialApproval": False,
        "isDemo": True,
    }, "Eligibility evaluated")


@router.get("/eligibility/results")
async def eligibility_results(user: dict = Depends(require_role("farmer", "admin"))) -> dict:
    rows = many("SELECT * FROM eligibility_results WHERE farmer_id=? ORDER BY calculated_at DESC", (user["id"],))
    for row in rows:
        row["passed_rules"] = json.loads(row["passed_rules"]) if row["passed_rules"] else []
        row["failed_rules"] = json.loads(row["failed_rules"]) if row["failed_rules"] else []
        row["missing_information"] = json.loads(row["missing_information"]) if row["missing_information"] else []
    return success(rows, "Eligibility results retrieved")


@router.get("/eligibility/results/{result_id}")
async def eligibility_detail(result_id: str, user: dict = Depends(require_role("farmer", "officer", "admin"))) -> dict:
    row = one("SELECT * FROM eligibility_results WHERE id=?", (result_id,))
    if not row:
        raise HTTPException(status_code=404, detail="Eligibility result not found")
    if user["role"] == "farmer" and row["farmer_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Permission denied")
    row["passed_rules"] = json.loads(row["passed_rules"]) if row["passed_rules"] else []
    row["failed_rules"] = json.loads(row["failed_rules"]) if row["failed_rules"] else []
    row["missing_information"] = json.loads(row["missing_information"]) if row["missing_information"] else []
    return success(row, "Eligibility result retrieved")


@router.post("/calculator/loan")
async def calculate_loan(payload: LoanRequest, user: dict = Depends(require_role("farmer", "admin"))) -> dict:
    subvention = payload.applicableSubventionRate / 100
    simple_interest = payload.principalAmount * (payload.annualInterestRate / 100) * (payload.tenureMonths / 12)
    interest_after_subvention = max(0, simple_interest - payload.principalAmount * subvention)
    result = {
        "principalAmount": payload.principalAmount,
        "annualInterestRate": payload.annualInterestRate,
        "applicableSubventionRate": payload.applicableSubventionRate,
        "estimatedInterest": round(interest_after_subvention, 2),
        "estimatedTotalRepayment": round(payload.principalAmount + interest_after_subvention, 2),
        "assumptions": ["Illustrative simple-interest calculation", "Subvention is deducted as a configured estimate", "No bank fees or insurance charges are included"],
        "isOfficialQuote": False,
        "isDemo": True,
    }
    execute(
        "INSERT INTO calculations(id,farmer_id,calculation_type,inputs,result,policy_version,is_demo) VALUES(?,?,?,?,?,?,1)",
        (f"calc-{secrets.token_hex(8)}", user["id"], "loan", payload.model_dump_json(), json.dumps(result), "2026-CG-CREDIT-01"),
    )
    return success(result, "Loan estimate calculated")


@router.post("/calculator/subsidy")
async def calculate_subsidy(payload: SubsidyRequest, user: dict = Depends(require_role("farmer", "admin"))) -> dict:
    estimated = min(payload.eligibleCost * payload.subsidyPercentage / 100, payload.maximumSubsidy)
    result = {
        "eligibleCost": payload.eligibleCost,
        "subsidyPercentage": payload.subsidyPercentage,
        "maximumSubsidy": payload.maximumSubsidy,
        "estimatedBenefit": round(estimated, 2),
        "farmerContribution": round(max(0, payload.eligibleCost - estimated), 2),
        "assumptions": ["Illustrative subsidy formula", "Maximum configured subsidy cap applied"],
        "isOfficialQuote": False,
        "isDemo": True,
    }
    execute(
        "INSERT INTO calculations(id,farmer_id,calculation_type,inputs,result,policy_version,is_demo) VALUES(?,?,?,?,?,?,1)",
        (f"calc-{secrets.token_hex(8)}", user["id"], "subsidy", payload.model_dump_json(), json.dumps(result), "DEMO-SUBSIDY-01"),
    )
    return success(result, "Subsidy estimate calculated")


@router.get("/calculator/history")
async def calculator_history(user: dict = Depends(require_role("farmer", "admin"))) -> dict:
    rows = many("SELECT * FROM calculations WHERE farmer_id=? ORDER BY calculated_at DESC", (user["id"],))
    for row in rows:
        row["inputs"] = json.loads(row["inputs"]) if row["inputs"] else {}
        row["result"] = json.loads(row["result"]) if row["result"] else {}
    return success(rows, "Calculation history retrieved")
