from fastapi.testclient import TestClient

from app.main import app
from app.db.store import execute
from app.core.config import Settings


def test_demo_otp_login_returns_farmer_profile() -> None:
    with TestClient(app) as client:
        sent = client.post("/api/v1/auth/send-otp", json={"mobileNumber": "9876543210"})
        assert sent.status_code == 200
        assert sent.json()["data"]["demoOtp"] == "123456"

        verified = client.post(
            "/api/v1/auth/verify-otp",
            json={"mobileNumber": "9876543210", "otp": "123456", "role": "farmer"},
        )
        assert verified.status_code == 200
        token = verified.json()["data"]["accessToken"]

        me = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert me.status_code == 200
        assert me.json()["data"]["user"]["role"] == "farmer"
        assert me.json()["data"]["farmer"]["farmer_id"] == "KS-CG-10482"


def test_farmer_role_cannot_read_admin_dashboard() -> None:
    with TestClient(app) as client:
        client.post("/api/v1/auth/send-otp", json={"mobileNumber": "9876543210"})
        verified = client.post(
            "/api/v1/auth/verify-otp",
            json={"mobileNumber": "9876543210", "otp": "123456", "role": "farmer"},
        )
        token = verified.json()["data"]["accessToken"]
        response = client.get(
            "/api/v1/admin/dashboard",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 403


def test_new_farmer_registration_creates_profile_and_session() -> None:
    with TestClient(app) as client:
        mobile = "9876501234"
        execute("DELETE FROM farmers WHERE id IN (SELECT id FROM users WHERE mobile_number=?)", (mobile,))
        execute("DELETE FROM users WHERE mobile_number=?", (mobile,))
        sent = client.post("/api/v1/auth/send-otp", json={"mobileNumber": mobile})
        assert sent.status_code == 200

        registered = client.post(
            "/api/v1/auth/register",
            json={
                "mobileNumber": mobile,
                "otp": "123456",
                "fullName": "Demo New Farmer",
                "preferredLanguage": "Hindi",
                "state": "Chhattisgarh",
                "district": "Raipur",
                "block": "Arang",
                "village": "New Village",
                "pincode": "493661",
                "farmerCategory": "Small & marginal farmer",
                "cultivatorStatus": "Landowner",
                "landholdingArea": 2.5,
            },
        )
        assert registered.status_code == 200
        data = registered.json()["data"]
        assert data["farmer"]["farmer_id"].startswith("KS-CG-")
        assert data["user"]["role"] == "farmer"

        token = data["accessToken"]
        me = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert me.status_code == 200
        assert me.json()["data"]["farmer"]["district"] == "Raipur"


def test_duplicate_farmer_registration_is_rejected() -> None:
    with TestClient(app) as client:
        mobile = "9876543210"
        client.post("/api/v1/auth/send-otp", json={"mobileNumber": mobile})
        registered = client.post(
            "/api/v1/auth/register",
            json={
                "mobileNumber": mobile,
                "otp": "123456",
                "fullName": "Duplicate Farmer",
                "preferredLanguage": "Hindi",
                "state": "Chhattisgarh",
                "district": "Raipur",
                "block": "Arang",
                "village": "Khamtarai",
                "pincode": "493661",
                "farmerCategory": "Other farmer",
                "cultivatorStatus": "Landowner",
                "landholdingArea": 1,
            },
        )
        assert registered.status_code == 409


def test_registration_rejects_invalid_otp() -> None:
    with TestClient(app) as client:
        mobile = "9876504321"
        client.post("/api/v1/auth/send-otp", json={"mobileNumber": mobile})
        registered = client.post(
            "/api/v1/auth/register",
            json={
                "mobileNumber": mobile,
                "otp": "000000",
                "fullName": "Invalid OTP Farmer",
                "preferredLanguage": "English",
                "state": "Chhattisgarh",
                "district": "Raipur",
                "block": "Arang",
                "village": "Test Village",
                "farmerCategory": "Other farmer",
                "cultivatorStatus": "Tenant farmer",
                "landholdingArea": 1.5,
            },
        )
        assert registered.status_code == 401


def test_demo_login_creates_session_for_each_portal_role() -> None:
    with TestClient(app) as client:
        for role, expected_path in (
            ("farmer", "/api/v1/farmers/me"),
            ("officer", "/api/v1/officer/dashboard"),
            ("admin", "/api/v1/admin/dashboard"),
        ):
            login = client.post("/api/v1/auth/demo-login", json={"role": role})
            assert login.status_code == 200
            assert login.json()["data"]["user"]["role"] == role
            token = login.json()["data"]["accessToken"]
            protected = client.get(
                expected_path,
                headers={"Authorization": f"Bearer {token}"},
            )
            assert protected.status_code == 200
            assert login.json()["data"]["isDemo"] is True


def test_demo_login_is_disabled_in_production(monkeypatch) -> None:
    from app.api.v1 import auth

    monkeypatch.setattr(
        auth,
        "get_settings",
        lambda: Settings(app_environment="production", demo_login_enabled=True),
    )
    with TestClient(app) as client:
        response = client.post("/api/v1/auth/demo-login", json={"role": "admin"})
    assert response.status_code == 404
