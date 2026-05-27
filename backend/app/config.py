from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_env: str = "development"
    app_port: int = 8000
    app_secret_key: str = "change-me-in-production"
    frontend_url: str = "http://localhost:3000"

    supabase_url: str
    supabase_anon_key: str
    supabase_service_key: str

    anthropic_api_key: str = ""
    google_api_key: str = ""
    openai_api_key: str = ""

    storage_provider: str = "supabase"
    google_drive_credentials: str = ""

    resend_api_key: str = ""
    email_from: str = "noreply@skillmark.dev"

    skillmark_license_key: str = ""

    log_level: str = "info"
    cors_origins: str = "http://localhost:3000"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]


settings = Settings()  # type: ignore[call-arg]
