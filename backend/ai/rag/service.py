"""Integration Service Interface for KrishiSetu AI RAG.

Provides a clean, strongly-typed facade for the FastAPI backend or IVR channel
to query policy documentation without tightly coupling to internal RAG details.
"""

from pathlib import Path
from typing import Any
from pydantic import BaseModel, Field

from ai.rag.citations import Citation
from ai.rag.config import IngestionConfig
from ai.rag.generation import GroundedAnswerGenerator, ResponseStyle
from ai.rag.llm.provider import LLMProvider, get_llm_provider
from ai.rag.retrieval import PolicyRetrievalEngine
from ai.rag.verification import EvidenceStatus


class FarmerQueryRequest(BaseModel):
    """Request schema for farmer policy inquiries."""

    question: str = Field(..., min_length=2, description="Farmer inquiry in English or Hindi")
    language: str = Field(default="auto", description="Preferred response language ('en', 'hi', or 'auto')")
    state: str | None = Field(default=None, description="Optional state (e.g. 'Chhattisgarh')")
    scheme_name: str | None = Field(default=None, description="Optional scheme filter (e.g. 'PM-KISAN')")
    response_style: ResponseStyle = Field(default=ResponseStyle.DETAILED, description="DETAILED for web or IVR for voice")


class FarmerQueryResponse(BaseModel):
    """Response schema returned to the caller."""

    answer: str = Field(..., description="Evidence-grounded policy answer")
    ivr_summary: str | None = Field(default=None, description="Concise, voice-friendly summary for IVR channel")
    language: str = Field(..., description="Resolved response language ('en' or 'hi')")
    scheme_name: str | None = Field(default=None, description="Identified scheme")
    answer_status: str = Field(..., description="'answered', 'abstained', 'conflict_detected', or 'error'")
    evidence_status: EvidenceStatus
    citations: list[Citation] = Field(default_factory=list, description="Verified source citations with page references")
    important_conditions: list[str] = Field(default_factory=list, description="Key policy conditions and exclusions")
    verification_required: bool = Field(default=False, description="Flag indicating human/official verification is required")
    limitations: list[str] = Field(default_factory=list, description="Policy limitations, date warnings, or disclaimers")
    eligibility_disclaimer: str = Field(
        default=(
            "KrishiSetu AI provides official policy guidance only and does not make binding eligibility decisions. "
            "Formal eligibility verification must be conducted through designated government authorities."
        ),
        description="Mandatory boundary disclaimer regarding official eligibility approval",
    )


class KrishiSetuRAGService:
    """Production service facade unifying retrieval, evidence verification, and grounded generation."""

    def __init__(
        self,
        config: IngestionConfig | None = None,
        retrieval_engine: PolicyRetrievalEngine | None = None,
        llm_provider: LLMProvider | None = None,
        chunks_file: Path | str | None = None,
    ) -> None:
        self.config = config or IngestionConfig()
        self.retrieval_engine = retrieval_engine or PolicyRetrievalEngine(config=self.config)
        self.llm_provider = llm_provider or get_llm_provider()
        self.generator = GroundedAnswerGenerator(provider=self.llm_provider)

        # Initialize retrieval index from saved chunks if file provided
        if chunks_file:
            self.load_index(chunks_file)
        else:
            default_chunks = Path(__file__).resolve().parent / "output" / "policy_chunks.jsonl"
            if default_chunks.exists():
                self.load_index(default_chunks)

    def load_index(self, jsonl_path: Path | str) -> int:
        """Load and index policy chunks from file."""
        return self.retrieval_engine.load_chunks_from_jsonl(jsonl_path)

    def query(self, request: FarmerQueryRequest) -> FarmerQueryResponse:
        """Process farmer question end-to-end and return validated structured response."""
        # Step 1: Hybrid retrieval
        retrieved_chunks = self.retrieval_engine.search(
            query=request.question,
            top_k=4,
            state=request.state,
            scheme_filter=request.scheme_name,
        )

        # Step 2: Grounded generation & evidence validation
        raw_result = self.generator.generate_response(
            question=request.question,
            retrieved_chunks=retrieved_chunks,
            state=request.state,
            style=request.response_style,
        )

        # Step 3: Map citations to models
        citations = [Citation(**c) if isinstance(c, dict) else c for c in raw_result.get("citations", [])]

        return FarmerQueryResponse(
            answer=raw_result["answer"],
            ivr_summary=raw_result.get("ivr_summary"),
            language=raw_result["language"],
            scheme_name=raw_result.get("scheme_name"),
            answer_status=raw_result["answer_status"],
            evidence_status=raw_result["evidence_status"],
            citations=citations,
            important_conditions=raw_result.get("important_conditions", []),
            verification_required=raw_result.get("verification_required", False),
            limitations=raw_result.get("limitations", []),
        )


# Backward-compatible alias
KisanSetuRAGService = KrishiSetuRAGService
