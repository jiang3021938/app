import logging
import json
from typing import Dict, Any, Optional
from services.aihub import AIHubService
from schemas.aihub import GenTxtRequest, ChatMessage

logger = logging.getLogger(__name__)

EXTRACTION_PROMPT = """You are an expert lease agreement analyzer. Analyze the following lease document text and extract the key information.

Return a JSON object with the following fields (use null if not found):
{
  "tenant_name": "Full name of the tenant(s)",
  "landlord_name": "Full name of the landlord/property owner",
  "property_address": "Complete property address",
  "monthly_rent": 0.00,
  "security_deposit": 0.00,
  "lease_start_date": "YYYY-MM-DD",
  "lease_end_date": "YYYY-MM-DD",
  "renewal_notice_days": 30,
  "pet_policy": "Description of pet policy or 'Not specified'",
  "late_fee_terms": "Description of late fee terms or 'Not specified'",
  "risk_flags": [
    {
      "severity": "high|medium|low",
      "category": "Category name",
      "description": "Description of the risk or missing clause"
    }
  ]
}

Common risk flags to check for:
1. Missing lead-based paint disclosure (required for pre-1978 buildings)
2. Missing security deposit return terms
3. Unclear or missing late fee terms
4. Missing maintenance responsibility clauses
5. Missing entry notice requirements
6. Missing subletting/assignment clauses
7. Unusual or potentially unfair terms
8. Missing dispute resolution procedures

IMPORTANT: 
- Extract exact values from the document
- For dates, convert to YYYY-MM-DD format
- For monetary values, extract as numbers without currency symbols
- Identify ALL potential risks and missing standard clauses
- Return ONLY valid JSON, no additional text

Document text:
"""

class LeaseExtractionService:
    """Service for extracting data from lease documents using AI"""
    
    def __init__(self):
        self.ai_service = AIHubService()
    
    async def extract_lease_data(self, document_text: str) -> Dict[str, Any]:
        """
        Extract structured data from lease document text using AI
        
        Args:
            document_text: The text content of the lease document
            
        Returns:
            Dictionary containing extracted lease data and risk flags
        """
        try:
            request = GenTxtRequest(
                messages=[
                    ChatMessage(role="system", content="You are a legal document analyzer specializing in residential lease agreements. Always respond with valid JSON only."),
                    ChatMessage(role="user", content=EXTRACTION_PROMPT + document_text)
                ],
                model="gpt-5-chat"
            )
            
            response = await self.ai_service.gentxt(request)
            
            # Parse the JSON response
            try:
                # Try to extract JSON from the response
                content = response.content.strip()
                # Handle potential markdown code blocks
                if content.startswith("```json"):
                    content = content[7:]
                if content.startswith("```"):
                    content = content[3:]
                if content.endswith("```"):
                    content = content[:-3]
                
                extracted_data = json.loads(content.strip())
                return {
                    "success": True,
                    "data": extracted_data
                }
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse AI response as JSON: {e}")
                return {
                    "success": False,
                    "error": "Failed to parse extraction results",
                    "raw_response": response.content
                }
                
        except Exception as e:
            logger.error(f"Lease extraction error: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def analyze_risks(self, extracted_data: Dict[str, Any]) -> list:
        """
        Analyze extracted data for additional risks
        
        Args:
            extracted_data: Previously extracted lease data
            
        Returns:
            List of identified risk flags
        """
        risks = extracted_data.get("risk_flags", [])
        
        # Add additional programmatic risk checks
        if not extracted_data.get("security_deposit"):
            risks.append({
                "severity": "medium",
                "category": "Security Deposit",
                "description": "No security deposit amount specified in the lease"
            })
        
        if not extracted_data.get("lease_end_date"):
            risks.append({
                "severity": "high",
                "category": "Lease Term",
                "description": "No lease end date specified - may be month-to-month or missing critical information"
            })
        
        if not extracted_data.get("renewal_notice_days"):
            risks.append({
                "severity": "medium",
                "category": "Renewal Terms",
                "description": "No renewal notice period specified"
            })
        
        return risks


# Utility function to generate calendar events
def generate_ics_content(extraction_data: Dict[str, Any], document_name: str) -> str:
    """
    Generate ICS calendar file content for lease important dates
    
    Args:
        extraction_data: Extracted lease data
        document_name: Name of the document for event titles
        
    Returns:
        ICS file content as string
    """
    events = []
    
    # Lease end date reminder
    lease_end = extraction_data.get("lease_end_date")
    if lease_end:
        events.append({
            "summary": f"Lease Expires - {document_name}",
            "date": lease_end,
            "description": f"Your lease agreement expires on this date. Property: {extraction_data.get('property_address', 'N/A')}"
        })
        
        # Renewal notice reminder (default 60 days before if not specified)
        notice_days = extraction_data.get("renewal_notice_days", 60)
        if notice_days and lease_end:
            from datetime import datetime, timedelta
            try:
                end_date = datetime.strptime(lease_end, "%Y-%m-%d")
                notice_date = end_date - timedelta(days=notice_days)
                events.append({
                    "summary": f"Renewal Notice Deadline - {document_name}",
                    "date": notice_date.strftime("%Y-%m-%d"),
                    "description": f"Deadline to provide renewal notice ({notice_days} days before lease end)"
                })
            except ValueError:
                pass
    
    # Generate ICS content
    ics_lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//LeaseLens//Lease Calendar//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH"
    ]
    
    for i, event in enumerate(events):
        date_str = event["date"].replace("-", "")
        ics_lines.extend([
            "BEGIN:VEVENT",
            f"UID:leaselens-{i}-{date_str}@leaselens.ai",
            f"DTSTART;VALUE=DATE:{date_str}",
            f"DTEND;VALUE=DATE:{date_str}",
            f"SUMMARY:{event['summary']}",
            f"DESCRIPTION:{event['description']}",
            "END:VEVENT"
        ])
    
    ics_lines.append("END:VCALENDAR")
    
    return "\n".join(ics_lines)