from functools import lru_cache
import os

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "KrishiSetu API"
    app_version: str = "1.0.0"
    app_environment: str = "development"
    frontend_origins: str = "http://localhost:3000"
    demo_otp_enabled: bool = True
    demo_otp: str = "123456"
    database_path: str = "./krishisetu.db"

    # KrishiSetu AI RAG settings
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"
    llm_provider: str = "gemini"

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
