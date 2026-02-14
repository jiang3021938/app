import logging
from typing import Dict, Any, List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from models.state_regulations import State_regulations

logger = logging.getLogger(__name__)

# State code mapping from common address patterns (all 50 US states + DC)
STATE_MAPPINGS = {
    "alabama": "AL", "al": "AL",
    "alaska": "AK", "ak": "AK",
    "arizona": "AZ", "az": "AZ",
    "arkansas": "AR", "ar": "AR",
    "california": "CA", "ca": "CA",
    "colorado": "CO", "co": "CO",
    "connecticut": "CT", "ct": "CT",
    "delaware": "DE", "de": "DE",
    "district of columbia": "DC", "dc": "DC",
    "florida": "FL", "fl": "FL",
    "georgia": "GA", "ga": "GA",
    "hawaii": "HI", "hi": "HI",
    "idaho": "ID", "id": "ID",
    "illinois": "IL", "il": "IL",
    "indiana": "IN", "in": "IN",
    "iowa": "IA", "ia": "IA",
    "kansas": "KS", "ks": "KS",
    "kentucky": "KY", "ky": "KY",
    "louisiana": "LA", "la": "LA",
    "maine": "ME", "me": "ME",
    "maryland": "MD", "md": "MD",
    "massachusetts": "MA", "ma": "MA",
    "michigan": "MI", "mi": "MI",
    "minnesota": "MN", "mn": "MN",
    "mississippi": "MS", "ms": "MS",
    "missouri": "MO", "mo": "MO",
    "montana": "MT", "mt": "MT",
    "nebraska": "NE", "ne": "NE",
    "nevada": "NV", "nv": "NV",
    "new hampshire": "NH", "nh": "NH",
    "new jersey": "NJ", "nj": "NJ",
    "new mexico": "NM", "nm": "NM",
    "new york": "NY", "ny": "NY",
    "north carolina": "NC", "nc": "NC",
    "north dakota": "ND", "nd": "ND",
    "ohio": "OH", "oh": "OH",
    "oklahoma": "OK", "ok": "OK",
    "oregon": "OR", "or": "OR",
    "pennsylvania": "PA", "pa": "PA",
    "rhode island": "RI", "ri": "RI",
    "south carolina": "SC", "sc": "SC",
    "south dakota": "SD", "sd": "SD",
    "tennessee": "TN", "tn": "TN",
    "texas": "TX", "tx": "TX",
    "utah": "UT", "ut": "UT",
    "vermont": "VT", "vt": "VT",
    "virginia": "VA", "va": "VA",
    "washington": "WA", "wa": "WA",
    "west virginia": "WV", "wv": "WV",
    "wisconsin": "WI", "wi": "WI",
    "wyoming": "WY", "wy": "WY",
}

ALL_STATE_CODES = set(STATE_MAPPINGS.values())

class ComplianceChecker:
    """Service for checking lease compliance against state regulations"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    def extract_state_from_address(self, address: str) -> Optional[str]:
        """Extract state code from property address"""
        if not address:
            return None
        
        address_lower = address.lower()
        
        # Try to find state code or name in address
        for state_name, state_code in STATE_MAPPINGS.items():
            if state_name in address_lower:
                return state_code
        
        # Try to find 2-letter state code at end of address
        parts = address.replace(",", " ").split()
        for part in reversed(parts):
            if len(part) == 2 and part.upper() in ALL_STATE_CODES:
                return part.upper()
        
        return None
    
    async def get_state_regulations(self, state_code: str) -> List[Dict[str, Any]]:
        """Get all regulations for a specific state"""
        try:
            result = await self.db.execute(
                select(State_regulations).where(State_regulations.state_code == state_code)
            )
            regulations = result.scalars().all()
            
            return [
                {
                    "id": reg.id,
                    "state_code": reg.state_code,
                    "state_name": reg.state_name,
                    "category": reg.regulation_category,
                    "title": reg.regulation_title,
                    "content": reg.regulation_content,
                    "max_amount": reg.max_amount,
                    "max_multiplier": reg.max_multiplier,
                    "required_days": reg.required_days,
                    "source_url": reg.source_url
                }
                for reg in regulations
            ]
        except Exception as e:
            logger.error(f"Error fetching regulations: {e}")
            return []
    
    async def check_compliance(self, extraction_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Check lease data against state regulations
        
        Args:
            extraction_data: Extracted lease data including property_address, monthly_rent, etc.
            
        Returns:
            Compliance report with checks and recommendations
        """
        result = {
            "state_code": None,
            "state_name": None,
            "regulations_found": False,
            "compliance_checks": [],
            "overall_status": "unknown"
        }
        
        # Extract state from address
        property_address = extraction_data.get("property_address", "")
        state_code = self.extract_state_from_address(property_address)
        
        if not state_code:
            result["overall_status"] = "state_not_identified"
            result["compliance_checks"].append({
                "category": "State Identification",
                "status": "warning",
                "title": "State Not Identified",
                "description": "Could not identify the state from the property address. Please verify the address is complete.",
                "recommendation": "Ensure the property address includes the state name or abbreviation."
            })
            return result
        
        result["state_code"] = state_code
        
        # Get regulations for the state
        regulations = await self.get_state_regulations(state_code)
        
        if not regulations:
            result["overall_status"] = "no_regulations"
            result["compliance_checks"].append({
                "category": "Regulations",
                "status": "info",
                "title": "No Regulations Found",
                "description": f"No specific regulations found for {state_code}. This doesn't mean there are no regulations - our database may not cover this state yet.",
                "recommendation": "Consult with a local attorney for state-specific requirements."
            })
            return result
        
        result["regulations_found"] = True
        result["state_name"] = regulations[0].get("state_name", state_code)
        
        monthly_rent = extraction_data.get("monthly_rent")
        security_deposit = extraction_data.get("security_deposit")
        renewal_notice_days = extraction_data.get("renewal_notice_days")
        late_fee_terms = extraction_data.get("late_fee_terms", "")
        
        compliant_count = 0
        warning_count = 0
        violation_count = 0
        
        for reg in regulations:
            check = {
                "category": reg["category"],
                "title": reg["title"],
                "regulation": reg["content"],
                "source_url": reg["source_url"],
                "status": "info",
                "description": "",
                "recommendation": ""
            }
            
            # Security Deposit Limit Check
            if reg["category"] == "security_deposit_limit" and security_deposit and monthly_rent:
                max_multiplier = reg.get("max_multiplier")
                if max_multiplier:
                    max_allowed = monthly_rent * max_multiplier
                    if security_deposit > max_allowed:
                        check["status"] = "violation"
                        check["description"] = f"Your security deposit (${security_deposit:,.2f}) exceeds the state maximum of {max_multiplier}x monthly rent (${max_allowed:,.2f})."
                        check["recommendation"] = f"Consider reducing the security deposit to ${max_allowed:,.2f} or less to comply with {result['state_name']} law."
                        violation_count += 1
                    else:
                        check["status"] = "compliant"
                        check["description"] = f"Your security deposit (${security_deposit:,.2f}) is within the state limit of {max_multiplier}x monthly rent (${max_allowed:,.2f})."
                        compliant_count += 1
                else:
                    check["status"] = "info"
                    check["description"] = f"{result['state_name']} has no statutory limit on security deposits."
            
            # Security Deposit Return Period Check
            elif reg["category"] == "security_deposit_return":
                required_days = reg.get("required_days")
                if required_days:
                    check["status"] = "info"
                    check["description"] = f"Landlord must return the security deposit within {required_days} days after move-out."
                    check["recommendation"] = "Ensure your lease specifies the deposit return timeline and complies with this requirement."
            
            # Late Fee Check
            elif reg["category"] == "late_fee_limit":
                max_amount = reg.get("max_amount")
                max_multiplier = reg.get("max_multiplier")
                
                if max_amount or max_multiplier:
                    check["status"] = "warning"
                    if max_amount and monthly_rent:
                        max_fee = min(max_amount, monthly_rent * max_multiplier) if max_multiplier else max_amount
                        check["description"] = f"Late fees are capped at ${max_fee:,.2f} in {result['state_name']}."
                    elif max_multiplier and monthly_rent:
                        max_fee = monthly_rent * max_multiplier
                        check["description"] = f"Late fees are capped at {max_multiplier*100:.0f}% of rent (${max_fee:,.2f}) in {result['state_name']}."
                    check["recommendation"] = "Review your lease's late fee terms to ensure compliance."
                    warning_count += 1
                else:
                    check["status"] = "info"
                    check["description"] = f"{result['state_name']} has no statutory limit on late fees, but they must be reasonable."
            
            # Notice to Vacate Check
            elif reg["category"] == "notice_to_vacate":
                required_days = reg.get("required_days")
                if required_days:
                    check["status"] = "info"
                    check["description"] = f"For month-to-month tenancies, {required_days} days notice is required to terminate."
                    check["recommendation"] = "Ensure your lease specifies the notice period and complies with state requirements."
            
            # Rent Increase Notice Check
            elif reg["category"] == "rent_increase_notice":
                required_days = reg.get("required_days")
                if required_days:
                    check["status"] = "info"
                    check["description"] = f"Landlord must give {required_days} days notice before increasing rent."
                    check["recommendation"] = "Plan rent increases with adequate notice to comply with state law."
                else:
                    check["status"] = "info"
                    check["description"] = f"{result['state_name']} has no statutory requirement for rent increase notice."
            
            result["compliance_checks"].append(check)
        
        # Determine overall status
        if violation_count > 0:
            result["overall_status"] = "violations_found"
        elif warning_count > 0:
            result["overall_status"] = "warnings_found"
        elif compliant_count > 0:
            result["overall_status"] = "compliant"
        else:
            result["overall_status"] = "review_recommended"
        
        result["summary"] = {
            "compliant": compliant_count,
            "warnings": warning_count,
            "violations": violation_count,
            "info": len(result["compliance_checks"]) - compliant_count - warning_count - violation_count
        }
        
        return result