"""
Document Extraction Service - supports PDF and Word (.docx) files.

Note: PDF text extraction is now handled by Gemini API (gemini_extractor.py).
This service is kept for backward compatibility and for Word documents only.
"""

import io
import logging
from typing import Dict, Any, List, Tuple

logger = logging.getLogger(__name__)


class DocumentExtractor:
    """Extracts text from PDF or Word documents.
    
    Note: For PDFs, use GeminiExtractor instead for better accuracy.
    This service is primarily for Word documents.
    """

    def extract(self, file_bytes: bytes, file_name: str) -> Dict[str, Any]:
        """
        Auto-detect file type and extract text with metadata.

        Returns dict with:
          - full_text: str
          - blocks: list (with bbox for PDFs, paragraph-level for Word)
          - pages: list of page metadata
          - page_count: int
          - file_type: "pdf" | "docx"
          
        Note: For PDF files, use GeminiExtractor.analyze_pdf() instead.
        """
        lower_name = file_name.lower()

        if lower_name.endswith(".pdf"):
            logger.warning("DocumentExtractor.extract() called for PDF. Use GeminiExtractor.analyze_pdf() instead.")
            return self._extract_pdf(file_bytes)
        elif lower_name.endswith((".docx", ".doc")):
            return self._extract_docx(file_bytes)
        else:
            raise ValueError(f"Unsupported file type: {file_name}")

    def _extract_pdf(self, file_bytes: bytes) -> Dict[str, Any]:
        """
        Extract from PDF using PyMuPDF with coordinate tracking (legacy).
        
        Deprecated: Use GeminiExtractor.analyze_pdf() for PDF analysis.
        This method is kept for fallback purposes only.
        """
        try:
            from services.pdf_extractor import PDFExtractor
            
            extractor = PDFExtractor()
            result = extractor.extract_text_with_coords(file_bytes)
            result["file_type"] = "pdf"
            logger.warning("Using legacy PDF extraction. Consider migrating to GeminiExtractor.")
            return result
        except Exception as e:
            logger.error(f"Legacy PDF extraction failed: {e}")
            raise

    def _extract_docx(self, file_bytes: bytes) -> Dict[str, Any]:
        """Extract from Word document using python-docx."""
        try:
            from docx import Document
        except ImportError:
            logger.error("python-docx not installed. Run: pip install python-docx")
            raise

        doc = Document(io.BytesIO(file_bytes))

        full_text_parts: List[str] = []
        blocks: List[Dict[str, Any]] = []
        paragraph_index = 0

        for para in doc.paragraphs:
            text = para.text.strip()
            if not text:
                continue

            full_text_parts.append(text)
            blocks.append({
                "text": text,
                "page": 0,  # Word docs don't have reliable page info
                "bbox": {
                    "x0": 72.0,   # Standard margin approximation
                    "y0": float(72 + paragraph_index * 20),
                    "x1": 540.0,
                    "y1": float(72 + paragraph_index * 20 + 16),
                },
            })
            paragraph_index += 1

        # Also extract text from tables
        for table in doc.tables:
            for row in table.rows:
                row_texts = []
                for cell in row.cells:
                    cell_text = cell.text.strip()
                    if cell_text:
                        row_texts.append(cell_text)
                if row_texts:
                    combined = " | ".join(row_texts)
                    full_text_parts.append(combined)
                    blocks.append({
                        "text": combined,
                        "page": 0,
                        "bbox": {
                            "x0": 72.0,
                            "y0": float(72 + paragraph_index * 20),
                            "x1": 540.0,
                            "y1": float(72 + paragraph_index * 20 + 16),
                        },
                    })
                    paragraph_index += 1

        full_text = "\n".join(full_text_parts)

        return {
            "full_text": full_text,
            "blocks": blocks,
            "pages": [{"width": 612, "height": 792, "page_num": 0}],
            "page_count": 1,  # Word doesn't expose page count easily
            "file_type": "docx",
        }
