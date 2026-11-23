"""Domain models and data schemas for KisanSetu AI Document Ingestion."""

from datetime import date, datetime
from enum import Enum
from pathlib import Path
from typing import Any
from pydantic import BaseModel, Field, HttpUrl, field_validator


class GovernmentLevel(str, Enum):
    CENTRAL = "Central"
    STATE = "State"
    DISTRICT = "District"


class DocumentType(str, Enum):
    OPERATIONAL_GUIDELINES = "Operational Guidelines"
    NOTIFICATION = "Notification"
    CIRCULAR = "Circular"
    POLICY_BRIEF = "Policy Brief"
    FAQS = "Official FAQs"
    APPLICATION_FORM = "Application Guidelines"


class IngestionStatus(str, Enum):
    REGISTERED = "REGISTERED"
    EXTRACTED = "EXTRACTED"
    NEEDS_OCR = "NEEDS_OCR"
    EXTRACTION_FAILED = "EXTRACTION_FAILED"
    VERIFIED = "VERIFIED"


class DocumentMetadata(BaseModel):
    """Metadata registered for an authoritative government policy document."""

    document_id: str = Field(..., description="Unique slug identifier (e.g. 'pm-kisan-guidelines-2024')")
    document_title: str = Field(..., min_length=3, description="Official title of the document")
    scheme_name: str = Field(..., min_length=2, description="Recognized scheme name (e.g. 'PM-KISAN', 'PMFBY')")
    issuing_department: str = Field(..., description="Ministry or Department issuing the policy")
    government_level: GovernmentLevel = Field(..., description="Central or State")
    applicable_state: str = Field(default="All-India", description="State name or 'All-India'")
    document_type: DocumentType = Field(..., description="Type of government document")
    source_url: str = Field(..., description="Official portal URL where document is published")
    publication_date: str | None = Field(default=None, description="Official publication date (YYYY-MM-DD) if available")
    effective_date: str | None = Field(default=None, description="Effective date (YYYY-MM-DD) or 'unknown'")
    verification_date: str = Field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d"))
    local_path: str = Field(..., description="Relative or absolute filesystem path to source PDF")
    extraction_status: IngestionStatus = Field(default=IngestionStatus.REGISTERED)
    notes: str | None = Field(default=None, description="Policy context or verification notes")

    @field_validator("effective_date", mode="before")
    @classmethod
    def validate_effective_date(cls, v: Any) -> str | None:
        if v is None or str(v).strip() == "":
            return "unknown"
        return str(v)


class ExtractedPage(BaseModel):
    """Extracted text and metadata for a single page."""

    page_number: int = Field(..., ge=1, description="1-indexed physical page number")
    raw_text: str = Field(..., description="Raw text extracted from PDF page")
    cleaned_text: str = Field(default="", description="Cleaned, normalized text")
    char_count: int = Field(default=0, ge=0)
    has_text: bool = Field(default=True)
    requires_ocr: bool = Field(default=False)


class ExtractionResult(BaseModel):
    """Overall document extraction result."""

    document_id: str
    total_pages: int
    extracted_pages: list[ExtractedPage]
    total_characters: int
    extraction_status: IngestionStatus
    ocr_needed_pages: list[int] = Field(default_factory=list)
    extraction_timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())
    error_message: str | None = None


class DocumentChunk(BaseModel):
    """Semantic policy chunk ready for vector embedding and retrieval."""

    chunk_id: str = Field(..., description="Unique chunk ID formatted as '<doc_id>_c<idx>'")
    document_id: str
    scheme_name: str
    government_level: GovernmentLevel
    applicable_state: str
    source_url: str
    document_title: str
    page_start: int = Field(..., ge=1, description="Starting page of chunk content")
    page_end: int = Field(..., ge=1, description="Ending page of chunk content")
    publication_date: str | None
    effective_date: str | None
    verification_status: IngestionStatus
    chunk_index: int = Field(..., ge=0)
    token_count: int = Field(..., ge=0)
    text: str = Field(..., min_length=10, description="Cleaned policy text for chunk")
    section_heading: str | None = Field(default=None, description="Detected section heading")
    contains_eligibility: bool = Field(default=False, description="Flag indicating eligibility/exclusion criteria")
