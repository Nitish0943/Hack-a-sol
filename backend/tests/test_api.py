from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_root_returns_welcome_message() -> None:
    response = client.get("/")

    assert response.status_code == 200
    assert response.json()["message"] == "Welcome to the API."


def test_health_returns_ok() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_versioned_status_returns_application_information() -> None:
    response = client.get("/api/v1/status")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "application": "Full-Stack Starter API",
        "version": "0.1.0",
        "environment": "development",
    }