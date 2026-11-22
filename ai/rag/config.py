"""Configuration settings for KisanSetu AI RAG Ingestion Pipeline."""

from pathlib import Path
from pydantic import BaseModel, Field


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
        default=Path("ai/rag/data"),
        description="Base directory for policy documents and outputs",
    )
    output_dir: Path = Field(
        default=Path("ai/rag/output"),
        description="Directory for structured chunk output files (JSON/JSONL)",
    )

    # Tokenizer encoding
    tokenizer_encoding: str = Field(
        default="cl100k_base",
        description="Tiktoken encoding name for token measurement",
    )
