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
            prompt_text = """
            Analyze this lease agreement document and extract the following information.
            Return the response as a JSON object with these exact keys:
            
            {
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
                "risk_flags": ["List of potential issues or concerns found in the lease"]
            }
            
            For dates, use YYYY-MM-DD format.
            For rent and deposit, use numbers only (no currency symbols).
            If any field cannot be found, set it to null.
            Also provide the full extracted text for reference.
            
            Return your response in this format:
            ```json
            {
                "extracted_data": {...},
                "full_text": "Complete text extracted from the document"
            }
            ```
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
                "late_fee_terms", "risk_flags"
            ]
            
            for field in expected_fields:
                if field not in extracted_data:
                    extracted_data[field] = None

            # Clean up risk_flags if not a list
            if not isinstance(extracted_data.get("risk_flags"), list):
                extracted_data["risk_flags"] = []

            logger.info(f"Successfully extracted data from PDF using Gemini")
            return {
                "extracted_data": extracted_data,
                "full_text": full_text,
                "source_blocks": [],  # Gemini doesn't provide coordinate info
                "pages_meta": []  # Gemini doesn't provide page metadata
            }

        except Exception as e:
            logger.error(f"Gemini PDF analysis error: {e}")
            raise ValueError(f"Failed to analyze PDF with Gemini: {e}")

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