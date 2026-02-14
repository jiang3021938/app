"""
PDF Report Generator Service.

Generates a professional PDF report from lease analysis data using reportlab.
"""

import io
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.units import inch
    from reportlab.lib.colors import HexColor
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
    )
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
    HAS_REPORTLAB = True
except ImportError:
    HAS_REPORTLAB = False
    logger.warning("reportlab not installed – PDF export disabled")


# Colors
BLUE = "#2563eb"
DARK = "#1e293b"
GRAY = "#64748b"
LIGHT_BG = "#f8fafc"
GREEN = "#16a34a"
RED = "#dc2626"
AMBER = "#d97706"


class PDFReportGenerator:
    """Generates professional PDF reports from lease analysis."""

    def generate(
        self,
        extraction: Dict[str, Any],
        risk_flags: List[Dict] = None,
        compliance_data: Dict[str, Any] = None,
        benchmark_data: Dict[str, Any] = None,
        executive_summary: Dict[str, Any] = None,
    ) -> Optional[bytes]:
        """Generate a PDF report and return as bytes."""

        if not HAS_REPORTLAB:
            logger.error("reportlab not available")
            return None

        buf = io.BytesIO()
        doc = SimpleDocTemplate(
            buf, pagesize=letter,
            leftMargin=0.75 * inch, rightMargin=0.75 * inch,
            topMargin=0.6 * inch, bottomMargin=0.6 * inch,
        )

        styles = getSampleStyleSheet()
        # Custom styles
        styles.add(ParagraphStyle(
            "ReportTitle", parent=styles["Title"],
            fontSize=22, textColor=HexColor(DARK),
            spaceAfter=4, fontName="Helvetica-Bold",
        ))
        styles.add(ParagraphStyle(
            "ReportSubtitle", parent=styles["Normal"],
            fontSize=11, textColor=HexColor(GRAY), spaceAfter=16,
        ))
        styles.add(ParagraphStyle(
            "SectionHead", parent=styles["Heading2"],
            fontSize=14, textColor=HexColor(BLUE),
            spaceBefore=18, spaceAfter=8, fontName="Helvetica-Bold",
        ))
        styles.add(ParagraphStyle(
            "FieldLabel", parent=styles["Normal"],
            fontSize=9, textColor=HexColor(GRAY), spaceAfter=1,
        ))
        styles.add(ParagraphStyle(
            "FieldValue", parent=styles["Normal"],
            fontSize=11, textColor=HexColor(DARK), spaceAfter=8,
            fontName="Helvetica-Bold",
        ))
        styles.add(ParagraphStyle(
            "BodyText2", parent=styles["Normal"],
            fontSize=10, textColor=HexColor(DARK), spaceAfter=6,
        ))
        styles.add(ParagraphStyle(
            "SmallGray", parent=styles["Normal"],
            fontSize=8, textColor=HexColor(GRAY), spaceAfter=2,
        ))
        styles.add(ParagraphStyle(
            "GradeStyle", parent=styles["Normal"],
            fontSize=36, textColor=HexColor(BLUE), fontName="Helvetica-Bold",
            alignment=TA_CENTER,
        ))

        elements = []

        # ── Header ──────────────────────────────────
        elements.append(Paragraph("LeaseLens Analysis Report", styles["ReportTitle"]))
        property_addr = extraction.get("property_address", "Unknown Property")
        elements.append(Paragraph(
            f"{property_addr} &nbsp;|&nbsp; Generated {datetime.now(timezone.utc).strftime('%B %d, %Y')}",
            styles["ReportSubtitle"],
        ))
        elements.append(HRFlowable(width="100%", thickness=1, color=HexColor("#e2e8f0")))
        elements.append(Spacer(1, 12))

        # ── Executive Summary ───────────────────────
        if executive_summary and executive_summary.get("success"):
            sd = executive_summary["data"]
            score = sd.get("health_score", "—")
            grade = sd.get("grade", "—")
            summary_text = sd.get("summary", "")

            # Score + Grade row
            score_data = [
                [
                    Paragraph(f"Health Score: <b>{score}</b>/100", styles["BodyText2"]),
                    Paragraph(f"Grade: <b>{grade}</b>", styles["BodyText2"]),
                ],
            ]
            score_table = Table(score_data, colWidths=[3.5 * inch, 3.5 * inch])
            score_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), HexColor("#eff6ff")),
                ("BOX", (0, 0), (-1, -1), 0.5, HexColor("#bfdbfe")),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("LEFTPADDING", (0, 0), (-1, -1), 12),
            ]))
            elements.append(score_table)
            elements.append(Spacer(1, 8))

            if summary_text:
                elements.append(Paragraph(summary_text, styles["BodyText2"]))
            elements.append(Spacer(1, 6))

            # Key highlights
            highlights = sd.get("key_highlights", [])
            for h in highlights:
                elements.append(Paragraph(f"• {h}", styles["BodyText2"]))

            top_action = sd.get("top_action", "")
            if top_action:
                elements.append(Spacer(1, 4))
                elements.append(Paragraph(
                    f"<b>Recommended Action:</b> {top_action}", styles["BodyText2"]
                ))
            elements.append(Spacer(1, 8))

        # ── Key Terms ───────────────────────────────
        elements.append(Paragraph("Key Lease Terms", styles["SectionHead"]))

        terms = [
            ("Tenant", extraction.get("tenant_name", "—")),
            ("Landlord", extraction.get("landlord_name", "—")),
            ("Property", property_addr),
            ("Monthly Rent", f"${extraction.get('monthly_rent', 0):,.2f}" if extraction.get("monthly_rent") else "—"),
            ("Security Deposit", f"${extraction.get('security_deposit', 0):,.2f}" if extraction.get("security_deposit") else "—"),
            ("Lease Start", extraction.get("lease_start_date", "—")),
            ("Lease End", extraction.get("lease_end_date", "—")),
            ("Renewal Notice", f"{extraction.get('renewal_notice_days', '—')} days" if extraction.get("renewal_notice_days") else "—"),
            ("Pet Policy", extraction.get("pet_policy", "—")),
            ("Late Fee Terms", extraction.get("late_fee_terms", "—")),
        ]

        table_data = []
        for i in range(0, len(terms), 2):
            row = []
            for j in range(2):
                if i + j < len(terms):
                    label, value = terms[i + j]
                    cell = Paragraph(f"<font size=8 color='{GRAY}'>{label}</font><br/><b>{value}</b>", styles["BodyText2"])
                else:
                    cell = ""
                row.append(cell)
            table_data.append(row)

        t = Table(table_data, colWidths=[3.5 * inch, 3.5 * inch])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), HexColor(LIGHT_BG)),
            ("BOX", (0, 0), (-1, -1), 0.5, HexColor("#e2e8f0")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, HexColor("#e2e8f0")),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 12))

        # ── Risk Flags ──────────────────────────────
        if risk_flags:
            elements.append(Paragraph(f"Risk Analysis ({len(risk_flags)} items)", styles["SectionHead"]))
            for rf in risk_flags:
                sev = rf.get("severity", "info").upper()
                cat = rf.get("category", "General")
                desc = rf.get("description", "")
                color = RED if sev == "HIGH" else AMBER if sev == "MEDIUM" else GRAY
                elements.append(Paragraph(
                    f"<font color='{color}'><b>[{sev}]</b></font> <b>{cat}</b>: {desc}",
                    styles["BodyText2"],
                ))
            elements.append(Spacer(1, 8))

        # ── Compliance ──────────────────────────────
        if compliance_data and compliance_data.get("regulations_found"):
            checks = compliance_data.get("compliance_checks", [])
            elements.append(Paragraph(
                f"State Compliance — {compliance_data.get('state_name', '')}",
                styles["SectionHead"],
            ))
            for ck in checks:
                status = ck.get("status", "info")
                color = GREEN if status == "compliant" else RED if status == "violation" else AMBER if status == "warning" else GRAY
                icon = "✓" if status == "compliant" else "✗" if status == "violation" else "⚠" if status == "warning" else "ℹ"
                elements.append(Paragraph(
                    f"<font color='{color}'>{icon}</font> <b>{ck.get('title', '')}</b>: {ck.get('description', '')}",
                    styles["BodyText2"],
                ))
            elements.append(Spacer(1, 8))

        # ── Benchmark ───────────────────────────────
        if benchmark_data:
            elements.append(Paragraph("Rent Benchmarking", styles["SectionHead"]))
            comp = benchmark_data.get("comparison")
            if comp:
                elements.append(Paragraph(
                    f"Your rent: <b>${comp['your_rent']:,.0f}/mo</b> &nbsp;|&nbsp; "
                    f"Market median ({comp.get('estimated_type', '2br')}): <b>${comp['market_median']:,.0f}/mo</b> &nbsp;|&nbsp; "
                    f"Difference: <b>{comp['difference_percent']:+.1f}%</b>",
                    styles["BodyText2"],
                ))
                elements.append(Paragraph(comp.get("assessment_text", ""), styles["BodyText2"]))
            elements.append(Spacer(1, 8))

        # ── Footer ──────────────────────────────────
        elements.append(HRFlowable(width="100%", thickness=0.5, color=HexColor("#e2e8f0")))
        elements.append(Spacer(1, 6))
        elements.append(Paragraph(
            "This report is for informational purposes only and does not constitute legal advice. "
            "Consult a licensed attorney for guidance. Generated by LeaseLens.",
            styles["SmallGray"],
        ))

        doc.build(elements)
        return buf.getvalue()
