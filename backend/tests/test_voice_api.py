import sqlite3
import xml.etree.ElementTree as ET

import pytest
from fastapi.testclient import TestClient
from twilio.request_validator import RequestValidator

from app.api.v1 import voice as voice_api
from app.core.config import Settings
from app.db import store
from app.main import app


@pytest.fixture
def voice_client(tmp_path, monkeypatch):
    settings = Settings(
        app_environment="development",
        database_path=str(tmp_path / "voice.sqlite3"),
        twilio_account_sid="AC" + "1" * 32,
        twilio_auth_token="voice-test-auth-token",
        twilio_phone_number="+18005550123",
        twilio_webhook_public_url="https://voice.example.test",
        voice_otp_secret="voice-test-otp-pepper",
        voice_private_data_enabled=True,
        demo_login_enabled=True,
    )
    monkeypatch.setattr(store, "get_settings", lambda: settings)
    monkeypatch.setattr(voice_api, "get_settings", lambda: settings)
    with TestClient(app) as client:
        yield client, settings


def signed_post(client, settings, path: str, payload: dict[str, str]):
    url = f"{settings.twilio_webhook_public_url}{path}"
    signature = RequestValidator(settings.twilio_auth_token).compute_signature(url, payload)
    return client.post(
        path,
        data=payload,
        headers={"X-Twilio-Signature": signature},
    )


def spoken_text(response) -> str:
    return "".join(ET.fromstring(response.text).itertext())


def start_call(
    client,
    settings,
    call_sid: str,
    caller: str = "+919876543210",
    language_digit: str = "1",
) -> None:
    incoming = signed_post(
        client,
        settings,
        "/api/v1/voice/incoming",
        {"CallSid": call_sid, "From": caller, "To": "+18005550123", "CallStatus": "in-progress"},
    )
    assert incoming.status_code == 200
    chosen = signed_post(
        client,
        settings,
        "/api/v1/voice/language",
        {"CallSid": call_sid, "Digits": language_digit},
    )
    assert chosen.status_code == 200


def test_voice_webhook_rejects_missing_or_invalid_twilio_signature(voice_client):
    client, settings = voice_client
    payload = {"CallSid": "CA" + "1" * 32, "From": "+919876543210"}

    missing = client.post("/api/v1/voice/incoming", data=payload)
    invalid = client.post(
        "/api/v1/voice/incoming",
        data=payload,
        headers={"X-Twilio-Signature": "invalid"},
    )

    assert missing.status_code == 403
    assert invalid.status_code == 403
    assert store.one("SELECT call_sid FROM voice_call_sessions") is None


def test_ivr_compatibility_path_accepts_signed_incoming_call(voice_client):
    client, settings = voice_client
    call_sid = "CA" + "e" * 32
    payload = {"CallSid": call_sid, "From": "+919876543210", "To": "+18005550123"}

    invalid = client.post(
        "/ivr",
        data=payload,
        headers={"X-Twilio-Signature": "invalid"},
    )
    response = signed_post(
        client,
        settings,
        "/ivr",
        payload,
    )

    assert invalid.status_code == 403
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("application/xml")
    assert store.one(
        "SELECT call_sid FROM voice_call_sessions WHERE call_sid=?",
        (call_sid,),
    ) == {"call_sid": call_sid}


def test_incoming_call_and_language_selection_persist_session(voice_client):
    client, settings = voice_client
    call_sid = "CA" + "2" * 32

    incoming = signed_post(
        client,
        settings,
        "/api/v1/voice/incoming",
        {"CallSid": call_sid, "From": "+919876543210", "To": "+18005550123"},
    )
    language = signed_post(
        client,
        settings,
        "/api/v1/voice/language",
        {"CallSid": call_sid, "Digits": "2"},
    )
    session = store.one(
        "SELECT language,state FROM voice_call_sessions WHERE call_sid=?",
        (call_sid,),
    )

    assert incoming.status_code == 200
    assert incoming.headers["content-type"].startswith("application/xml")
    assert ET.fromstring(incoming.text).find(".//Gather").attrib["input"] == "dtmf"
    assert language.status_code == 200
    assert "Press 1 for government schemes" in language.text
    assert session == {"language": "en", "state": "main_menu"}


def test_speech_question_uses_rag_and_returns_source(voice_client, monkeypatch):
    client, settings = voice_client
    call_sid = "CA" + "3" * 32
    start_call(client, settings, call_sid, language_digit="2")

    class Citation:
        document_title = "PM-KISAN Operational Guidelines"
        verification_status = "VERIFIED"

    class Answer:
        answer_status = "answered"
        ivr_summary = "Eligible families receive the scheme benefit."
        answer = ivr_summary
        citations = [Citation()]

    monkeypatch.setattr(voice_api, "_voice_query", lambda question, language: Answer())
    response = signed_post(
        client,
        settings,
        "/api/v1/voice/process",
        {
            "CallSid": call_sid,
            "SpeechResult": "What is the PM-KISAN benefit?",
            "Confidence": "0.91",
        },
    )

    assert response.status_code == 200
    text = spoken_text(response)
    assert "Eligible families receive the scheme benefit." in text
    assert "PM-KISAN Operational Guidelines" in text
    assert store.one(
        "SELECT policy_query_count FROM voice_call_sessions WHERE call_sid=?",
        (call_sid,),
    )["policy_query_count"] == 1


def test_private_benefits_require_sms_otp_and_are_labeled_demo(voice_client, monkeypatch):
    client, settings = voice_client
    call_sid = "CA" + "4" * 32
    delivered_codes: list[str] = []
    monkeypatch.setattr(
        "app.services.voice.send_voice_otp",
        lambda settings, to_number, code, language: delivered_codes.append(code),
    )
    start_call(client, settings, call_sid, language_digit="2")

    requested = signed_post(
        client,
        settings,
        "/api/v1/voice/process",
        {"CallSid": call_sid, "Digits": "5", "From": "+919876543210"},
    )
    session = store.one(
        "SELECT candidate_user_id,state FROM voice_call_sessions WHERE call_sid=?",
        (call_sid,),
    )
    challenge = store.one(
        "SELECT code_hash,attempts FROM voice_otp_challenges WHERE call_sid=?",
        (call_sid,),
    )

    assert requested.status_code == 200
    assert len(delivered_codes) == 1
    assert delivered_codes[0] not in requested.text
    assert session == {"candidate_user_id": "user-farmer-1", "state": "verification"}
    assert challenge["code_hash"] != delivered_codes[0]
    assert challenge["attempts"] == 0

    verified = signed_post(
        client,
        settings,
        "/api/v1/voice/verify",
        {"CallSid": call_sid, "Digits": delivered_codes[0]},
    )

    assert verified.status_code == 200
    text = spoken_text(verified)
    assert "demonstration data" in text
    assert "No bank-verified received amount is available" in text
    assert store.one(
        "SELECT verified_user_id FROM voice_call_sessions WHERE call_sid=?",
        (call_sid,),
    )["verified_user_id"] == "user-farmer-1"


def test_grievance_is_written_only_after_explicit_confirmation(voice_client, monkeypatch):
    client, settings = voice_client
    call_sid = "CA" + "5" * 32
    delivered_codes: list[str] = []
    monkeypatch.setattr(
        "app.services.voice.send_voice_otp",
        lambda settings, to_number, code, language: delivered_codes.append(code),
    )
    start_call(client, settings, call_sid, language_digit="2")

    signed_post(
        client,
        settings,
        "/api/v1/voice/process",
        {"CallSid": call_sid, "Digits": "6", "From": "+919876543210"},
    )
    signed_post(
        client,
        settings,
        "/api/v1/voice/verify",
        {"CallSid": call_sid, "Digits": delivered_codes[0]},
    )
    drafted = signed_post(
        client,
        settings,
        "/api/v1/voice/process",
        {
            "CallSid": call_sid,
            "SpeechResult": "My PM-KISAN payment is missing, please help.",
            "Confidence": "0.9",
        },
    )
    before_confirmation = store.one(
        "SELECT COUNT(*) AS count FROM grievances WHERE farmer_id=?",
        ("user-farmer-1",),
    )["count"]

    assert drafted.status_code == 200
    assert "Press 1 to confirm" in spoken_text(drafted)
    assert before_confirmation == 1

    submitted = signed_post(
        client,
        settings,
        "/api/v1/voice/process",
        {"CallSid": call_sid, "Digits": "1"},
    )
    after_confirmation = store.one(
        "SELECT COUNT(*) AS count FROM grievances WHERE farmer_id=?",
        ("user-farmer-1",),
    )["count"]

    assert submitted.status_code == 200
    assert "demonstration grievance reference" in spoken_text(submitted)
    assert after_confirmation == before_confirmation + 1


def test_callback_is_saved_and_audited_only_after_confirmation(voice_client, monkeypatch):
    client, settings = voice_client
    call_sid = "CA" + "b" * 32
    delivered_codes: list[str] = []
    monkeypatch.setattr(
        "app.services.voice.send_voice_otp",
        lambda settings, to_number, code, language: delivered_codes.append(code),
    )
    start_call(client, settings, call_sid, language_digit="2")

    requested = signed_post(
        client,
        settings,
        "/api/v1/voice/process",
        {"CallSid": call_sid, "Digits": "7", "From": "+919876543210"},
    )
    verified = signed_post(
        client,
        settings,
        "/api/v1/voice/verify",
        {"CallSid": call_sid, "Digits": delivered_codes[0]},
    )
    drafted = signed_post(
        client,
        settings,
        "/api/v1/voice/process",
        {
            "CallSid": call_sid,
            "SpeechResult": "Please call me about my missing payment.",
            "Confidence": "0.91",
        },
    )
    before_confirmation = store.one(
        "SELECT COUNT(*) AS count FROM voice_escalations WHERE call_sid=?",
        (call_sid,),
    )["count"]
    submitted = signed_post(
        client,
        settings,
        "/api/v1/voice/process",
        {"CallSid": call_sid, "Digits": "1"},
    )
    escalation = store.one(
        "SELECT farmer_id,reason,status FROM voice_escalations WHERE call_sid=?",
        (call_sid,),
    )
    audit_record = store.one(
        """
        SELECT actor_id,action FROM audit_logs
        WHERE entity_type='voice_escalation' AND entity_id=(
          SELECT id FROM voice_escalations WHERE call_sid=?
        )
        """,
        (call_sid,),
    )

    assert requested.status_code == 200
    assert verified.status_code == 200
    assert "Press 1 to confirm" in spoken_text(drafted)
    assert before_confirmation == 0
    assert submitted.status_code == 200
    assert escalation == {
        "farmer_id": "user-farmer-1",
        "reason": "farmer_requested_callback",
        "status": "pending",
    }
    assert audit_record == {
        "actor_id": "user-farmer-1",
        "action": "voice_escalation.created",
    }


def test_call_status_callback_records_bounded_duration(voice_client):
    client, settings = voice_client
    call_sid = "CA" + "6" * 32
    start_call(client, settings, call_sid)

    completed = signed_post(
        client,
        settings,
        "/api/v1/voice/status",
        {"CallSid": call_sid, "CallStatus": "completed", "CallDuration": "42"},
    )
    oversized = signed_post(
        client,
        settings,
        "/api/v1/voice/status",
        {"CallSid": call_sid, "CallStatus": "completed", "CallDuration": "999999"},
    )
    session = store.one(
        "SELECT call_status,duration_seconds FROM voice_call_sessions WHERE call_sid=?",
        (call_sid,),
    )

    assert completed.status_code == 204
    assert oversized.status_code == 204
    assert session == {"call_status": "completed", "duration_seconds": 42}


def test_farmer_escalations_are_private_and_officer_queue_is_role_gated(voice_client):
    client, _ = voice_client
    store.execute(
        "INSERT INTO users(id,mobile_number,full_name,role) VALUES(?,?,?,?)",
        ("user-farmer-other", "9876543211", "Other Farmer", "farmer"),
    )
    store.execute(
        "INSERT INTO voice_call_sessions(call_sid,verified_user_id) VALUES(?,?)",
        ("CA" + "c" * 32, "user-farmer-1"),
    )
    store.execute(
        "INSERT INTO voice_call_sessions(call_sid,verified_user_id) VALUES(?,?)",
        ("CA" + "d" * 32, "user-farmer-other"),
    )
    store.execute(
        """
        INSERT INTO voice_escalations
          (id,call_sid,farmer_id,reason,summary,preferred_language)
        VALUES(?,?,?,?,?,?)
        """,
        (
            "escalation-own",
            "CA" + "7" * 32,
            "user-farmer-1",
            "callback",
            "Farmer requested a call.",
            "hi",
        ),
    )
    store.execute(
        """
        INSERT INTO voice_escalations
          (id,call_sid,farmer_id,reason,summary,preferred_language)
        VALUES(?,?,?,?,?,?)
        """,
        (
            "escalation-other",
            "CA" + "8" * 32,
            "user-farmer-other",
            "callback",
            "Different farmer request.",
            "hi",
        ),
    )

    farmer_login = client.post("/api/v1/auth/demo-login", json={"role": "farmer"})
    assert farmer_login.status_code == 200
    farmer_token = farmer_login.json()["data"]["accessToken"]
    own_items = client.get(
        "/api/v1/voice/my-escalations",
        headers={"Authorization": f"Bearer {farmer_token}"},
    )
    own_calls = client.get(
        "/api/v1/voice/calls",
        headers={"Authorization": f"Bearer {farmer_token}"},
    )
    forbidden = client.get(
        "/api/v1/voice/officer/escalations",
        headers={"Authorization": f"Bearer {farmer_token}"},
    )
    assert [item["id"] for item in own_items.json()["data"]] == ["escalation-own"]
    assert [item["call_sid"] for item in own_calls.json()["data"]] == [
        "CA" + "c" * 32
    ]
    assert forbidden.status_code == 403

    officer_login = client.post("/api/v1/auth/demo-login", json={"role": "officer"})
    officer_token = officer_login.json()["data"]["accessToken"]
    queue = client.get(
        "/api/v1/voice/officer/escalations",
        headers={"Authorization": f"Bearer {officer_token}"},
    )
    assert queue.status_code == 200
    assert {item["id"] for item in queue.json()["data"]} == {
        "escalation-own",
        "escalation-other",
    }


def test_officer_escalation_status_transitions_are_audited_and_idempotent(voice_client):
    client, _ = voice_client
    store.execute(
        """
        INSERT INTO voice_escalations
          (id,call_sid,farmer_id,reason,summary,preferred_language)
        VALUES(?,?,?,?,?,?)
        """,
        (
            "escalation-transition",
            "CA" + "a" * 32,
            "user-farmer-1",
            "callback",
            "Farmer requested a call.",
            "hi",
        ),
    )
    officer_login = client.post("/api/v1/auth/demo-login", json={"role": "officer"})
    officer_token = officer_login.json()["data"]["accessToken"]
    headers = {"Authorization": f"Bearer {officer_token}"}

    assigned = client.post(
        "/api/v1/voice/officer/escalations/escalation-transition/status",
        json={"status": "assigned"},
        headers=headers,
    )
    repeated = client.post(
        "/api/v1/voice/officer/escalations/escalation-transition/status",
        json={"status": "assigned"},
        headers=headers,
    )
    invalid_jump = client.post(
        "/api/v1/voice/officer/escalations/escalation-transition/status",
        json={"status": "closed"},
        headers=headers,
    )
    row = store.one(
        "SELECT status,assigned_officer FROM voice_escalations WHERE id=?",
        ("escalation-transition",),
    )
    audits = store.one(
        """
        SELECT COUNT(*) AS count FROM audit_logs
        WHERE entity_type='voice_escalation' AND entity_id=?
        """,
        ("escalation-transition",),
    )

    assert assigned.status_code == 200
    assert repeated.status_code == 200
    assert invalid_jump.status_code == 409
    assert row == {"status": "assigned", "assigned_officer": "user-officer-1"}
    assert audits["count"] == 1


def test_duration_column_is_added_to_existing_voice_call_table(tmp_path, monkeypatch):
    database_path = tmp_path / "existing.sqlite3"
    with sqlite3.connect(database_path) as connection:
        connection.execute(
            """
            CREATE TABLE voice_call_sessions (
              call_sid TEXT PRIMARY KEY,
              verified_user_id TEXT,
              started_at TEXT,
              invalid_attempts INTEGER NOT NULL DEFAULT 0,
              policy_query_count INTEGER NOT NULL DEFAULT 0
            )
            """
        )
        connection.execute(
            "INSERT INTO voice_call_sessions(call_sid,verified_user_id,started_at) VALUES(?,?,?)",
            ("CA" + "9" * 32, "user-farmer-1", "2025-01-01T00:00:00+00:00"),
        )

    settings = Settings(database_path=str(database_path))
    monkeypatch.setattr(store, "get_settings", lambda: settings)
    store.initialize_database()

    with sqlite3.connect(database_path) as connection:
        columns = {row[1] for row in connection.execute("PRAGMA table_info(voice_call_sessions)")}
        duration = connection.execute(
            "SELECT duration_seconds FROM voice_call_sessions WHERE call_sid=?",
            ("CA" + "9" * 32,),
        ).fetchone()[0]

    assert "duration_seconds" in columns
    assert duration is None
