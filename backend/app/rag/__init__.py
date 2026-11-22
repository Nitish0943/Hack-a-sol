"""KrishiSetu AI RAG module integration for FastAPI."""

from ai.rag.citations import Citation, CitationEngine
from ai.rag.config import IngestionConfig
from ai.rag.generation import GroundedAnswerGenerator, QueryCategory, ResponseStyle
from ai.rag.models import (
    DocumentChunk,
    DocumentMetadata,
    DocumentType,
    ExtractedPage,
    ExtractionResult,
    GovernmentLevel,
    IngestionStatus,
)
from ai.rag.retrieval import PolicyRetrievalEngine, RetrievedChunk
from ai.rag.service import (
    FarmerQueryRequest,
    FarmerQueryResponse,
    KisanSetuRAGService,
    KrishiSetuRAGService,
)
from ai.rag.verification import EvidenceStatus, PolicyEvidenceValidator, ValidationResult

__all__ = [
    "KrishiSetuRAGService",
    "KisanSetuRAGService",
    "FarmerQueryRequest",
    "FarmerQueryResponse",
    "ResponseStyle",
    "IngestionConfig",
    "PolicyRetrievalEngine",
    "RetrievedChunk",
    "GroundedAnswerGenerator",
    "QueryCategory",
    "CitationEngine",
    "Citation",
    "PolicyEvidenceValidator",
    "ValidationResult",
    "EvidenceStatus",
    "DocumentMetadata",
    "DocumentChunk",
    "ExtractedPage",
    "ExtractionResult",
    "GovernmentLevel",
    "DocumentType",
    "IngestionStatus",
]
