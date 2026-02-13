"""
Gemini PDF Analysis Service.

Uses Google Gemini API to directly analyze PDF files without needing local text extraction.
Gemini can process PDF files natively, eliminating the need for PyMuPDF.
"""

import logging
import os
import re
import json
from typing import Dict, Any, List, Optional
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

EXTRACTION_PROMPT = """You are an expert lease agreement analyzer specializing in U.S. residential leases.
Analyze the following lease document thoroughly and extract all key information.

Return a JSON object with the following structure (use null if not found in document):

{
  "tenant_name": "Full legal name of the tenant(s)",
  "landlord_name": "Full legal name of the landlord/property owner",
  "property_address": "Complete property address including city, state, ZIP",
  "monthly_rent": 0.00,
  "security_deposit": 0.00,
  "lease_start_date": "YYYY-MM-DD",
  "lease_end_date": "YYYY-MM-DD",
  "renewal_notice_days": 30,
  "pet_policy": "Description of pet policy or 'Not specified in lease'",
  "late_fee_terms": "Description of late fee terms or 'Not specified in lease'",
  "early_termination": "Description of early termination terms or 'Not specified'",
  "subletting_policy": "Description of subletting/assignment policy or 'Not specified'",
  "maintenance_responsibilities": "Summary of landlord vs tenant maintenance duties",
  "entry_notice_requirements": "Notice period landlord must give before entering property",
  "utilities_included": "What utilities are included in rent, if any",
  "risk_flags": [
    {
      "severity": "high or medium",
      "category": "Category name",
      "title": "Short title of the risk",
      "description": "Detailed description of the risk or concern",
      "recommendation": "Specific action the tenant/landlord should take"
    }
  ],
  "audit_checklist": [
    {
      "category": "Category name",
      "status": "pass or warning or issue",
      "title": "Short title",
      "description": "What was found or what is missing"
    }
  ],
  "health_score": {
    "overall": 0,
    "financial_fairness": 0,
    "legal_compliance": 0,
    "tenant_protection": 0,
    "completeness": 0
  }
}

CRITICAL INSTRUCTIONS FOR risk_flags:
risk_flags should ONLY contain genuine risks — items with severity "medium" or "high".
Do NOT include items that are satisfactory or present and adequate.
A well-written lease may have 0 risk flags. Only flag real problems or missing critical clauses.
The number of risk flags is NOT fixed — it can be 0 to 5 depending on the lease quality.

CRITICAL INSTRUCTIONS FOR audit_checklist:
You MUST check ALL 12 categories below and include EACH ONE in audit_checklist.
This is a complete audit review — most items in a good lease should be "pass".

For each category:
- If the clause is present and adequate: status = "pass"
- If the clause is present but has minor issues: status = "warning"
- If the clause is missing or seriously problematic: status = "issue"

If status is "warning" or "issue", ALSO add a corresponding entry to risk_flags with appropriate severity.

Categories to ALWAYS include in audit_checklist:
1. "Lead-based paint disclosure" - Required for pre-1978 buildings. Check if disclosed.
2. "Security deposit terms" - Check amount vs state legal limits, return timeline, conditions.
3. "Late fee terms" - Check if defined, reasonable percentage, grace period.
4. "Maintenance responsibilities" - Check if landlord/tenant duties are clearly split.
5. "Entry notice requirements" - Check if notice period is specified and legal.
6. "Subletting/assignment clauses" - Check if subletting policy is addressed.
7. "Dispute resolution procedures" - Check if arbitration/mediation/court procedures defined.
8. "Pet policy" - Check if pet rules are explicitly stated.
9. "Early termination clause" - Check penalties and notice requirements.
10. "Rent increase provisions" - Check if rent increase terms are specified for renewal.
11. "Insurance requirements" - Check if renter's insurance is required.
12. "Habitable condition guarantee" - Check if landlord guarantees habitability.

For health_score:
- overall: 0-100 score based on all factors
- financial_fairness: 0-100 (rent reasonableness, deposit limits, fee fairness)
- legal_compliance: 0-100 (state law compliance, required disclosures)
- tenant_protection: 0-100 (tenant rights, maintenance, entry notice)
- completeness: 0-100 (how many standard clauses are present)

IMPORTANT:
- Extract exact values from the document, do not make up data
- For dates, convert to YYYY-MM-DD format
- For monetary values, extract as numbers without currency symbols
- Return ONLY valid JSON, no markdown code blocks, no additional text
- risk_flags: only real problems (0-5 items, medium/high severity)
- audit_checklist: always exactly 12 items (one per category)
- Also provide the full extracted text of the document

Return your response as:
{
  "extracted_data": { ...all the fields above... },
  "full_text": "Complete text extracted from the document"
}
"""


class GeminiExtractor:
    """Extracts lease data from PDF files using Google Gemini API."""

    def __init__(self):
        """Initialize Gemini client with API key from environment."""
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not set")

        self.client = genai.Client(api_key=api_key)
        logger.info("Gemini client initialized")

    async def analyze_pdf(self, pdf_bytes: bytes, file_name: str) -> Dict[str, Any]:
        """
        Analyze a PDF or Word file using Gemini API to extract lease information.

        Args:
            pdf_bytes: Raw file bytes (PDF or Word)
            file_name: Name of the file (used for MIME type detection)

        Returns:
            Dictionary with extracted lease data and full text
        """
        try:
            file_name_lower = (file_name or "").lower()
            is_word = file_name_lower.endswith((".docx", ".doc"))

            if is_word:
                # Gemini doesn't support Word MIME types directly.
                # Extract text from Word file and send as plain text.
                from services.document_extractor import _extract_docx_text
                paragraphs = _extract_docx_text(pdf_bytes)
                doc_text = "\n\n".join(paragraphs)
                if not doc_text.strip():
                    raise ValueError("Could not extract text from Word document")

                content_part = types.Part.from_text(
                    text=f"--- LEASE DOCUMENT TEXT ---\n\n{doc_text}\n\n--- END DOCUMENT ---"
                )
                logger.info(f"Extracted {len(paragraphs)} paragraphs from Word file for Gemini analysis")
            else:
                # PDF files can be sent directly to Gemini
                content_part = types.Part.from_bytes(
                    data=pdf_bytes,
                    mime_type="application/pdf"
                )

            text_part = types.Part.from_text(text=EXTRACTION_PROMPT)

            # Generate content
            response = self.client.models.generate_content(
                model="gemini-3-flash-preview",
                contents=[
                    types.Content(
                        role="user",
                        parts=[content_part, text_part]
                    )
                ]
            )

            # Parse the response
            response_text = response.text

            # Extract JSON from response
            json_str = self._extract_json(response_text)

            # Parse JSON
            try:
                result = json.loads(json_str)
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse JSON from Gemini: {e}")
                logger.error(f"Response text: {response_text[:500]}")
                raise ValueError(f"Failed to parse JSON from Gemini response: {e}")

            # Handle both flat and nested response formats
            if "extracted_data" in result:
                extracted_data = result["extracted_data"]
                full_text = result.get("full_text", "")
            else:
                # Gemini returned flat structure
                full_text = result.pop("full_text", "")
                extracted_data = result

            # Ensure all expected fields are present
            expected_fields = [
                "tenant_name", "landlord_name", "property_address",
                "monthly_rent", "security_deposit", "lease_start_date",
                "lease_end_date", "renewal_notice_days", "pet_policy",
                "late_fee_terms", "risk_flags", "audit_checklist"
            ]

            for field in expected_fields:
                if field not in extracted_data:
                    extracted_data[field] = None

            # Ensure risk_flags is a list of objects with only medium/high severity
            risk_flags = extracted_data.get("risk_flags", [])
            if isinstance(risk_flags, list):
                cleaned_flags = []
                for flag in risk_flags:
                    if isinstance(flag, dict):
                        # Only keep medium and high severity flags
                        severity = flag.get("severity", "medium").lower()
                        if severity in ("medium", "high"):
                            cleaned_flags.append(flag)
                    elif isinstance(flag, str):
                        cleaned_flags.append({
                            "severity": "medium",
                            "category": "General",
                            "title": flag[:50],
                            "description": flag,
                            "recommendation": "Review this clause carefully."
                        })
                extracted_data["risk_flags"] = cleaned_flags
            else:
                extracted_data["risk_flags"] = []

            # Ensure audit_checklist is a list of objects
            audit_checklist = extracted_data.get("audit_checklist", [])
            if isinstance(audit_checklist, list):
                cleaned_checklist = []
                for item in audit_checklist:
                    if isinstance(item, dict):
                        # Normalize status
                        status = item.get("status", "pass").lower()
                        if status not in ("pass", "warning", "issue"):
                            status = "pass"
                        item["status"] = status
                        cleaned_checklist.append(item)
                extracted_data["audit_checklist"] = cleaned_checklist
            else:
                extracted_data["audit_checklist"] = []

            # Build source map and page info using actual file content
            source_map, page_count = self._build_source_map_from_file(
                pdf_bytes, file_name, extracted_data
            )

            pages_meta = [
                {"page": i, "width": 612, "height": 792}
                for i in range(page_count)
            ]

            logger.info(f"Successfully extracted data from PDF using Gemini ({len(extracted_data.get('risk_flags', []))} risks found)")
            return {
                "extracted_data": extracted_data,
                "full_text": full_text,
                "source_blocks": [],
                "pages_meta": pages_meta,
                "source_map": source_map
            }

        except Exception as e:
            logger.error(f"Gemini PDF analysis error: {e}")
            raise ValueError(f"Failed to analyze PDF with Gemini: {e}")

    def _extract_json(self, text: str) -> str:
        """Extract JSON from response text, handling markdown code blocks."""
        text = text.strip()

        # Remove markdown code blocks
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

        # Try to find JSON object
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            return json_match.group(0)

        return text

    def _build_source_map_from_file(self, file_bytes: bytes, file_name: str, extracted_data: dict) -> tuple:
        """Build source_map with coordinates matching the SVG page rendering.
        Returns (source_map, page_count).

        The SVG renderer uses:
        - Page: 612 x 792 (letter), margin: 54, font_size: 11, line_height: 16
        - First text y = margin + font_size = 65
        - Lines are wrapped at ~90 chars
        - PDF: one actual page per SVG page (via pypdf)
        - Word: ~42 lines per page (same as SVG max lines)
        """
        source_map = {}
        page_texts = []  # list of (page_idx, list_of_lines)

        file_name_lower = (file_name or "").lower()
        is_word = file_name_lower.endswith((".docx", ".doc"))

        # SVG rendering constants (must match _render_text_as_svg / _render_pdf_page)
        margin = 54
        font_size = 11
        line_height = 16
        page_height = 792
        max_lines_per_page = int((page_height - margin * 2) / line_height)

        try:
            if is_word:
                # Extract text and paginate like _render_docx_page does
                from services.document_extractor import _extract_docx_text
                paragraphs = _extract_docx_text(file_bytes)
                all_lines = []
                for para in paragraphs:
                    if not para.strip():
                        all_lines.append("")
                        continue
                    words = para.split()
                    line = ""
                    for word in words:
                        test = f"{line} {word}".strip()
                        if len(test) > 85:
                            all_lines.append(line)
                            line = word
                        else:
                            line = test
                    if line:
                        all_lines.append(line)
                    all_lines.append("")  # blank line between paragraphs

                # Split into pages
                for i in range(0, len(all_lines), max_lines_per_page):
                    page_lines = all_lines[i:i + max_lines_per_page]
                    page_texts.append(page_lines)
            else:
                # PDF: extract text per actual page
                import io
                from pypdf import PdfReader
                reader = PdfReader(io.BytesIO(file_bytes))
                for page in reader.pages:
                    text = page.extract_text() or ""
                    # Wrap lines the same way _render_pdf_page does
                    lines = []
                    for paragraph in text.split("\n"):
                        if not paragraph.strip():
                            lines.append("")
                            continue
                        words = paragraph.split()
                        line = ""
                        for word in words:
                            test = f"{line} {word}".strip()
                            if len(test) > 90:
                                lines.append(line)
                                line = word
                            else:
                                line = test
                        if line:
                            lines.append(line)
                    page_texts.append(lines)
        except Exception as e:
            logger.warning(f"Failed to extract page text for source map: {e}")
            # Fallback: single page with full_text
            page_texts = [["(Could not extract page text)"]]

        page_count = max(1, len(page_texts))

        # Build field searches
        field_searches = {}
        for field in ["tenant_name", "landlord_name", "property_address",
                       "lease_start_date", "lease_end_date", "pet_policy", "late_fee_terms"]:
            val = extracted_data.get(field)
            if val and str(val) not in ("Not specified", "Not specified in lease", "None", "null"):
                field_searches[field] = str(val)
        for field in ["monthly_rent", "security_deposit"]:
            val = extracted_data.get(field)
            if val:
                try:
                    field_searches[field] = str(int(val)) if float(val) == int(float(val)) else str(val)
                except (ValueError, TypeError):
                    field_searches[field] = str(val)

        # Search each page's lines to find field values and compute SVG bbox
        for field_name, search_value in field_searches.items():
            search_lower = search_value.lower()
            found = False
            for page_idx, lines in enumerate(page_texts):
                for line_idx, line in enumerate(lines):
                    if search_lower in line.lower():
                        # Calculate y position matching the SVG rendering
                        y0 = margin + font_size + (line_idx * line_height) - font_size
                        y1 = y0 + line_height
                        source_map[field_name] = [{
                            "page": page_idx,
                            "bbox": {
                                "x0": float(margin),
                                "y0": round(y0, 1),
                                "x1": float(612 - margin),
                                "y1": round(y1, 1)
                            },
                            "matched_text": search_value,
                            "match_type": "text_search"
                        }]
                        found = True
                        break
                if found:
                    break

        return source_map, page_count

    def get_page_count(self, pdf_bytes: bytes) -> int:
        """Get the number of pages in a PDF using pypdf."""
        try:
            from pypdf import PdfReader
            import io
            reader = PdfReader(io.BytesIO(pdf_bytes))
            return len(reader.pages)
        except ImportError:
            logger.warning("pypdf not available, estimating page count")
            # Rough estimate based on file size
            return max(1, len(pdf_bytes) // 50000 + 1)
        except Exception as e:
            logger.error(f"Page count error: {e}")
            return 1
