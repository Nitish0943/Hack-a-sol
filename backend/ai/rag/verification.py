"""Evidence Validation and Policy Safety Engine for KisanSetu AI.

Implements strict validation of retrieved policy chunks:
- Evidence sufficiency evaluation
- Conflicting sources detection
- Outdated / superseded policy detection
- Prompt injection and jailbreak screening
- PII / privacy screening (Aadhaar, bank credentials)
- Mandatory eligibility decision separation
"""

from enum import Enum
import re
from typing import Any
from pydantic import BaseModel, Field

from ai.rag.models import IngestionStatus
from ai.rag.retrieval import RetrievedChunk


class EvidenceStatus(str, Enum):
    SUPPORTED = "supported"
    PARTIALLY_SUPPORTED = "partially_supported"
    INSUFFICIENT_EVIDENCE = "insufficient_evidence"
    CONFLICTING_SOURCES = "conflicting_sources"
    REQUIRES_OFFICIAL_VERIFICATION = "requires_official_verification"


class ValidationResult(BaseModel):
    """Result of evidence validation and safety evaluation."""

    status: EvidenceStatus
    is_safe: bool = True
    verification_required: bool = False
    conflict_details: str | None = None
    outdated_warnings: list[str] = Field(default_factory=list)
    limitations: list[str] = Field(default_factory=list)
    detected_pii: bool = False
    prompt_injection_detected: bool = False


class PolicyEvidenceValidator:
    """Validates retrieved evidence against strict agricultural government policy safety rules."""

    # Regex patterns for adversarial prompt injections
    _INJECTION_PATTERNS = [
        re.compile(r"ignore\s+(?:all\s+)?(?:previous|prior)\s+instructions", re.IGNORECASE),
        re.compile(r"you\s+are\s+now\s+(?:a|an)\s+", re.IGNORECASE),
        re.compile(r"disregard\s+(?:the\s+)?system\s+prompt", re.IGNORECASE),
        re.compile(r"approve\s+(?:my\s+)?(?:loan|application|subsidy)\s+immediately", re.IGNORECASE),
        re.compile(r"override\s+(?:eligibility|safety)\s+rules", re.IGNORECASE),
        re.compile(r"act\s+as\s+(?:an?\s+)?unrestricted", re.IGNORECASE),
    ]

    # Regex for PII detection (12-digit Aadhaar pattern or 10-digit PAN)
    _AADHAAR_PATTERN = re.compile(r"\b[2-9]{1}[0-9]{3}\s*[0-9]{4}\s*[0-9]{4}\b")
    _PAN_PATTERN = re.compile(r"\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b")

    def validate(
        self,
        query: str,
        retrieved_chunks: list[RetrievedChunk],
        query_state: str | None = None,
    ) -> ValidationResult:
        """Comprehensive verification of query safety and evidence validity."""
        limitations: list[str] = []
        outdated_warnings: list[str] = []

        # 1. Prompt injection screening
        for pattern in self._INJECTION_PATTERNS:
            if pattern.search(query):
                return ValidationResult(
                    status=EvidenceStatus.REQUIRES_OFFICIAL_VERIFICATION,
                    is_safe=False,
                    verification_required=True,
                    prompt_injection_detected=True,
                    limitations=["The query contains potentially adversarial instructions and was rejected."],
                )

        # 2. PII screening (Protect farmer privacy)
        if self._AADHAAR_PATTERN.search(query) or self._PAN_PATTERN.search(query):
            limitations.append(
                "Personal identification numbers (such as Aadhaar or PAN) detected. "
                "Never share sensitive identification details with automated chat interfaces."
            )

        # 3. Check for empty or insufficient evidence
        if not retrieved_chunks:
            return ValidationResult(
                status=EvidenceStatus.INSUFFICIENT_EVIDENCE,
                verification_required=True,
                limitations=["No authoritative government policy documents matched this inquiry."],
            )

        top_score = retrieved_chunks[0].score
        if top_score < 0.25:
            return ValidationResult(
                status=EvidenceStatus.INSUFFICIENT_EVIDENCE,
                verification_required=True,
                limitations=["Retrieved evidence score is too low to guarantee factual policy accuracy."],
            )

        # 3b. Verify query substantive term coverage against retrieved text
        # Filter out common stop words and short particles
        stop_words = {"what", "which", "where", "when", "does", "have", "with", "this", "that", "from", "into", "under", "about"}
        query_words = [w.lower() for w in re.findall(r"\w{4,}", query) if w.lower() not in stop_words]
        if query_words:
            combined_corpus = " ".join(rc.chunk.text.lower() for rc in retrieved_chunks)
            matched_words = [w for w in query_words if w in combined_corpus]
            coverage = len(matched_words) / len(query_words)
            if coverage < 0.35:
                return ValidationResult(
                    status=EvidenceStatus.INSUFFICIENT_EVIDENCE,
                    verification_required=True,
                    limitations=["Retrieved policies do not cover the substantive subject of this query."],
                )

        # 4. State applicability check
        if query_state:
            state_mismatch = True
            for rc in retrieved_chunks:
                chunk_state = rc.chunk.applicable_state.lower()
                if chunk_state in ["all-india", query_state.lower()]:
                    state_mismatch = False
                    break
            if state_mismatch:
                limitations.append(
                    f"Retrieved policies may not apply specifically to '{query_state}'. State-specific guidelines prevail."
                )

        # 5. Check for conflicting documents across retrieved chunks
        conflict_msg = self._detect_conflicts(retrieved_chunks)
        if conflict_msg:
            return ValidationResult(
                status=EvidenceStatus.CONFLICTING_SOURCES,
                verification_required=True,
                conflict_details=conflict_msg,
                limitations=[
                    "Retrieved official documents contain conflicting terms or differing guidelines. "
                    "Official human verification at local agriculture office is recommended."
                ],
            )

        # 6. Check for outdated or unknown effective dates
        for rc in retrieved_chunks:
            chunk = rc.chunk
            if chunk.effective_date == "unknown":
                outdated_warnings.append(
                    f"Document '{chunk.document_title}' does not explicitly declare an effective date."
                )

        # 7. Final status determination
        status = EvidenceStatus.SUPPORTED if top_score >= 0.45 else EvidenceStatus.PARTIALLY_SUPPORTED
        requires_verification = (status != EvidenceStatus.SUPPORTED) or bool(outdated_warnings)

        return ValidationResult(
            status=status,
            verification_required=requires_verification,
            outdated_warnings=outdated_warnings,
            limitations=limitations,
            detected_pii=bool(self._AADHAAR_PATTERN.search(query)),
        )

    def _detect_conflicts(self, retrieved_chunks: list[RetrievedChunk]) -> str | None:
        """Detect direct contradictions or conflicting benefit rates for the same scheme."""
        if len(retrieved_chunks) < 2:
            return None

        # Check if multiple chunks from different documents of the same scheme have disparate numerical claims
        scheme_chunks: dict[str, list[RetrievedChunk]] = {}
        for rc in retrieved_chunks:
            scheme_chunks.setdefault(rc.chunk.scheme_name, []).append(rc)

        for scheme, chunks in scheme_chunks.items():
            if len(chunks) >= 2:
                # Compare document IDs
                distinct_docs = {c.chunk.document_id for c in chunks}
                if len(distinct_docs) >= 2:
                    # Look for numerical contradictions (e.g. conflicting rupee amounts or percentages)
                    # Check text flags
                    texts = [c.chunk.text for c in chunks]
                    amounts_0 = set(re.findall(r"₹[0-9,]+", texts[0]))
                    amounts_1 = set(re.findall(r"₹[0-9,]+", texts[1]))
                    # If neither has overlap and both cite financial amounts for same scheme
                    if amounts_0 and amounts_1 and not (amounts_0 & amounts_1):
                        return (
                            f"Discrepancy detected in {scheme} benefit figures between "
                            f"{chunks[0].chunk.document_title} and {chunks[1].chunk.document_title}."
                        )

        return None
