"""
ResearchBot Pro - Application Configuration.

Loads settings from environment variables / .env file using pydantic-settings.
All settings gracefully degrade if not configured.
"""

from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # --- Required API Keys (validated at request time, not startup) ---
    OPENAI_API_KEY: str = ""
    SERPER_API_KEY: str = ""

    # --- Supabase ---
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""

    # --- LangSmith (optional observability) ---
    LANGSMITH_API_KEY: Optional[str] = None
    LANGSMITH_PROJECT: str = "researchbot-pro"
    LANGSMITH_TRACING_V2: bool = True

    # --- Retry / resilience ---
    MAX_RETRIES: int = 3
    RETRY_BASE_DELAY: float = 1.0

    @property
    def supabase_configured(self) -> bool:
        """Return True if Supabase credentials are present."""
        return bool(self.SUPABASE_URL and self.SUPABASE_KEY)

    @property
    def langsmith_configured(self) -> bool:
        """Return True if LangSmith credentials are present."""
        return bool(self.LANGSMITH_API_KEY)

    @property
    def openai_configured(self) -> bool:
        """Return True if OpenAI API key is present."""
        return bool(self.OPENAI_API_KEY)

    @property
    def serper_configured(self) -> bool:
        """Return True if Serper API key is present."""
        return bool(self.SERPER_API_KEY)


# Module-level singleton – imported by other modules.
settings = Settings()
