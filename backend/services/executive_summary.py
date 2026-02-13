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

Return ONLY valid JSON (no markdown, no code blocks):
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
                        content="You are a real estate analyst. Write concise, professional summaries. Always respond with valid JSON only. Never use markdown code blocks.",
                    ),
                    ChatMessage(
                        role="user",
                        content=SUMMARY_PROMPT + json.dumps(context, indent=2, default=str),
                    ),
                ],
                model="gemini-3-pro-preview",
                max_tokens=2000,
            )

            response = await self.ai_service.gentxt(request)

            content = response.content.strip()

            # Remove markdown code blocks
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()

            # Try to extract valid JSON object using balanced brace matching
            start = content.find('{')
            if start != -1:
                depth = 0
                for i in range(start, len(content)):
                    if content[i] == '{':
                        depth += 1
                    elif content[i] == '}':
                        depth -= 1
                        if depth == 0:
                            content = content[start:i + 1]
                            break

            try:
                summary_data = json.loads(content)
                return {"success": True, "data": summary_data}
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse summary response: {e}")
                logger.error(f"Raw content: {content[:300]}")

                # Return a computed fallback instead of failing
                return {"success": True, "data": self._compute_fallback_summary(extraction_data, risk_flags, compliance_data)}

        except Exception as e:
            logger.error(f"Executive summary error: {e}")
            # Even on total failure, return a fallback
            return {"success": True, "data": self._compute_fallback_summary(extraction_data, risk_flags, compliance_data)}

    def _compute_fallback_summary(
        self,
        extraction_data: Dict[str, Any],
        risk_flags: List[Dict] = None,
        compliance_data: Dict[str, Any] = None,
    ) -> Dict[str, Any]:
        """Compute a basic summary without AI when API fails."""
        flags = risk_flags or []
        high_count = sum(1 for f in flags if isinstance(f, dict) and f.get("severity") == "high")
        medium_count = sum(1 for f in flags if isinstance(f, dict) and f.get("severity") == "medium")
        low_count = sum(1 for f in flags if isinstance(f, dict) and f.get("severity") == "low")

        # Calculate score
        score = 100 - (high_count * 15) - (medium_count * 8) - (low_count * 3)
        score = max(0, min(100, score))

        # Determine grade
        if score >= 90:
            grade = "A"
        elif score >= 80:
            grade = "B+"
        elif score >= 70:
            grade = "B"
        elif score >= 60:
            grade = "C+"
        elif score >= 50:
            grade = "C"
        else:
            grade = "D"

        # Build summary text
        rent = extraction_data.get("monthly_rent", "N/A")
        deposit = extraction_data.get("security_deposit", "N/A")
        start = extraction_data.get("lease_start_date", "N/A")
        end = extraction_data.get("lease_end_date", "N/A")

        summary_parts = []
        if score >= 80:
            summary_parts.append(f"The lease is in generally good condition with well-defined financial and operational terms.")
        elif score >= 60:
            summary_parts.append(f"The lease has adequate terms but several areas need attention.")
        else:
            summary_parts.append(f"The lease has significant gaps that should be addressed before signing.")

        summary_parts.append(f"Monthly rent is set at ${rent} with a security deposit of ${deposit}, spanning from {start} to {end}.")

        if high_count > 0:
            summary_parts.append(f"There are {high_count} high-priority issues that require immediate attention.")
        elif medium_count > 0:
            summary_parts.append(f"There are {medium_count} moderate issues worth reviewing.")

        highlights = []
        if rent:
            highlights.append(f"Monthly rent of ${rent} with ${deposit} security deposit")
        if extraction_data.get("late_fee_terms") and extraction_data["late_fee_terms"] != "Not specified":
            highlights.append("Late fee terms clearly defined")
        if start and end:
            highlights.append(f"Lease term from {start} to {end}")

        top_action = "Review the risk flags tab for detailed findings and recommendations."
        if high_count > 0:
            top_action = "Address high-priority risk items before signing the lease."

        return {
            "health_score": score,
            "grade": grade,
            "summary": " ".join(summary_parts),
            "key_highlights": highlights[:3],
            "top_action": top_action,
        }
