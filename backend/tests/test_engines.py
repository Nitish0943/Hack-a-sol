from fastapi.testclient import TestClient

from app.main import app


def login(client: TestClient) -> str:
    client.post("/api/v1/auth/send-otp", json={"mobileNumber": "9876543210"})
    response = client.post(
        "/api/v1/auth/verify-otp",
        json={"mobileNumber": "9876543210", "otp": "123456", "role": "farmer"},
    )
    return response.json()["data"]["accessToken"]


def test_simple_loan_calculation_is_explainable() -> None:
    with TestClient(app) as client:
        token = login(client)
        response = client.post(
            "/api/v1/calculator/loan",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "principalAmount": 100000,
                "annualInterestRate": 7,
                "applicableSubventionRate": 3,
                "tenureMonths": 12,
                "calculationType": "simple_interest",
            },
        )
        assert response.status_code == 200
        data = response.json()["data"]
        assert data["estimatedInterest"] == 4000
        assert data["estimatedTotalRepayment"] == 104000
        assert data["isOfficialQuote"] is False


def test_subsidy_calculation_applies_maximum_cap() -> None:
    with TestClient(app) as client:
        token = login(client)
        response = client.post(
            "/api/v1/calculator/subsidy",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "eligibleCost": 200000,
                "subsidyPercentage": 50,
                "maximumSubsidy": 50000,
            },
        )
        assert response.status_code == 200
        data = response.json()["data"]
        assert data["estimatedBenefit"] == 50000
        assert data["farmerContribution"] == 150000
