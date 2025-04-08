import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from typing import Optional
from slowapi import Limiter

# Load the .env file if it exists (local development)
if os.path.exists(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")):
    load_dotenv(
        dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
    )


# Global key function for rate limiting across all requests
def global_limit_key(*args, **kwargs):
    return "global"


# Create a rate limiter with global scope
limiter = Limiter(key_func=global_limit_key)


class Settings(BaseSettings):
    # Database settings - Heroku provides DATABASE_URL as an environment variable
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    
    # If DATABASE_URL starts with "postgres://", convert it to "postgresql://"
    # This is needed because SQLAlchemy 1.4.x+ doesn't support "postgres://"
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    
    # For local development
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "")
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "")

    # Only use these if DATABASE_URL is not provided
    if not DATABASE_URL and all([POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_SERVER, POSTGRES_PORT, POSTGRES_DB]):
        DATABASE_URL = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_SERVER}:{POSTGRES_PORT}/{POSTGRES_DB}"

    # JWT settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Gemini API
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    # Upload settings
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB

    # Rate limits
    GEMINI_API_RATE_LIMIT: str = "5/minute;500/day"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()