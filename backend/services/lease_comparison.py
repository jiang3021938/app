"""
Lease Comparison Service.

Compares 2-3 lease extractions side by side and generates an AI-powered
comparative analysis with recommendations.
"""

import json
import logging
from typing import Dict, Any, List
from services.aihub import AIHubService
from schemas.aihub import GenTxtRequest, ChatMessage

logger = logging.getLogger(__name__)

COMPARISON_PROMPT = """You are an expert real estate advisor comparing multiple lease agreements 
for a landlord/tenant. Analyze the following leases and provide a detailed comparison.

For each comparison dimension, identify which lease is most favorable and why.

Return ONLY valid JSON in this format:
{
  "summary": "2-3 sentence executive summary of which lease is best overall and why",
  "best_overall": "lease_1 or lease_2 or lease_3",
  "best_overall_reason": "Brief explanation",
  "dimensions": [
    {
      "category": "e.g., Monthly Rent, Security Deposit, Pet Policy, etc.",
      "comparison": [
        {
          "lease_label": "Lease 1 label",
          "value": "The value/terms for this dimension",
          "score": 1-5
        }
      ],
      "winner": "lease_1 or lease_2",
      "analysis": "Why this one is better for this dimension"
    }
  ],
  "risk_comparison": {
    "lease_with_most_risks": "lease_1 or lease_2",
    "details": "Brief explanation of risk differences"
  },
  "recommendations": [
    "Actionable recommendation based on comparison"
  ]
}

Leases to compare:
"""


class LeaseComparisonService:
    """Compares multiple lease extractions."""

    def __init__(self):
        self.ai_service = AIHubService()

    def _build_comparison_table(self, extractions: List[Dict]) -> Dict[str, Any]:
        """Build a simple side-by-side data table without AI."""
        fields = [
            ("monthly_rent", "Monthly Rent", "currency"),
            ("security_deposit", "Security Deposit", "currency"),
            ("lease_start_date", "Lease Start", "date"),
            ("lease_end_date", "Lease End", "date"),
            ("renewal_notice_days", "Renewal Notice (days)", "number"),
            ("pet_policy", "Pet Policy", "text"),
            ("late_fee_terms", "Late Fee Terms", "text"),
        ]

        table = []
        for field_key, field_label, field_type in fields:
            row = {"field": field_label, "field_key": field_key, "type": field_type, "values": []}
            for ext in extractions:
                row["values"].append(ext.get(field_key))
            table.append(row)

        return {"table": table, "lease_count": len(extractions)}

    async def compare_leases(
        self, extractions: List[Dict[str, Any]], labels: List[str] = None
    ) -> Dict[str, Any]:
        """
        Compare multiple lease extractions.

        Args:
            extractions: List of extracted lease data dicts
            labels: Optional labels for each lease (e.g., ["123 Main St", "456 Oak Ave"])

        Returns:
            Comparison result with table and AI analysis
        """
        if len(extractions) < 2:
            return {"success": False, "error": "Need at least 2 leases to compare"}
        if len(extractions) > 3:
            extractions = extractions[:3]

        # Generate labels
        if not labels:
            labels = []
            for i, ext in enumerate(extractions):
                addr = ext.get("property_address", f"Lease {i + 1}")
                labels.append(addr[:50] if addr else f"Lease {i + 1}")

        # Build comparison table
        comparison_table = self._build_comparison_table(extractions)

        # Build AI context
        leases_context = []
        for i, (ext, label) in enumerate(zip(extractions, labels)):
            lease_info = {
                "lease_id": f"lease_{i + 1}",
                "label": label,
                "tenant_name": ext.get("tenant_name"),
                "landlord_name": ext.get("landlord_name"),
                "property_address": ext.get("property_address"),
                "monthly_rent": ext.get("monthly_rent"),
                "security_deposit": ext.get("security_deposit"),
                "lease_start_date": ext.get("lease_start_date"),
                "lease_end_date": ext.get("lease_end_date"),
                "renewal_notice_days": ext.get("renewal_notice_days"),
                "pet_policy": ext.get("pet_policy"),
                "late_fee_terms": ext.get("late_fee_terms"),
                "risk_flags": ext.get("risk_flags"),
            }
            leases_context.append(lease_info)

        try:
            request = GenTxtRequest(
                messages=[
                    ChatMessage(
                        role="system",
                        content="You are a real estate comparison analyst. Compare leases objectively. Always respond with valid JSON only.",
                    ),
                    ChatMessage(
                        role="user",
                        content=COMPARISON_PROMPT + json.dumps(leases_context, indent=2, default=str),
                    ),
                ],
                model="gpt-5-chat",
                max_tokens=4000,
            )

            response = await self.ai_service.gentxt(request)

            content = response.content.strip()
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]

            ai_analysis = json.loads(content.strip())

            return {
                "success": True,
                "labels": labels,
                "comparison_table": comparison_table,
                "ai_analysis": ai_analysis,
            }

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse comparison response: {e}")
            # Return table even if AI fails
            return {
                "success": True,
                "labels": labels,
                "comparison_table": comparison_table,
                "ai_analysis": None,
                "ai_error": "AI analysis failed, showing data comparison only",
            }
        except Exception as e:
            logger.error(f"Lease comparison error: {e}")
            return {"success": False, "error": str(e)}
