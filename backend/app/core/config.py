from functools import lru_cache
import os

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "KrishiSetu API"
    app_version: str = "1.0.0"
    app_environment: str = "development"
    frontend_origins: str = "http://localhost:3000"
    demo_otp_enabled: bool = True
    demo_login_enabled: bool = Field(
        default=True,
        validation_alias=AliasChoices(
            "ENABLE_DEMO_LOGIN",
            "enable_demo_login",
            "DEMO_LOGIN_ENABLED",
            "demo_login_enabled",
        ),
    )
    demo_otp: str = "123456"
    database_path: str = "./krishisetu.db"

    # KrishiSetu AI RAG settings
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"
    llm_provider: str = "gemini"
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_phone_number: str = ""
    twilio_webhook_public_url: str = Field(
        default="",
        validation_alias=AliasChoices(
            "TWILIO_WEBHOOK_PUBLIC_URL",
            "PUBLIC_BASE_URL",
            "twilio_webhook_public_url",
        ),
    )
    voice_otp_secret: str = ""
    voice_private_data_enabled: bool = False
    default_language: str = "hi"
    voice_session_ttl_seconds: int = 1800
    voice_log_retention_days: int = 30

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        env_prefix="",
        extra="ignore",
    )

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.frontend_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
