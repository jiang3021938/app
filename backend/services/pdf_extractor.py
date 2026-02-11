"""
PDF Text Extraction Service with coordinate tracking.

Uses PyMuPDF (fitz) to extract text blocks with their page numbers and bounding boxes,
enabling click-to-source functionality in the frontend.
"""

import logging
import json
import re
from typing import Dict, Any, List, Optional, Tuple
import fitz  # PyMuPDF

logger = logging.getLogger(__name__)


class PDFTextBlock:
    """Represents a text block with its location in the PDF."""

    def __init__(self, text: str, page: int, bbox: Tuple[float, float, float, float]):
        self.text = text
        self.page = page
        self.bbox = bbox  # (x0, y0, x1, y1)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "text": self.text,
            "page": self.page,
            "bbox": {
                "x0": round(self.bbox[0], 2),
                "y0": round(self.bbox[1], 2),
                "x1": round(self.bbox[2], 2),
                "y1": round(self.bbox[3], 2),
            },
        }


class PDFExtractor:
    """Extracts text from PDF with coordinate information for source tracing."""

    def extract_text_with_coords(self, pdf_bytes: bytes) -> Dict[str, Any]:
        """
        Extract all text from a PDF along with page/coordinate metadata.

        Args:
            pdf_bytes: Raw PDF file bytes

        Returns:
            Dictionary with:
              - full_text: concatenated text for AI analysis
              - pages: list of page metadata (width, height)
              - blocks: list of text blocks with coordinates
        """
        try:
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            all_blocks: List[Dict] = []
            pages_meta: List[Dict] = []
            full_text_parts: List[str] = []

            for page_num in range(len(doc)):
                page = doc[page_num]
                rect = page.rect
                pages_meta.append({
                    "page": page_num,
                    "width": round(rect.width, 2),
                    "height": round(rect.height, 2),
                })

                # Extract text blocks with coordinates
                blocks = page.get_text("dict", flags=fitz.TEXT_PRESERVE_WHITESPACE)["blocks"]

                for block in blocks:
                    if block["type"] != 0:  # Skip non-text (image) blocks
                        continue

                    block_text_parts = []
                    for line in block.get("lines", []):
                        line_text = ""
                        for span in line.get("spans", []):
                            line_text += span["text"]
                        if line_text.strip():
                            block_text_parts.append(line_text.strip())

                    block_text = " ".join(block_text_parts)
                    if not block_text.strip():
                        continue

                    bbox = block["bbox"]  # (x0, y0, x1, y1)
                    all_blocks.append({
                        "text": block_text.strip(),
                        "page": page_num,
                        "bbox": {
                            "x0": round(bbox[0], 2),
                            "y0": round(bbox[1], 2),
                            "x1": round(bbox[2], 2),
                            "y1": round(bbox[3], 2),
                        },
                    })
                    full_text_parts.append(block_text.strip())

            doc.close()

            return {
                "full_text": "\n".join(full_text_parts),
                "pages": pages_meta,
                "blocks": all_blocks,
                "page_count": len(pages_meta),
            }

        except Exception as e:
            logger.error(f"PDF extraction error: {e}")
            raise ValueError(f"Failed to extract text from PDF: {e}")

    def find_source_locations(
        self,
        blocks: List[Dict],
        search_text: str,
        fuzzy_threshold: float = 0.6,
    ) -> List[Dict]:
        """
        Find the PDF locations where a given text snippet appears.

        Uses both exact substring match and fuzzy matching for robustness.

        Args:
            blocks: List of text block dicts from extract_text_with_coords
            search_text: The text to search for
            fuzzy_threshold: Minimum similarity ratio for fuzzy match

        Returns:
            List of matching block locations
        """
        if not search_text or not search_text.strip():
            return []

        search_lower = search_text.lower().strip()
        matches = []

        for block in blocks:
            block_text_lower = block["text"].lower()

            # Exact substring match
            if search_lower in block_text_lower:
                matches.append({
                    "page": block["page"],
                    "bbox": block["bbox"],
                    "matched_text": block["text"],
                    "match_type": "exact",
                })
                continue

            # Check if significant words from search appear in the block
            search_words = set(re.findall(r'\b\w{3,}\b', search_lower))
            block_words = set(re.findall(r'\b\w{3,}\b', block_text_lower))

            if search_words and block_words:
                overlap = len(search_words & block_words) / len(search_words)
                if overlap >= fuzzy_threshold:
                    matches.append({
                        "page": block["page"],
                        "bbox": block["bbox"],
                        "matched_text": block["text"],
                        "match_type": "fuzzy",
                        "confidence": round(overlap, 2),
                    })

        return matches

    def map_extraction_to_sources(
        self,
        blocks: List[Dict],
        extracted_data: Dict[str, Any],
    ) -> Dict[str, List[Dict]]:
        """
        Map each extracted field back to its source location(s) in the PDF.

        Args:
            blocks: Text blocks from PDF extraction
            extracted_data: AI-extracted lease data

        Returns:
            Dictionary mapping field names to their source locations
        """
        source_map: Dict[str, List[Dict]] = {}

        # Fields and their search values
        field_searches = {}

        if extracted_data.get("tenant_name"):
            field_searches["tenant_name"] = extracted_data["tenant_name"]
        if extracted_data.get("landlord_name"):
            field_searches["landlord_name"] = extracted_data["landlord_name"]
        if extracted_data.get("property_address"):
            field_searches["property_address"] = extracted_data["property_address"]
        if extracted_data.get("monthly_rent"):
            # Search for the dollar amount
            rent = extracted_data["monthly_rent"]
            field_searches["monthly_rent"] = str(int(rent)) if rent == int(rent) else str(rent)
        if extracted_data.get("security_deposit"):
            dep = extracted_data["security_deposit"]
            field_searches["security_deposit"] = str(int(dep)) if dep == int(dep) else str(dep)
        if extracted_data.get("lease_start_date"):
            field_searches["lease_start_date"] = extracted_data["lease_start_date"]
        if extracted_data.get("lease_end_date"):
            field_searches["lease_end_date"] = extracted_data["lease_end_date"]
        if extracted_data.get("pet_policy") and extracted_data["pet_policy"] != "Not specified":
            field_searches["pet_policy"] = extracted_data["pet_policy"]
        if extracted_data.get("late_fee_terms") and extracted_data["late_fee_terms"] != "Not specified":
            field_searches["late_fee_terms"] = extracted_data["late_fee_terms"]

        for field_name, search_value in field_searches.items():
            locations = self.find_source_locations(blocks, str(search_value))
            if locations:
                source_map[field_name] = locations

        return source_map

    def get_page_image(self, pdf_bytes: bytes, page_num: int, dpi: int = 150) -> bytes:
        """
        Render a specific PDF page as a PNG image.

        Args:
            pdf_bytes: Raw PDF file bytes
            page_num: Zero-based page number
            dpi: Resolution for rendering

        Returns:
            PNG image bytes
        """
        try:
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            if page_num >= len(doc):
                raise ValueError(f"Page {page_num} does not exist (total pages: {len(doc)})")

            page = doc[page_num]
            zoom = dpi / 72  # 72 is the default DPI
            mat = fitz.Matrix(zoom, zoom)
            pix = page.get_pixmap(matrix=mat)
            img_bytes = pix.tobytes("png")
            doc.close()
            return img_bytes

        except Exception as e:
            logger.error(f"Page rendering error: {e}")
            raise ValueError(f"Failed to render PDF page: {e}")
