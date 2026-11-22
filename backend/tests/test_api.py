from fastapi.testclient import TestClient

from app.core.config import get_settings
from app.main import app

settings = get_settings()

client = TestClient(app)


def test_root_returns_welcome_message() -> None:
    response = client.get("/")
    assert response.status_code == 200
    assert "Welcome" in response.json()["message"]


def test_health_returns_ok() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_versioned_status_returns_application_information() -> None:
    response = client.get("/api/v1/status")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert "KrishiSetu" in response.json()["application"] or "API" in response.json()["application"]


def test_schemes_directory_returns_seeded_schemes() -> None:
    with TestClient(app) as test_client:
        response = test_client.get("/api/v1/schemes")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 5
        scheme_ids = [s["id"] for s in data]
        assert "pm-kisan" in scheme_ids
        assert "kcc" in scheme_ids
        assert "rgkny" in scheme_ids


def test_deterministic_eligibility_engine() -> None:
    with TestClient(app) as test_client:
        response = test_client.post(
            "/api/v1/eligibility/check",
            json={"scheme_id": "pm-kisan"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["scheme_id"] == "pm-kisan"
        assert data["status"] in [
            "POTENTIALLY_ELIGIBLE",
            "NEEDS_ADDITIONAL_VERIFICATION",
            "NOT_ELIGIBLE_BASED_ON_AVAILABLE_INFO",
            "INCOMPLETE_INFORMATION",
        ]
        assert "passed_conditions" in data
        assert "recommended_action" in data


def test_benefit_calculator_kcc() -> None:
    with TestClient(app) as test_client:
        response = test_client.post(
            "/api/v1/calculator/calculate",
            json={
                "calculator_type": "kcc",
                "area_acres": 2.0,
                "crop": "Paddy",
                "loan_amount": 100000,
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["estimated_benefit"] > 0
        assert "formula" in data
        assert "policy_reference" in data


def test_financial_digital_twin_ledger() -> None:
    with TestClient(app) as test_client:
        response = test_client.get("/api/v1/benefits")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 3

        summary_res = test_client.get("/api/v1/benefits/summary")
        assert summary_res.status_code == 200
        summary = summary_res.json()
        assert summary["total_potential"] > 0
        assert summary["total_received"] > 0


def test_integrity_discrepancies() -> None:
    with TestClient(app) as test_client:
        response = test_client.get("/api/v1/discrepancies")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert "Sanction Amount Mismatch" in [d["alert_type"] for d in data]


def test_ivr_dtmf_simulation() -> None:
    with TestClient(app) as test_client:
        response = test_client.post(
            "/api/v1/ivr/process-key",
            json={"key": "1", "language": "hi", "phone": "9876543210"},
        )
        assert response.status_code == 200
        data = response.json()
        assert "text" in data
        assert "पीएम-किसान" in data["text"]
