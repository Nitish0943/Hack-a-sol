"""Document Ingestion Pipeline for KisanSetu AI.

Coordinates document registration, PDF extraction, cleaning, chunking,
validation, and persistent storage of structured JSON/JSONL artifacts.
"""

from pathlib import Path
import json
import logging
from typing import Any

from ai.rag.chunker import PolicySemanticChunker
from ai.rag.config import IngestionConfig
from ai.rag.extractor import PDFDocumentExtractor
from ai.rag.models import (
    DocumentChunk,
    DocumentMetadata,
    ExtractionResult,
    IngestionStatus,
)

logger = logging.getLogger(__name__)


class PolicyIngestionPipeline:
    """End-to-end pipeline for registering, extracting, and chunking government policy documents."""

    def __init__(self, config: IngestionConfig | None = None) -> None:
        self.config = config or IngestionConfig()
        self.extractor = PDFDocumentExtractor(config=self.config)
        self.chunker = PolicySemanticChunker(config=self.config)
        self.registry: dict[str, DocumentMetadata] = {}

    def register_document(self, metadata: DocumentMetadata) -> None:
        """Register a document with validation against duplicates and missing local files."""
        if metadata.document_id in self.registry:
            raise ValueError(f"Document with ID '{metadata.document_id}' is already registered.")

        file_path = Path(metadata.local_path)
        if not file_path.exists():
            # Attempt resolving relative to RAG sample_policies directory
            rag_dir = Path(__file__).resolve().parent
            alt_path = rag_dir / "sample_policies" / file_path.name
            if alt_path.exists():
                file_path = alt_path
                metadata.local_path = str(file_path)
            else:
                raise FileNotFoundError(
                    f"Source document file does not exist at path: {metadata.local_path}"
                )

        if file_path.suffix.lower() != ".pdf":
            raise ValueError(f"Unsupported file format '{file_path.suffix}'. Only .pdf is supported.")

        self.registry[metadata.document_id] = metadata
        logger.info("Registered policy document: %s (%s)", metadata.document_id, metadata.scheme_name)

    def load_registry_from_file(self, registry_file: Path | str) -> int:
        """Load multiple document registrations from a JSON manifest file."""
        path = Path(registry_file)
        if not path.exists():
            rag_dir = Path(__file__).resolve().parent
            alt = rag_dir / "sample_policies" / path.name
            if alt.exists():
                path = alt
            else:
                raise FileNotFoundError(f"Registry manifest not found at: {path}")

        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)

        count = 0
        documents = data if isinstance(data, list) else data.get("documents", [])
        for doc_dict in documents:
            metadata = DocumentMetadata(**doc_dict)
            self.register_document(metadata)
            count += 1

        logger.info("Loaded %d documents from registry: %s", count, path)
        return count

    def process_document(
        self,
        document_id: str,
    ) -> tuple[ExtractionResult, list[DocumentChunk]]:
        """Run extraction and chunking for a single registered document."""
        if document_id not in self.registry:
            raise KeyError(f"Document '{document_id}' has not been registered in the pipeline.")

        metadata = self.registry[document_id]
        logger.info("Processing document: %s", document_id)

        # Step 1: Extract text page-by-page
        extraction_result = self.extractor.extract(metadata)

        # Update metadata status
        metadata.extraction_status = extraction_result.extraction_status

        # Step 2: Chunk if extraction was successful
        chunks: list[DocumentChunk] = []
        if extraction_result.extraction_status == IngestionStatus.EXTRACTED:
            chunks = self.chunker.chunk_document(metadata, extraction_result)
        elif extraction_result.extraction_status == IngestionStatus.NEEDS_OCR:
            logger.warning(
                "Document '%s' flagged as NEEDS_OCR. No chunks generated until OCR is applied.",
                document_id,
            )

        return extraction_result, chunks

    def process_all(self) -> dict[str, Any]:
        """Process all registered documents and return aggregated results."""
        all_chunks: list[DocumentChunk] = []
        extraction_results: list[ExtractionResult] = []

        for doc_id in list(self.registry.keys()):
            res, chunks = self.process_document(doc_id)
            extraction_results.append(res)
            all_chunks.extend(chunks)

        return {
            "total_documents": len(self.registry),
            "total_chunks": len(all_chunks),
            "extractions": extraction_results,
            "chunks": all_chunks,
        }

    def export_chunks_to_jsonl(
        self,
        chunks: list[DocumentChunk],
        output_file: Path | str | None = None,
    ) -> Path:
        """Export chunks to a JSONL file for inspectable Step 2 embedding input."""
        if output_file is None:
            self.config.output_dir.mkdir(parents=True, exist_ok=True)
            output_path = self.config.output_dir / "policy_chunks.jsonl"
        else:
            output_path = Path(output_file)
            output_path.parent.mkdir(parents=True, exist_ok=True)

        with open(output_path, "w", encoding="utf-8") as f:
            for chunk in chunks:
                f.write(json.dumps(chunk.model_dump(), ensure_ascii=False) + "\n")

        logger.info("Exported %d policy chunks to: %s", len(chunks), output_path)
        return output_path

    def export_manifest(
        self,
        output_file: Path | str | None = None,
    ) -> Path:
        """Export registered documents manifest as JSON."""
        if output_file is None:
            self.config.output_dir.mkdir(parents=True, exist_ok=True)
            output_path = self.config.output_dir / "document_manifest.json"
        else:
            output_path = Path(output_file)
            output_path.parent.mkdir(parents=True, exist_ok=True)

        payload = {
            "total_registered": len(self.registry),
            "documents": [doc.model_dump() for doc in self.registry.values()],
        }

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2, ensure_ascii=False)

        logger.info("Exported document manifest to: %s", output_path)
        return output_path
