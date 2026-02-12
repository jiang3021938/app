import logging
import json
from typing import Dict, Any, Optional
from services.aihub import AIHubService
from schemas.aihub import GenTxtRequest, ChatMessage

logger = logging.getLogger(__name__)

EXTRACTION_PROMPT = """You are an expert lease agreement analyzer with deep knowledge of US residential tenancy laws. Perform a comprehensive analysis of the following lease document.

Return a JSON object with ALL of the following sections (use null for any field not found in the document):

{
  "tenant_name": "Full legal name of the tenant(s)",
  "landlord_name": "Full legal name of the landlord/property owner",
  "property_address": "Complete property address including unit number",
  "monthly_rent": 0.00,
  "security_deposit": 0.00,
  "lease_start_date": "YYYY-MM-DD",
  "lease_end_date": "YYYY-MM-DD",
  "renewal_notice_days": 30,
  "pet_policy": "Description of pet policy or 'Not specified'",
  "late_fee_terms": "Description of late fee terms or 'Not specified'",

  "financial_analysis": {
    "annualized_rent_cost": 0.00,
    "deposit_months_equivalent": 0.0,
    "deposit_legal_compliance": "Compliant / Exceeds typical limit / Cannot determine — explain based on common state limits (e.g. 1-2 months rent)",
    "rent_increase_clause": "Description of any rent escalation terms, or 'Not specified'",
    "rent_increase_assessment": "Reasonable / Above average / Concerning — with explanation",
    "hidden_fees": [
      {
        "fee_type": "e.g. Utilities, Maintenance, Insurance, Parking, Amenity, Admin",
        "description": "What the fee covers",
        "amount": "Amount or 'Variable'",
        "assessment": "Standard / Unusual / Potentially excessive"
      }
    ],
    "total_move_in_cost": 0.00
  },

  "rights_obligations": {
    "landlord_obligations": ["List of landlord responsibilities stated in the lease"],
    "tenant_obligations": ["List of tenant responsibilities stated in the lease"],
    "maintenance_division": {
      "landlord_responsible": ["Items landlord must maintain/repair"],
      "tenant_responsible": ["Items tenant must maintain/repair"],
      "unclear_items": ["Items with ambiguous responsibility"]
    },
    "entry_notice_requirement": "Required notice period for landlord entry, or 'Not specified'",
    "entry_notice_legal_compliance": "Compliant / Non-compliant / Not specified — based on typical 24-48 hour requirement",
    "subletting_policy": "Description of subletting/assignment terms, or 'Not specified'",
    "early_termination": "Terms for early lease termination, or 'Not specified'"
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
    "List of standard lease protections/clauses that are absent from this lease"
  ],

  "health_score": {
    "overall_score": 75,
    "grade": "A|B|C|D|F",
    "category_scores": {
      "financial_fairness": { "score": 0, "max": 25, "notes": "Brief explanation" },
      "legal_compliance": { "score": 0, "max": 25, "notes": "Brief explanation" },
      "tenant_protection": { "score": 0, "max": 25, "notes": "Brief explanation" },
      "completeness": { "score": 0, "max": 25, "notes": "Brief explanation" }
    },
    "summary": "One-paragraph overall assessment of the lease quality"
  },

  "action_items": {
    "negotiate_points": [
      {
        "item": "What to negotiate",
        "priority": "high|medium|low",
        "suggested_language": "Suggested clause wording"
      }
    ],
    "verify_before_signing": [
      "List of things tenant should confirm or verify before signing"
    ],
    "recommended_additions": [
      {
        "clause": "Name of recommended clause",
        "reason": "Why it should be added",
        "suggested_language": "Suggested wording"
      }
    ]
  }
}

Risk flags to check (at minimum):
1. Missing lead-based paint disclosure (required for pre-1978 buildings)
2. Missing or unclear security deposit return terms and timeline
3. Excessive or unclear late fee terms
4. Missing or one-sided maintenance responsibility clauses
5. Missing or insufficient entry notice requirements
6. Missing subletting/assignment clauses
7. Unusual or potentially unfair terms compared to standard leases
8. Missing dispute resolution procedures
9. Automatic renewal clauses with inadequate notice (auto-renew without adequate notice)
10. Excessive penalty clauses
11. Waiver of tenant legal rights
12. Missing habitability guarantees
13. Unreasonable insurance requirements
14. Vague or overbroad landlord discretion clauses

Health score guidelines:
- Financial Fairness (25 pts): Rent and fees are reasonable, no hidden costs, deposit within legal limits
- Legal Compliance (25 pts): Meets standard legal requirements, proper disclosures included
- Tenant Protection (25 pts): Adequate rights, proper notice periods, fair termination terms
- Completeness (25 pts): All standard clauses present, no ambiguous terms, clear language

IMPORTANT:
- Extract exact values from the document
- For dates, convert to YYYY-MM-DD format
- For monetary values, extract as numbers without currency symbols
- Be thorough in identifying ALL risks and missing protections
- Provide actionable, specific recommendations
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