"""FastAPI integration tests for KrishiSetu AI RAG API endpoints."""

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_rag_status_endpoint() -> None:
    """Validate GET /api/v1/rag/status returns healthy status and indexed documents count."""
    response = client.get("/api/v1/rag/status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "KrishiSetu" in data["service"]
    assert data["indexed_documents"] >= 3
    assert "en" in data["supported_languages"]
    assert "hi" in data["supported_languages"]


def test_rag_schemes_endpoint() -> None:
    """Validate GET /api/v1/rag/schemes returns indexed government agricultural schemes."""
    response = client.get("/api/v1/rag/schemes")
    assert response.status_code == 200
    data = response.json()
    assert data["total_schemes"] >= 3
    scheme_names = [s["scheme_name"] for s in data["schemes"]]
    assert "PM-KISAN" in scheme_names
    assert "PMFBY" in scheme_names
    assert "Chhattisgarh Krishak Unnati Yojana" in scheme_names


def test_rag_query_pm_kisan_benefit() -> None:
    """Validate POST /api/v1/rag/query processes English query and returns grounded citations."""
    payload = {
        "question": "What is the benefit under PM-KISAN?",
        "language": "en",
        "response_style": "detailed",
    }
    response = client.post("/api/v1/rag/query", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["answer_status"] == "answered"
    assert "₹6,000" in data["answer"]
    assert len(data["citations"]) >= 1
    assert data["citations"][0]["scheme_name"] == "PM-KISAN"
    assert "KrishiSetu AI provides official policy guidance only" in data["eligibility_disclaimer"]


def test_rag_query_hindi_ivr() -> None:
    """Validate POST /api/v1/rag/query handles Hindi query with concise IVR style."""
    payload = {
        "question": "पीएम किसान योजना में कितने पैसे मिलते हैं?",
        "language": "hi",
        "response_style": "ivr",
    }
    response = client.post("/api/v1/rag/query", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["language"] == "hi"
    assert data["answer_status"] == "answered"
    assert data["ivr_summary"] is not None


def test_rag_query_chhattisgarhi_endpoint() -> None:
    """Validate POST /api/v1/rag/query handles Chhattisgarhi language questions."""
    payload = {
        "question": "पीएम किसान योजना म कतेक पइसा मिलही?",
        "response_style": "ivr",
    }
    response = client.post("/api/v1/rag/query", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["language"] == "chg"
    assert data["answer_status"] == "answered"
    assert "₹6,000" in data["answer"]
    assert data["ivr_summary"] is not None


def test_rag_query_safe_abstention() -> None:
    """Validate POST /api/v1/rag/query safely abstains when evidence is missing."""
    payload = {
        "question": "What is the government subsidy for buying supersonic passenger planes?",
    }
    response = client.post("/api/v1/rag/query", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["answer_status"] == "abstained"
    assert data["evidence_status"] == "insufficient_evidence"
    assert len(data["citations"]) == 0
