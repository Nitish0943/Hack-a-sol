"""Citation Engine for KisanSetu AI.

Constructs strict, verifiable citations directly from retrieved chunk metadata.
Prevents fabricated citations, arbitrary URLs, or hallucinated page numbers.
"""

from typing import Any
from pydantic import BaseModel, Field

from ai.rag.models import IngestionStatus
from ai.rag.retrieval import RetrievedChunk


class Citation(BaseModel):
    """Structured, verifiable citation to an official government document."""

    document_title: str = Field(..., description="Official title of cited document")
    scheme_name: str = Field(..., description="Official scheme name")
    issuing_department: str = Field(..., description="Ministry or department")
    page_reference: str = Field(..., description="Exact page or page range (e.g. 'Page 1', 'Pages 1-2')")
    page_start: int | None = Field(default=None)
    page_end: int | None = Field(default=None)
    source_url: str = Field(..., description="Official portal URL where document is published")
    publication_date: str | None = Field(default=None)
    effective_date: str | None = Field(default=None)
    verification_status: IngestionStatus = Field(default=IngestionStatus.EXTRACTED)
    relevance_rank: int = Field(default=1)


class CitationEngine:
    """Builds and deduplicates citations derived strictly from retrieved evidence chunks."""

    @staticmethod
    def build_citations(retrieved_chunks: list[RetrievedChunk]) -> list[Citation]:
        """Construct structured citations from verified retrieved chunks without inventing references."""
        citations: list[Citation] = []
        seen_keys: set[tuple[str, int, int]] = set()

        for rc in retrieved_chunks:
            chunk = rc.chunk

            # Page reference formatting
            if chunk.page_start is not None and chunk.page_end is not None:
                if chunk.page_start == chunk.page_end:
                    page_ref = f"Page {chunk.page_start}"
                else:
                    page_ref = f"Pages {chunk.page_start}–{chunk.page_end}"
            else:
                page_ref = "Page reference unavailable"

            key = (chunk.document_id, chunk.page_start, chunk.page_end)
            if key in seen_keys:
                continue
            seen_keys.add(key)

            # Issuing department fallback if not in chunk
            issuing_dept = "Ministry / Department of Agriculture"
            if "cg-" in chunk.document_id or "chhattisgarh" in chunk.applicable_state.lower():
                issuing_dept = "Department of Agriculture Development and Farmer Welfare, Government of Chhattisgarh"
            elif "pm-kisan" in chunk.document_id or "pmfby" in chunk.document_id:
                issuing_dept = "Ministry of Agriculture and Farmers Welfare, Government of India"

            citations.append(
                Citation(
                    document_title=chunk.document_title,
                    scheme_name=chunk.scheme_name,
                    issuing_department=issuing_dept,
                    page_reference=page_ref,
                    page_start=chunk.page_start,
                    page_end=chunk.page_end,
                    source_url=chunk.source_url,
                    publication_date=chunk.publication_date,
                    effective_date=chunk.effective_date,
                    verification_status=chunk.verification_status,
                    relevance_rank=rc.rank,
                )
            )

        return citations
