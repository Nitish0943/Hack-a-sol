"""Configuration settings for KrishiSetu AI RAG Ingestion Pipeline and LLM Services.

Loads environment variables from backend/ai/rag/.env or backend/.env.
Ensures API credentials are never logged or exposed.
"""

import os
from pathlib import Path
from dotenv import find_dotenv, load_dotenv
from pydantic import BaseModel, Field

# Load environment variables securely
_RAG_DIR = Path(__file__).resolve().parent
_BACKEND_DIR = _RAG_DIR.parent.parent
_RAG_ENV = _RAG_DIR / ".env"
_BACKEND_ENV = _BACKEND_DIR / ".env"

if _RAG_ENV.exists():
    load_dotenv(_RAG_ENV, override=False)
elif _BACKEND_ENV.exists():
    load_dotenv(_BACKEND_ENV, override=False)
else:
    _root_env = find_dotenv(usecwd=True)
    if _root_env:
        load_dotenv(_root_env, override=False)

# Sentinel placeholder values that indicate the user hasn't yet pasted a real key
PLACEHOLDER_KEYS = {
    "",
    "paste_your_gemini_api_key_here",
    "your_gemini_api_key_here",
    "none",
    "null",
}


class IngestionConfig(BaseModel):
    """Configurable parameters for policy document extraction, cleaning, and chunking."""

    # Chunking token parameters (Target: 500-800, Overlap: 80-120)
    target_chunk_size: int = Field(default=600, ge=100, le=2000, description="Target chunk size in tokens")
    max_chunk_size: int = Field(default=800, ge=200, le=3000, description="Maximum chunk size in tokens")
    min_chunk_size: int = Field(default=150, ge=50, le=500, description="Minimum chunk size in tokens before merging")
    chunk_overlap: int = Field(default=100, ge=0, le=300, description="Chunk overlap in tokens")

    # Extraction quality thresholds
    min_page_char_count: int = Field(
        default=50,
        ge=0,
        description="Minimum character count to consider a page as containing extractable text",
    )
    scanned_page_threshold_ratio: float = Field(
        default=0.7,
        ge=0.0,
        le=1.0,
        description="Ratio of unextractable pages above which document is flagged as requiring OCR",
    )

    # Storage paths
    data_dir: Path = Field(
        default_factory=lambda: _RAG_DIR / "data",
        description="Base directory for policy documents and outputs",
    )
    output_dir: Path = Field(
        default_factory=lambda: _RAG_DIR / "output",
        description="Directory for structured chunk output files (JSON/JSONL)",
    )

    # Tokenizer encoding
    tokenizer_encoding: str = Field(
        default="cl100k_base",
        description="Tiktoken encoding name for token measurement",
    )

    # LLM Settings
    llm_provider: str = Field(
        default_factory=lambda: os.getenv("LLM_PROVIDER", "gemini").lower(),
        description="Selected LLM provider ('gemini' or 'mock')",
    )
    gemini_model: str = Field(
        default_factory=lambda: os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
        description="Google Gemini model identifier",
    )

    @property
    def gemini_api_key(self) -> str:
        """Retrieve Gemini API key from environment without printing it."""
        return os.getenv("GEMINI_API_KEY", "") or os.getenv("GOOGLE_API_KEY", "")

    def is_gemini_key_configured(self) -> bool:
        """Check whether a non-placeholder Gemini API key is configured in the environment."""
        key = self.gemini_api_key.strip()
        return bool(key) and key.lower() not in PLACEHOLDER_KEYS
