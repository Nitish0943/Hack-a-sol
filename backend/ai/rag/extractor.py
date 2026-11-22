"""PDF Document Extractor for KisanSetu AI.

Extracts text page-by-page from official government documents, preserving page
numbers, detecting unextractable/scanned pages, and reporting extraction status.
"""

from pathlib import Path
import logging
import pymupdf

from ai.rag.cleaner import PolicyTextCleaner
from ai.rag.config import IngestionConfig
from ai.rag.models import (
    DocumentMetadata,
    ExtractedPage,
    ExtractionResult,
    IngestionStatus,
)

logger = logging.getLogger(__name__)


class PDFDocumentExtractor:
    """Extracts text from PDF policy documents using PyMuPDF with quality verification."""

    def __init__(self, config: IngestionConfig | None = None) -> None:
        self.config = config or IngestionConfig()
        self.cleaner = PolicyTextCleaner()

    def extract(self, metadata: DocumentMetadata) -> ExtractionResult:
        """Extract text from a registered PDF document with page-level traceability."""
        file_path = Path(metadata.local_path)
        if not file_path.exists():
            rag_dir = Path(__file__).resolve().parent
            alt_path = rag_dir / "sample_policies" / file_path.name
            if alt_path.exists():
                file_path = alt_path
            else:
                error_msg = f"Document file not found at: {file_path}"
                logger.error(error_msg)
                return ExtractionResult(
                    document_id=metadata.document_id,
                    total_pages=0,
                    extracted_pages=[],
                    total_characters=0,
                    extraction_status=IngestionStatus.EXTRACTION_FAILED,
                    error_message=error_msg,
                )

        try:
            doc = pymupdf.open(str(file_path))
        except Exception as exc:
            error_msg = f"Failed to open PDF document: {exc}"
            logger.error(error_msg)
            return ExtractionResult(
                document_id=metadata.document_id,
                total_pages=0,
                extracted_pages=[],
                total_characters=0,
                extraction_status=IngestionStatus.EXTRACTION_FAILED,
                error_message=error_msg,
            )

        total_pages = len(doc)
        if total_pages == 0:
            doc.close()
            return ExtractionResult(
                document_id=metadata.document_id,
                total_pages=0,
                extracted_pages=[],
                total_characters=0,
                extraction_status=IngestionStatus.EXTRACTION_FAILED,
                error_message="PDF contains zero pages.",
            )

        extracted_pages: list[ExtractedPage] = []
        ocr_needed_pages: list[int] = []
        total_characters = 0

        for page_idx in range(total_pages):
            page_number = page_idx + 1
            page = doc[page_idx]

            try:
                # Extract text using PyMuPDF layout-aware text extraction
                raw_text = page.get_text("text") or ""
            except Exception as page_exc:
                logger.warning(
                    "Error extracting page %d of %s: %s",
                    page_number,
                    metadata.document_id,
                    page_exc,
                )
                raw_text = ""

            cleaned = self.cleaner.clean(raw_text)
            char_count = len(cleaned)
            total_characters += char_count

            # Check if page has extractable text or is a scanned image
            has_sufficient_text = char_count >= self.config.min_page_char_count
            requires_ocr = not has_sufficient_text

            if requires_ocr:
                ocr_needed_pages.append(page_number)

            extracted_pages.append(
                ExtractedPage(
                    page_number=page_number,
                    raw_text=raw_text,
                    cleaned_text=cleaned,
                    char_count=char_count,
                    has_text=has_sufficient_text,
                    requires_ocr=requires_ocr,
                )
            )

        doc.close()

        # Determine overall document status
        scanned_ratio = len(ocr_needed_pages) / total_pages if total_pages > 0 else 1.0
        if scanned_ratio >= self.config.scanned_page_threshold_ratio:
            status = IngestionStatus.NEEDS_OCR
            msg = (
                f"Document requires OCR: {len(ocr_needed_pages)} of {total_pages} "
                f"pages ({scanned_ratio:.1%}) lack extractable text."
            )
            logger.warning("[%s] %s", metadata.document_id, msg)
        else:
            status = IngestionStatus.EXTRACTED
            msg = None

        return ExtractionResult(
            document_id=metadata.document_id,
            total_pages=total_pages,
            extracted_pages=extracted_pages,
            total_characters=total_characters,
            extraction_status=status,
            ocr_needed_pages=ocr_needed_pages,
            error_message=msg,
        )
