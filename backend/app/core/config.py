"""
Application configuration and settings
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables
    """
    
    # Database
    DATABASE_URL: str
    
    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Google OAuth
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GOOGLE_SERVICE_ACCOUNT_PATH: str
    
    # Google Sheets
    GOOGLE_SHEETS_ID: str
    
    # Apollo.io
    APOLLO_API_KEY: str
    
    # AI Configuration
    OPENAI_API_KEY: str = ""
    GOOGLE_AI_API_KEY: str = ""
    
    # Email Configuration (SMTP)
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = ""
    SMTP_FROM_NAME: str = "AgenciaOps"
    SMTP_USE_TLS: bool = True
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:5000"
    
    # Environment
    ENVIRONMENT: str = "development"

    # Feature flags (roles)
    FEATURE_ROLES: bool = False
    FEATURE_ROLES_ENFORCE: bool = False
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Create settings instance
settings = Settings()


