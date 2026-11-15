# backend/app/core/config.py
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:///./surveillance.db"
    jwt_secret: str = "change-me"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440
    cors_origins: str = "http://localhost:3000"

    # Asymmetric JWT provider (Supabase / Clerk / Auth0)
    supabase_url: str = ""
    supabase_jwt_aud: str = "authenticated"

    model_config = {
        "env_file": ".env",
        "extra": "ignore",
        "case_sensitive": False,   # DATABASE_URL in .env → database_url field
    }


settings = Settings()