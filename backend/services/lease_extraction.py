import logging
import json
from typing import Dict, Any, Optional
from services.aihub import AIHubService
from schemas.aihub import GenTxtRequest, ChatMessage

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
      "severity": "high|medium|low",
      "category": "Category name",
      "title": "Short title of the finding",
      "description": "Detailed description of what was found or what is missing",
      "recommendation": "Specific action the tenant/landlord should take"
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
You MUST check ALL of the following categories and include EACH ONE in risk_flags, even if the clause is present and satisfactory. This serves as a complete audit checklist for the user.

For each category:
- If the clause is present and adequate: severity = "low", describe what was found
- If the clause is present but has issues: severity = "medium", explain the concern
- If the clause is missing or seriously problematic: severity = "high", explain the risk

Categories to ALWAYS check and include:
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
- Return ONLY valid JSON, no markdown, no additional text
- ALWAYS include ALL 12 risk_flag categories listed above

Document text:
"""

class LeaseExtractionService:
    """Service for extracting data from lease documents using AI"""
    
    def __init__(self):
        self.ai_service = AIHubService()
    
    async def extract_lease_data(self, document_text: str) -> Dict[str, Any]:
        """
        Extract structured data from lease document text using AI
        """
        try:
            request = GenTxtRequest(
                messages=[
                    ChatMessage(role="system", content="You are a legal document analyzer specializing in residential lease agreements. Always respond with valid JSON only. Never wrap your response in markdown code blocks."),
                    ChatMessage(role="user", content=EXTRACTION_PROMPT + document_text)
                ],
                model="gemini-3-pro-preview"
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
        """Analyze extracted data for additional risks"""
        risks = extracted_data.get("risk_flags", [])
        
        if not extracted_data.get("security_deposit"):
            risks.append({
                "severity": "medium",
                "category": "Security Deposit",
                "title": "No security deposit specified",
                "description": "No security deposit amount specified in the lease",
                "recommendation": "Clarify security deposit terms with the landlord"
            })
        
        if not extracted_data.get("lease_end_date"):
            risks.append({
                "severity": "high",
                "category": "Lease Term",
                "title": "No lease end date",
                "description": "No lease end date specified - may be month-to-month or missing critical information",
                "recommendation": "Confirm the lease term and get a specific end date in writing"
            })
        
        if not extracted_data.get("renewal_notice_days"):
            risks.append({
                "severity": "medium",
                "category": "Renewal Terms",
                "title": "No renewal notice period",
                "description": "No renewal notice period specified",
                "recommendation": "Negotiate a specific renewal notice period to avoid automatic termination"
            })
        
        return risks


def generate_ics_content(extraction_data: Dict[str, Any], document_name: str) -> str:
    """Generate ICS calendar file content for lease important dates"""
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