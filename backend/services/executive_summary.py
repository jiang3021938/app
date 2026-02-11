"""
Executive Summary Service.

Generates a concise, professional AI summary for a lease report.
"""

import json
import logging
from typing import Dict, Any, List
from services.aihub import AIHubService
from schemas.aihub import GenTxtRequest, ChatMessage

logger = logging.getLogger(__name__)

SUMMARY_PROMPT = """You are a senior real estate analyst writing a concise executive summary for a lease review report.

Based on the following lease data, compliance results, and risk flags, write a brief executive summary (3-5 sentences).

Include:
- Overall assessment of the lease quality (excellent/good/fair/needs attention)
- Key financial terms at a glance
- Most important risk or compliance issue (if any)
- One specific actionable recommendation

Also calculate a health score from 0-100 based on:
- Start at 100
- Deduct 15 per high risk, 8 per medium risk, 3 per low risk
- Deduct 12 per compliance violation, 5 per warning
- Deduct 3 per missing important field (tenant_name, landlord_name, property_address, monthly_rent, security_deposit, lease_start_date, lease_end_date, pet_policy, late_fee_terms)

Return ONLY valid JSON:
{
  "health_score": 0-100,
  "grade": "A+|A|B+|B|C+|C|D|F",
  "summary": "3-5 sentence executive summary text",
  "key_highlights": ["highlight 1", "highlight 2", "highlight 3"],
  "top_action": "Single most important recommended action"
}

Lease Data:
"""


class ExecutiveSummaryService:
    """Generates AI executive summaries for lease reports."""

    def __init__(self):
        self.ai_service = AIHubService()

    async def generate_summary(
        self,
        extraction_data: Dict[str, Any],
        compliance_data: Dict[str, Any] = None,
        risk_flags: List[Dict] = None,
    ) -> Dict[str, Any]:
        try:
            context = {
                "extraction": {
                    k: v for k, v in extraction_data.items()
                    if k in (
                        "tenant_name", "landlord_name", "property_address",
                        "monthly_rent", "security_deposit", "lease_start_date",
                        "lease_end_date", "pet_policy", "late_fee_terms",
                        "renewal_notice_days",
                    )
                },
                "risk_flags": risk_flags or [],
                "compliance_summary": compliance_data.get("summary") if compliance_data else None,
                "compliance_violations": [
                    c for c in (compliance_data or {}).get("compliance_checks", [])
                    if c.get("status") == "violation"
                ],
            }

            request = GenTxtRequest(
                messages=[
                    ChatMessage(
                        role="system",
                        content="You are a real estate analyst. Write concise, professional summaries. Always respond with valid JSON only.",
                    ),
                    ChatMessage(
                        role="user",
                        content=SUMMARY_PROMPT + json.dumps(context, indent=2, default=str),
                    ),
                ],
                model="gpt-5-chat",
                max_tokens=1000,
            )

            response = await self.ai_service.gentxt(request)

            content = response.content.strip()
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]

            summary_data = json.loads(content.strip())
            return {"success": True, "data": summary_data}

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse summary response: {e}")
            return {"success": False, "error": "Failed to generate summary"}
        except Exception as e:
            logger.error(f"Executive summary error: {e}")
            return {"success": False, "error": str(e)}
