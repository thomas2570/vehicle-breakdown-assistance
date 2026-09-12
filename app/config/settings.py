from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application configuration loaded from environment variables
    and the .env file.
    """

    app_name: str = "Geo-Intelligent Roadside Assistance API"
    app_version: str = "0.1.0"
    app_env: str = "development"
    debug: bool = True

    host: str = "127.0.0.1"
    port: int = 8000

    database_url: str
    
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 60
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    """
    Return a cached Settings instance.

    Caching prevents repeatedly loading configuration
    during the lifetime of the application.
    """
    return Settings()