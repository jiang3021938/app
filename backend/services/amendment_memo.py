"""
Amendment Memo Generator Service.

Uses AI to generate a professional "Modification Suggestions Memo" based on
extracted lease data and risk flags. Outputs structured JSON that the frontend
can render or that can be converted to PDF/Word.
"""

import json
import logging
from typing import Dict, Any, List
from services.aihub import AIHubService
from schemas.aihub import GenTxtRequest, ChatMessage

logger = logging.getLogger(__name__)

MEMO_PROMPT = """You are an expert real estate attorney drafting a professional Amendment Memo 
for a landlord reviewing a lease agreement. Based on the following lease data and identified risks, 
generate a structured memo with specific, actionable modification suggestions.

For EACH risk or problematic clause, provide:
1. The current issue
2. Suggested replacement language (specific legal wording)
3. Brief justification for the change
4. A negotiation tip for discussing this with the other party

Also add general improvement suggestions even if no risks were flagged.

Return ONLY valid JSON in this format:
{
  "memo_title": "Lease Amendment Suggestions Memo",
  "property_address": "...",
  "prepared_date": "YYYY-MM-DD",
  "executive_summary": "Brief overview of findings and key recommendations (2-3 sentences)",
  "risk_level": "low|medium|high",
  "amendments": [
    {
      "priority": "high|medium|low",
      "category": "e.g., Security Deposit, Late Fees, Maintenance",
      "current_issue": "Description of the current problematic clause or missing item",
      "suggested_language": "Specific replacement or additional clause wording",
      "justification": "Why this change is recommended",
      "negotiation_tip": "How to discuss this with the landlord/tenant"
    }
  ],
  "general_recommendations": [
    "General improvement suggestion not tied to a specific risk"
  ],
  "disclaimer": "This memo is for informational purposes only and does not constitute legal advice. Consult a licensed attorney before making changes to your lease agreement."
}

Lease Data:
"""


class AmendmentMemoService:
    """Generates professional amendment memos from lease analysis results."""

    def __init__(self):
        self.ai_service = AIHubService()

    async def generate_memo(
        self,
        extraction_data: Dict[str, Any],
        compliance_data: Dict[str, Any] = None,
        risk_flags: List[Dict] = None,
    ) -> Dict[str, Any]:
        """
        Generate an amendment memo based on extracted lease data.

        Args:
            extraction_data: Extracted lease fields
            compliance_data: Compliance check results
            risk_flags: List of identified risk flags

        Returns:
            Structured memo data
        """
        try:
            # Build context for AI
            context = {
                "tenant_name": extraction_data.get("tenant_name"),
                "landlord_name": extraction_data.get("landlord_name"),
                "property_address": extraction_data.get("property_address"),
                "monthly_rent": extraction_data.get("monthly_rent"),
                "security_deposit": extraction_data.get("security_deposit"),
                "lease_start_date": extraction_data.get("lease_start_date"),
                "lease_end_date": extraction_data.get("lease_end_date"),
                "pet_policy": extraction_data.get("pet_policy"),
                "late_fee_terms": extraction_data.get("late_fee_terms"),
                "renewal_notice_days": extraction_data.get("renewal_notice_days"),
            }

            if risk_flags:
                context["identified_risks"] = risk_flags

            if compliance_data:
                checks = compliance_data.get("compliance_checks", [])
                violations = [c for c in checks if c.get("status") == "violation"]
                warnings = [c for c in checks if c.get("status") == "warning"]
                context["compliance_violations"] = violations
                context["compliance_warnings"] = warnings
                context["state_code"] = compliance_data.get("state_code")

            request = GenTxtRequest(
                messages=[
                    ChatMessage(
                        role="system",
                        content="You are a real estate legal consultant. Generate professional, actionable amendment memos. Always respond with valid JSON only.",
                    ),
                    ChatMessage(
                        role="user",
                        content=MEMO_PROMPT + json.dumps(context, indent=2, default=str),
                    ),
                ],
                model="gemini-3-pro-preview",
                max_tokens=4000,
            )

            response = await self.ai_service.gentxt(request)

            # Parse response
            content = response.content.strip()
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]

            memo_data = json.loads(content.strip())
            return {"success": True, "memo": memo_data}

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse memo response: {e}")
            return {"success": False, "error": "Failed to generate memo"}
        except Exception as e:
            logger.error(f"Amendment memo generation error: {e}")
            return {"success": False, "error": str(e)}
