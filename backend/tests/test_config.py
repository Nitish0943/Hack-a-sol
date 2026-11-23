from app.core.config import Settings


def test_twilio_webhook_url_falls_back_to_public_base_url(monkeypatch):
    monkeypatch.delenv("TWILIO_WEBHOOK_PUBLIC_URL", raising=False)
    monkeypatch.setenv("PUBLIC_BASE_URL", "https://voice.example.test")

    settings = Settings(_env_file=None)

    assert settings.twilio_webhook_public_url == "https://voice.example.test"


def test_twilio_webhook_url_prefers_specific_setting(monkeypatch):
    monkeypatch.setenv("TWILIO_WEBHOOK_PUBLIC_URL", "https://twilio.example.test")
    monkeypatch.setenv("PUBLIC_BASE_URL", "https://generic.example.test")

    settings = Settings(_env_file=None)

    assert settings.twilio_webhook_public_url == "https://twilio.example.test"
