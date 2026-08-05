from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    supabase_url: str
    supabase_service_role_key: str
    gemini_api_key: str = ""
    frontend_url: str = "http://localhost:5173"
    pinata_jwt: str = ""


settings = Settings()
