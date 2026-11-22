"""FastAPI Router for KrishiSetu AI Grounded Policy Assistant."""

import logging
from typing import Any
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.rag import (
    FarmerQueryRequest,
    FarmerQueryResponse,
    KrishiSetuRAGService,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/rag", tags=["AI Policy Assistant (KrishiSetu)"])

# Singleton service instance
_service_instance: KrishiSetuRAGService | None = None


def get_rag_service() -> KrishiSetuRAGService:
    """Retrieve or lazily initialize the singleton KrishiSetu RAG service."""
    global _service_instance
    if _service_instance is None:
        try:
            _service_instance = KrishiSetuRAGService()
        except Exception as exc:
            logger.error("Failed to initialize KrishiSetuRAGService: %s", exc)
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="RAG Knowledge Base service is currently initializing or unavailable.",
            )
    return _service_instance


class RAGStatusResponse(BaseModel):
    """Status metadata for the RAG policy assistant."""

    status: str = Field(default="ok")
    service: str = Field(default="KrishiSetu AI RAG")
    indexed_documents: int
    llm_provider: str
    supported_languages: list[str] = Field(default_factory=lambda: ["en", "hi", "chg"])


class IndexedScheme(BaseModel):
    """Metadata for an indexed government agricultural scheme."""

    scheme_name: str
    government_level: str
    applicable_state: str
    document_title: str
    source_url: str


class SchemesListResponse(BaseModel):
    """List of available indexed policies."""

    total_schemes: int
    schemes: list[IndexedScheme]


@router.post(
    "/query",
    response_model=FarmerQueryResponse,
    summary="Query agricultural policies and subsidies",
    description="Submit an agricultural policy question in English, Hindi, or Chhattisgarhi (छत्तीसगढ़ी). Returns evidence-grounded answers with official citations.",
)
async def query_policy(request: FarmerQueryRequest) -> FarmerQueryResponse:
    """Process a farmer's inquiry through the KrishiSetu RAG pipeline in English, Hindi, or Chhattisgarhi."""
    service = get_rag_service()
    try:
        response = service.query(request)
        return response
    except Exception as exc:
        logger.exception("Error processing farmer query: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while generating the policy answer: {type(exc).__name__}",
        )


@router.get(
    "/status",
    response_model=RAGStatusResponse,
    summary="Get RAG service status",
)
async def get_rag_status() -> RAGStatusResponse:
    """Return RAG service health and knowledge base statistics."""
    service = get_rag_service()
    doc_count = len(service.retrieval_engine.chunks)
    provider_name = type(service.llm_provider).__name__

    return RAGStatusResponse(
        status="ok",
        service="KrishiSetu AI RAG",
        indexed_documents=doc_count,
        llm_provider=provider_name,
    )


@router.get(
    "/schemes",
    response_model=SchemesListResponse,
    summary="List indexed government schemes",
)
async def list_indexed_schemes() -> SchemesListResponse:
    """Return all authoritative government policies currently indexed in KrishiSetu."""
    service = get_rag_service()
    seen_schemes = set()
    schemes: list[IndexedScheme] = []

    for chunk in service.retrieval_engine.chunks:
        if chunk.scheme_name not in seen_schemes:
            seen_schemes.add(chunk.scheme_name)
            schemes.append(
                IndexedScheme(
                    scheme_name=chunk.scheme_name,
                    government_level=chunk.government_level.value if hasattr(chunk.government_level, "value") else str(chunk.government_level),
                    applicable_state=chunk.applicable_state,
                    document_title=chunk.document_title,
                    source_url=chunk.source_url,
                )
            )

    return SchemesListResponse(
        total_schemes=len(schemes),
        schemes=schemes,
    )
