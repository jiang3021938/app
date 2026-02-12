"""
Gemini PDF Analysis Service.

Uses Google Gemini API to directly analyze PDF files without needing local text extraction.
Gemini can process PDF files natively, eliminating the need for PyMuPDF.
"""

import logging
import os
from typing import Dict, Any, List, Optional
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)


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
        Analyze a PDF file using Gemini API to extract lease information.

        Args:
            pdf_bytes: Raw PDF file bytes
            file_name: Name of the file (for context)

        Returns:
            Dictionary with extracted lease data and full text
        """
        try:
            # Build PDF part (from_bytes only accepts data and mime_type)
            file_part = types.Part.from_bytes(
                data=pdf_bytes,
                mime_type="application/pdf"
            )

            # Construct the prompt for lease data extraction
            prompt_text = """Analyze this lease agreement document and perform a comprehensive analysis.

Return the response as a JSON object with these exact sections:

```json
{
    "extracted_data": {
        "tenant_name": "Full legal name of the tenant(s)",
        "landlord_name": "Full legal name of the landlord or property management company",
        "property_address": "Complete property address including unit number",
        "monthly_rent": 2500.00,
        "security_deposit": 5000.00,
        "lease_start_date": "2025-01-01",
        "lease_end_date": "2026-01-01",
        "renewal_notice_days": 60,
        "pet_policy": "Description of pet policy or 'Not specified'",
        "late_fee_terms": "Description of late fee terms or 'Not specified'",

        "financial_analysis": {
            "annualized_rent_cost": 30000.00,
            "deposit_months_equivalent": 2.0,
            "deposit_legal_compliance": "Compliant / Exceeds typical limit / Cannot determine — explain based on common state limits (e.g. 1-2 months rent)",
            "rent_increase_clause": "Description or 'Not specified'",
            "rent_increase_assessment": "Reasonable / Above average / Concerning",
            "hidden_fees": [
                {
                    "fee_type": "e.g. Utilities, Maintenance, Insurance",
                    "description": "What the fee covers",
                    "amount": "Amount or 'Variable'",
                    "assessment": "Standard / Unusual / Potentially excessive"
                }
            ],
            "total_move_in_cost": 7500.00
        },

        "rights_obligations": {
            "landlord_obligations": ["List of landlord responsibilities"],
            "tenant_obligations": ["List of tenant responsibilities"],
            "maintenance_division": {
                "landlord_responsible": ["Items landlord must maintain"],
                "tenant_responsible": ["Items tenant must maintain"],
                "unclear_items": ["Items with ambiguous responsibility"]
            },
            "entry_notice_requirement": "Required notice period or 'Not specified'",
            "entry_notice_legal_compliance": "Compliant / Non-compliant / Not specified",
            "subletting_policy": "Description or 'Not specified'",
            "early_termination": "Terms or 'Not specified'"
        },

        "risk_flags": [
            {
                "severity": "high|medium|low",
                "category": "Category name",
                "description": "Detailed description of the risk",
                "recommendation": "Specific action the tenant should take",
                "is_unusual": false
            }
        ],

        "missing_protections": [
            "Standard clauses absent from this lease"
        ],

        "health_score": {
            "overall_score": 75,
            "grade": "A|B|C|D|F",
            "category_scores": {
                "financial_fairness": { "score": 20, "max": 25, "notes": "Explanation" },
                "legal_compliance": { "score": 18, "max": 25, "notes": "Explanation" },
                "tenant_protection": { "score": 20, "max": 25, "notes": "Explanation" },
                "completeness": { "score": 17, "max": 25, "notes": "Explanation" }
            },
            "summary": "Overall assessment of lease quality"
        },

        "action_items": {
            "negotiate_points": [
                {
                    "item": "What to negotiate",
                    "priority": "high|medium|low",
                    "suggested_language": "Suggested clause wording"
                }
            ],
            "verify_before_signing": ["Things to confirm before signing"],
            "recommended_additions": [
                {
                    "clause": "Clause name",
                    "reason": "Why to add it",
                    "suggested_language": "Suggested wording"
                }
            ]
        }
    },
    "full_text": "Complete text extracted from the document"
}
```

Risk flags to check (at minimum):
1. Missing lead-based paint disclosure (pre-1978 buildings)
2. Missing/unclear security deposit return terms
3. Excessive or unclear late fees
4. One-sided maintenance responsibilities
5. Missing/insufficient entry notice requirements
6. Missing subletting/assignment clauses
7. Unusual or unfair terms vs standard leases
8. Missing dispute resolution procedures
9. Automatic renewal clauses with inadequate notice
10. Excessive penalty clauses
11. Waiver of tenant legal rights
12. Missing habitability guarantees

Health score guidelines:
- Financial Fairness (25 pts): Reasonable rent/fees, no hidden costs, legal deposit
- Legal Compliance (25 pts): Meets legal requirements, proper disclosures
- Tenant Protection (25 pts): Adequate rights, proper notice, fair termination
- Completeness (25 pts): All standard clauses present, clear language

IMPORTANT:
- For dates, use YYYY-MM-DD format
- For monetary values, use numbers only (no currency symbols)
- If a field cannot be found, set it to null
- Be thorough — identify ALL risks and missing protections
- Provide actionable, specific recommendations
- Return ONLY valid JSON
"""

            # Generate content with the PDF using proper Content/Part structure
            response = self.client.models.generate_content(
                model="gemini-2.0-flash",
                contents=[
                    types.Content(
                        role="user",
                        parts=[
                            file_part,
                            types.Part.from_text(text=prompt_text)
                        ]
                    )
                ]
            )

            # Parse the response
            response_text = response.text
            
            # Extract JSON from markdown code blocks if present
            import json
            import re
            
            # Try to extract JSON from code blocks
            json_match = re.search(r'```json\s*(.*?)\s*```', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(1)
            else:
                # Fallback: try to find JSON-like structure
                json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
                if json_match:
                    json_str = json_match.group(0)
                else:
                    raise ValueError("Could not extract JSON from Gemini response")

            # Parse JSON
            try:
                result = json.loads(json_str)
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse JSON from Gemini: {e}")
                logger.error(f"Response text: {response_text}")
                raise ValueError(f"Failed to parse JSON from Gemini response: {e}")

            # Validate structure
            if "extracted_data" not in result:
                raise ValueError("Gemini response missing 'extracted_data' field")

            extracted_data = result["extracted_data"]
            full_text = result.get("full_text", "")

            # Ensure all expected fields are present
            expected_fields = [
                "tenant_name", "landlord_name", "property_address",
                "monthly_rent", "security_deposit", "lease_start_date",
                "lease_end_date", "renewal_notice_days", "pet_policy",
                "late_fee_terms", "risk_flags",
                "financial_analysis", "rights_obligations",
                "missing_protections", "health_score", "action_items"
            ]
            
            for field in expected_fields:
                if field not in extracted_data:
                    extracted_data[field] = None

            # Clean up risk_flags if not a list
            if not isinstance(extracted_data.get("risk_flags"), list):
                extracted_data["risk_flags"] = []

            # Clean up missing_protections if not a list
            if not isinstance(extracted_data.get("missing_protections"), list):
                extracted_data["missing_protections"] = []

            logger.info(f"Successfully extracted data from PDF using Gemini")
            
            # Build source map using text matching
            source_map = self._build_source_map(full_text, extracted_data)
            
            return {
                "extracted_data": extracted_data,
                "full_text": full_text,
                "source_blocks": [],  # Gemini doesn't provide coordinate info
                "pages_meta": [],  # Gemini doesn't provide page metadata
                "source_map": source_map
            }

        except Exception as e:
            logger.error(f"Gemini PDF analysis error: {e}")
            raise ValueError(f"Failed to analyze PDF with Gemini: {e}")

    def _build_source_map(self, full_text: str, extracted_data: dict) -> dict:
        """Build source_map by finding extracted values in the full text."""
        import re
        source_map = {}
        
        # Split text into pages (approximate: ~3000 chars per page)
        page_size = 3000
        pages = [full_text[i:i+page_size] for i in range(0, len(full_text), page_size)]
        
        field_searches = {}
        if extracted_data.get("tenant_name"):
            field_searches["tenant_name"] = extracted_data["tenant_name"]
        if extracted_data.get("landlord_name"):
            field_searches["landlord_name"] = extracted_data["landlord_name"]
        if extracted_data.get("property_address"):
            field_searches["property_address"] = extracted_data["property_address"]
        if extracted_data.get("monthly_rent"):
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
            search_lower = str(search_value).lower()
            for page_idx, page_text in enumerate(pages):
                if search_lower in page_text.lower():
                    source_map[field_name] = [{
                        "page": page_idx,
                        "bbox": {"x0": 72, "y0": 200, "x1": 540, "y1": 220},
                        "matched_text": search_value,
                        "match_type": "text_search"
                    }]
                    break
        
        return source_map

    def get_page_image(self, pdf_bytes: bytes, page_num: int, dpi: int = 150) -> bytes:
        """
        Render a specific PDF page as a PNG image using PyMuPDF (for viewing).
        This is kept for the PDF viewer functionality, not for text extraction.

        Args:
            pdf_bytes: Raw PDF file bytes
            page_num: Zero-based page number
            dpi: Resolution for rendering

        Returns:
            PNG image bytes
        """
        try:
            import fitz  # PyMuPDF - still needed for page rendering
            
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            if page_num >= len(doc):
                raise ValueError(f"Page {page_num} does not exist (total pages: {len(doc)})")

            page = doc[page_num]
            zoom = dpi / 72
            mat = fitz.Matrix(zoom, zoom)
            pix = page.get_pixmap(matrix=mat)
            img_bytes = pix.tobytes("png")
            doc.close()
            return img_bytes

        except ImportError:
            # If PyMuPDF is not installed, return an error
            raise ValueError("PDF rendering requires PyMuPDF. Install with: pip install PyMuPDF")
        except Exception as e:
            logger.error(f"Page rendering error: {e}")
            raise ValueError(f"Failed to render PDF page: {e}")

    def get_page_count(self, pdf_bytes: bytes) -> int:
        """
        Get the number of pages in a PDF.

        Args:
            pdf_bytes: Raw PDF file bytes

        Returns:
            Number of pages
        """
        try:
            import fitz  # PyMuPDF
            
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            page_count = len(doc)
            doc.close()
            return page_count

        except ImportError:
            # If PyMuPDF is not installed, return 1 as fallback
            logger.warning("PyMuPDF not available, returning default page count of 1")
            return 1
        except Exception as e:
            logger.error(f"Page count error: {e}")
            return 1