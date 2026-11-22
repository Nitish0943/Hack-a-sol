"""Comprehensive test suite for KisanSetu AI policy document ingestion.

Covers:
1. Valid PDF extraction
2. Multi-page PDF extraction and page preservation
3. Empty / scanned PDF detection (NEEDS_OCR)
4. Missing / invalid PDF error handling
5. Text cleaning and control character removal
6. Preservation of monetary values, dates, percentages
7. Preservation of negations and eligibility conditions
8. Semantic chunk size and overlap bounds
9. Source metadata propagation to chunks
10. Duplicate document registration prevention
11. End-to-end pipeline execution and JSONL export
"""

import json
from pathlib import Path
import pytest

from ai.rag.cleaner import PolicyTextCleaner
from ai.rag.config import IngestionConfig
from ai.rag.extractor import PDFDocumentExtractor
from ai.rag.chunker import PolicySemanticChunker
from ai.rag.models import (
    DocumentMetadata,
    GovernmentLevel,
    DocumentType,
    IngestionStatus,
)
from ai.rag.pipeline import PolicyIngestionPipeline


@pytest.fixture
def sample_registry_path() -> Path:
    return Path("ai/rag/sample_policies/metadata_registry.json")


@pytest.fixture
def pm_kisan_metadata() -> DocumentMetadata:
    return DocumentMetadata(
        document_id="pm-kisan-test",
        document_title="PM-KISAN Operational Guidelines",
        scheme_name="PM-KISAN",
        issuing_department="Ministry of Agriculture & Farmers Welfare",
        government_level=GovernmentLevel.CENTRAL,
        applicable_state="All-India",
        document_type=DocumentType.OPERATIONAL_GUIDELINES,
        source_url="https://pmkisan.gov.in/Documents/OperationalGuidelines.pdf",
        publication_date="2024-01-15",
        effective_date="2018-12-01",
        local_path="ai/rag/sample_policies/pm_kisan_operational_guidelines.pdf",
        extraction_status=IngestionStatus.REGISTERED,
    )


@pytest.fixture
def scanned_metadata() -> DocumentMetadata:
    return DocumentMetadata(
        document_id="scanned-test-doc",
        document_title="Scanned Policy Circular",
        scheme_name="Archived State Circular",
        issuing_department="Directorate of Agriculture",
        government_level=GovernmentLevel.STATE,
        applicable_state="Chhattisgarh",
        document_type=DocumentType.CIRCULAR,
        source_url="https://agriportal.cg.nic.in/circulars/sample.pdf",
        local_path="ai/rag/sample_policies/scanned_sample_needs_ocr.pdf",
    )


# ---------------------------------------------------------
# 1. Text Cleaner Tests
# ---------------------------------------------------------
class TestPolicyTextCleaner:
    def setup_method(self) -> None:
        self.cleaner = PolicyTextCleaner()

    def test_preserves_monetary_values(self) -> None:
        raw = "Benefit of ₹6,000/- per year in installments of Rs. 2000 each or INR 3,00,000 credit limit."
        cleaned = self.cleaner.clean(raw)
        assert "₹6,000" in cleaned
        assert "₹2000" in cleaned
        assert "₹3,00,000" in cleaned

    def test_preserves_dates_and_percentages(self) -> None:
        raw = "Effective date 01-12-2018 with Kharif premium 2.0% and Rabi premium 1.5%."
        cleaned = self.cleaner.clean(raw)
        assert "01-12-2018" in cleaned
        assert "2.0%" in cleaned
        assert "1.5%" in cleaned

    def test_preserves_negations_and_exclusions(self) -> None:
        raw = "Persons who paid income tax shall NOT be eligible for benefit unless exempted."
        cleaned = self.cleaner.clean(raw)
        assert "shall NOT be eligible" in cleaned
        assert "unless exempted" in cleaned
        assert self.cleaner.contains_eligibility_signal(cleaned) is True

    def test_removes_control_chars_and_normalizes_whitespace(self) -> None:
        raw = "Clause 1.1\x00\x0c   Overview of Scheme.\n\n\n\nSection 2.   Eligibility."
        cleaned = self.cleaner.clean(raw)
        assert "\x00" not in cleaned
        assert "\x0c" not in cleaned
        assert "   " not in cleaned
        # Collapses 4 newlines to 2 (paragraph boundary)
        assert "Clause 1.1 Overview of Scheme.\n\nSection 2. Eligibility." == cleaned


# ---------------------------------------------------------
# 2. PDF Extraction Tests
# ---------------------------------------------------------
class TestPDFDocumentExtractor:
    def setup_method(self) -> None:
        self.extractor = PDFDocumentExtractor()

    def test_extract_valid_multipage_pdf(self, pm_kisan_metadata: DocumentMetadata) -> None:
        result = self.extractor.extract(pm_kisan_metadata)
        assert result.extraction_status == IngestionStatus.EXTRACTED
        assert result.total_pages == 2
        assert len(result.extracted_pages) == 2
        assert result.extracted_pages[0].page_number == 1
        assert result.extracted_pages[1].page_number == 2
        assert "₹6,000" in result.extracted_pages[0].cleaned_text
        assert "EXCLUSION CRITERIA" in result.extracted_pages[1].cleaned_text

    def test_detects_scanned_pdf_requiring_ocr(self, scanned_metadata: DocumentMetadata) -> None:
        result = self.extractor.extract(scanned_metadata)
        assert result.extraction_status == IngestionStatus.NEEDS_OCR
        assert len(result.ocr_needed_pages) == 1
        assert 1 in result.ocr_needed_pages
        assert "requires OCR" in (result.error_message or "")

    def test_handles_missing_file_gracefully(self) -> None:
        missing_doc = DocumentMetadata(
            document_id="non-existent",
            document_title="Ghost Document",
            scheme_name="Ghost",
            issuing_department="None",
            government_level=GovernmentLevel.CENTRAL,
            document_type=DocumentType.CIRCULAR,
            source_url="https://example.com/ghost.pdf",
            local_path="ai/rag/sample_policies/ghost_file.pdf",
        )
        result = self.extractor.extract(missing_doc)
        assert result.extraction_status == IngestionStatus.EXTRACTION_FAILED
        assert "not found" in (result.error_message or "").lower()


# ---------------------------------------------------------
# 3. Policy-Aware Semantic Chunking Tests
# ---------------------------------------------------------
class TestPolicySemanticChunker:
    def setup_method(self) -> None:
        self.config = IngestionConfig(target_chunk_size=400, max_chunk_size=700, chunk_overlap=80)
        self.chunker = PolicySemanticChunker(config=self.config)
        self.extractor = PDFDocumentExtractor(config=self.config)

    def test_chunk_generation_and_metadata_propagation(self, pm_kisan_metadata: DocumentMetadata) -> None:
        extraction_result = self.extractor.extract(pm_kisan_metadata)
        chunks = self.chunker.chunk_document(pm_kisan_metadata, extraction_result)

        assert len(chunks) >= 1
        first_chunk = chunks[0]

        # Verify metadata propagation
        assert first_chunk.document_id == pm_kisan_metadata.document_id
        assert first_chunk.scheme_name == "PM-KISAN"
        assert first_chunk.source_url == pm_kisan_metadata.source_url
        assert first_chunk.government_level == GovernmentLevel.CENTRAL
        assert first_chunk.applicable_state == "All-India"
        assert first_chunk.page_start >= 1
        assert first_chunk.page_end >= first_chunk.page_start
        assert first_chunk.token_count > 0
        assert first_chunk.contains_eligibility is True

    def test_token_bounds_and_chunk_ids(self, pm_kisan_metadata: DocumentMetadata) -> None:
        extraction_result = self.extractor.extract(pm_kisan_metadata)
        chunks = self.chunker.chunk_document(pm_kisan_metadata, extraction_result)

        for chunk in chunks:
            assert chunk.token_count <= self.config.max_chunk_size
            assert chunk.chunk_id.startswith(pm_kisan_metadata.document_id)
            assert len(chunk.text) > 10


# ---------------------------------------------------------
# 4. End-to-End Pipeline & Registry Tests
# ---------------------------------------------------------
class TestPolicyIngestionPipeline:
    def test_pipeline_load_registry_and_process_all(self, sample_registry_path: Path, tmp_path: Path) -> None:
        config = IngestionConfig(output_dir=tmp_path)
        pipeline = PolicyIngestionPipeline(config=config)

        count = pipeline.load_registry_from_file(sample_registry_path)
        assert count == 4
        assert len(pipeline.registry) == 4

        # Process all documents
        results = pipeline.process_all()
        assert results["total_documents"] == 4
        assert results["total_chunks"] > 0

        # Export chunks to JSONL
        out_jsonl = pipeline.export_chunks_to_jsonl(results["chunks"])
        assert out_jsonl.exists()

        # Verify JSONL lines can be loaded and have required schema
        with open(out_jsonl, "r", encoding="utf-8") as f:
            lines = [json.loads(line) for line in f]

        assert len(lines) == results["total_chunks"]
        for item in lines:
            assert "chunk_id" in item
            assert "document_id" in item
            assert "page_start" in item
            assert "page_end" in item
            assert "source_url" in item
            assert "text" in item

    def test_duplicate_registration_rejected(self, pm_kisan_metadata: DocumentMetadata) -> None:
        pipeline = PolicyIngestionPipeline()
        pipeline.register_document(pm_kisan_metadata)

        with pytest.raises(ValueError, match="already registered"):
            pipeline.register_document(pm_kisan_metadata)

    def test_unsupported_file_extension_rejected(self) -> None:
        pipeline = PolicyIngestionPipeline()
        invalid_doc = DocumentMetadata(
            document_id="bad-ext",
            document_title="Bad Ext",
            scheme_name="Test",
            issuing_department="Test",
            government_level=GovernmentLevel.CENTRAL,
            document_type=DocumentType.CIRCULAR,
            source_url="https://example.com/test.txt",
            local_path="ai/rag/sample_policies/metadata_registry.json",  # .json is not .pdf
        )
        with pytest.raises(ValueError, match="Unsupported file format"):
            pipeline.register_document(invalid_doc)
