"""Policy-Aware Semantic Chunker for KisanSetu AI.

Splits extracted government documents into semantically coherent policy chunks,
preserving numbered conditions, exclusions, eligibility rules, and source metadata.
"""

import logging
import re
from typing import Any
import tiktoken

from ai.rag.cleaner import PolicyTextCleaner
from ai.rag.config import IngestionConfig
from ai.rag.models import (
    DocumentChunk,
    DocumentMetadata,
    ExtractionResult,
    IngestionStatus,
)

logger = logging.getLogger(__name__)


class PolicySemanticChunker:
    """Splits policy documents along natural semantic boundaries (sections, paragraphs, clauses)."""

    def __init__(self, config: IngestionConfig | None = None) -> None:
        self.config = config or IngestionConfig()
        self.cleaner = PolicyTextCleaner()

        # Initialize tokenizer for precise token boundary measurement
        try:
            self._tokenizer = tiktoken.get_encoding(self.config.tokenizer_encoding)
        except Exception:
            logger.warning("Failed to load %s tokenizer. Using fallback.", self.config.tokenizer_encoding)
            self._tokenizer = None

        # Regex for identifying section headings or numbered clauses
        self._heading_re = re.compile(
            r"^(?:(?:Section|Clause|Paragraph|Part|Chapter)\s+\d+|[0-9]{1,2}\.[0-9]{0,2}|[A-Z\s]{4,}:)",
            re.MULTILINE,
        )
        self._list_item_re = re.compile(
            r"^(?:[0-9]{1,2}\.|\([a-z0-9ivx]+\)|[ivx]+\.)\s+",
            re.MULTILINE | re.IGNORECASE,
        )

    def count_tokens(self, text: str) -> int:
        """Accurately count tokens using tiktoken, with deterministic fallback."""
        if self._tokenizer is not None:
            return len(self._tokenizer.encode(text))
        # Rule of thumb fallback for English/Devanagari if tokenizer is unavailable
        return max(1, len(text) // 4)

    def chunk_document(
        self,
        metadata: DocumentMetadata,
        extraction_result: ExtractionResult,
    ) -> list[DocumentChunk]:
        """Convert extracted pages into source-traceable semantic chunks."""
        if extraction_result.extraction_status == IngestionStatus.EXTRACTION_FAILED:
            logger.warning("Cannot chunk document with failed extraction: %s", metadata.document_id)
            return []

        # Step 1: Collect page blocks with page number attribution
        page_blocks: list[dict[str, Any]] = []
        for page in extraction_result.extracted_pages:
            if not page.cleaned_text:
                continue

            # Split page text into structural paragraphs
            paragraphs = [p.strip() for p in page.cleaned_text.split("\n\n") if p.strip()]
            for p in paragraphs:
                page_blocks.append({
                    "text": p,
                    "page_number": page.page_number,
                    "tokens": self.count_tokens(p),
                    "is_heading": bool(self._heading_re.match(p)),
                    "has_eligibility": self.cleaner.contains_eligibility_signal(p),
                })

        if not page_blocks:
            logger.warning("No text blocks found to chunk for: %s", metadata.document_id)
            return []

        # Step 2: Assemble blocks into chunks within target token bounds
        chunks: list[DocumentChunk] = []
        current_blocks: list[dict[str, Any]] = []
        current_tokens = 0
        current_heading: str | None = None
        chunk_idx = 0

        i = 0
        while i < len(page_blocks):
            block = page_blocks[i]
            block_tokens = block["tokens"]

            if block["is_heading"]:
                current_heading = block["text"].splitlines()[0][:100]

            # If adding this block exceeds max_chunk_size and we already have sufficient content
            if current_tokens + block_tokens > self.config.max_chunk_size and current_tokens >= self.config.min_chunk_size:
                # Emit current chunk
                chunk = self._build_chunk(
                    chunk_index=chunk_idx,
                    metadata=metadata,
                    blocks=current_blocks,
                    heading=current_heading,
                )
                chunks.append(chunk)
                chunk_idx += 1

                # Calculate overlap blocks to carry over
                overlap_blocks = []
                overlap_tokens = 0
                for prev_block in reversed(current_blocks):
                    if overlap_tokens + prev_block["tokens"] <= self.config.chunk_overlap:
                        overlap_blocks.insert(0, prev_block)
                        overlap_tokens += prev_block["tokens"]
                    else:
                        break

                current_blocks = overlap_blocks
                current_tokens = overlap_tokens

            # Add current block
            current_blocks.append(block)
            current_tokens += block_tokens
            i += 1

        # Emit final remaining chunk
        if current_blocks:
            chunk = self._build_chunk(
                chunk_index=chunk_idx,
                metadata=metadata,
                blocks=current_blocks,
                heading=current_heading,
            )
            chunks.append(chunk)

        logger.info(
            "Created %d chunks for document '%s' (pages %d-%d)",
            len(chunks),
            metadata.document_id,
            1,
            extraction_result.total_pages,
        )
        return chunks

    def _build_chunk(
        self,
        chunk_index: int,
        metadata: DocumentMetadata,
        blocks: list[dict[str, Any]],
        heading: str | None,
    ) -> DocumentChunk:
        """Construct a validated DocumentChunk with complete metadata and page bounds."""
        chunk_text = "\n\n".join(b["text"] for b in blocks)
        page_numbers = [b["page_number"] for b in blocks]
        page_start = min(page_numbers)
        page_end = max(page_numbers)
        token_count = self.count_tokens(chunk_text)
        contains_eligibility = any(b["has_eligibility"] for b in blocks)

        chunk_id = f"{metadata.document_id}_c{chunk_index:03d}"

        return DocumentChunk(
            chunk_id=chunk_id,
            document_id=metadata.document_id,
            scheme_name=metadata.scheme_name,
            government_level=metadata.government_level,
            applicable_state=metadata.applicable_state,
            source_url=metadata.source_url,
            document_title=metadata.document_title,
            page_start=page_start,
            page_end=page_end,
            publication_date=metadata.publication_date,
            effective_date=metadata.effective_date,
            verification_status=metadata.extraction_status,
            chunk_index=chunk_index,
            token_count=token_count,
            text=chunk_text,
            section_heading=heading,
            contains_eligibility=contains_eligibility,
        )
