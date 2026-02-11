"""
Rent Benchmarking Service.

Provides market rent comparison data based on property address.
Uses a built-in dataset for common US metros; can be extended to use
external APIs (Zillow, RentCast, etc.) in production.
"""

import logging
import re
import random
from typing import Dict, Any, Optional, Tuple

logger = logging.getLogger(__name__)

# Built-in median rent data by metro area (2025 estimates, 1BR/2BR/3BR)
# In production, replace with real-time API calls to Zillow/RentCast
METRO_RENT_DATA = {
    "new york": {"city": "New York, NY", "1br": 3200, "2br": 4100, "3br": 5200, "yoy_change": 3.2},
    "manhattan": {"city": "Manhattan, NY", "1br": 3800, "2br": 5200, "3br": 7000, "yoy_change": 2.8},
    "brooklyn": {"city": "Brooklyn, NY", "1br": 2900, "2br": 3600, "3br": 4500, "yoy_change": 4.1},
    "los angeles": {"city": "Los Angeles, CA", "1br": 2400, "2br": 3100, "3br": 4000, "yoy_change": 2.5},
    "san francisco": {"city": "San Francisco, CA", "1br": 3000, "2br": 3900, "3br": 5000, "yoy_change": 1.8},
    "san jose": {"city": "San Jose, CA", "1br": 2800, "2br": 3500, "3br": 4400, "yoy_change": 2.1},
    "chicago": {"city": "Chicago, IL", "1br": 1800, "2br": 2200, "3br": 2800, "yoy_change": 3.5},
    "houston": {"city": "Houston, TX", "1br": 1200, "2br": 1500, "3br": 1900, "yoy_change": 2.0},
    "dallas": {"city": "Dallas, TX", "1br": 1400, "2br": 1800, "3br": 2200, "yoy_change": 1.5},
    "austin": {"city": "Austin, TX", "1br": 1500, "2br": 1900, "3br": 2400, "yoy_change": -1.2},
    "phoenix": {"city": "Phoenix, AZ", "1br": 1300, "2br": 1600, "3br": 2000, "yoy_change": 1.0},
    "philadelphia": {"city": "Philadelphia, PA", "1br": 1600, "2br": 2000, "3br": 2500, "yoy_change": 2.8},
    "san antonio": {"city": "San Antonio, TX", "1br": 1100, "2br": 1400, "3br": 1700, "yoy_change": 1.5},
    "san diego": {"city": "San Diego, CA", "1br": 2200, "2br": 2800, "3br": 3500, "yoy_change": 3.0},
    "seattle": {"city": "Seattle, WA", "1br": 2100, "2br": 2700, "3br": 3400, "yoy_change": 2.2},
    "denver": {"city": "Denver, CO", "1br": 1700, "2br": 2100, "3br": 2600, "yoy_change": 0.5},
    "boston": {"city": "Boston, MA", "1br": 2600, "2br": 3200, "3br": 4000, "yoy_change": 3.8},
    "nashville": {"city": "Nashville, TN", "1br": 1500, "2br": 1800, "3br": 2200, "yoy_change": 2.0},
    "portland": {"city": "Portland, OR", "1br": 1600, "2br": 2000, "3br": 2500, "yoy_change": 0.8},
    "miami": {"city": "Miami, FL", "1br": 2200, "2br": 2900, "3br": 3600, "yoy_change": 4.5},
    "atlanta": {"city": "Atlanta, GA", "1br": 1500, "2br": 1800, "3br": 2200, "yoy_change": 2.5},
    "washington": {"city": "Washington, DC", "1br": 2200, "2br": 2800, "3br": 3500, "yoy_change": 2.0},
    "minneapolis": {"city": "Minneapolis, MN", "1br": 1400, "2br": 1700, "3br": 2100, "yoy_change": 1.5},
    "tampa": {"city": "Tampa, FL", "1br": 1600, "2br": 2000, "3br": 2400, "yoy_change": 3.0},
    "orlando": {"city": "Orlando, FL", "1br": 1500, "2br": 1900, "3br": 2300, "yoy_change": 2.8},
    "detroit": {"city": "Detroit, MI", "1br": 1000, "2br": 1200, "3br": 1500, "yoy_change": 4.0},
    "las vegas": {"city": "Las Vegas, NV", "1br": 1300, "2br": 1600, "3br": 2000, "yoy_change": 1.2},
    "charlotte": {"city": "Charlotte, NC", "1br": 1400, "2br": 1700, "3br": 2100, "yoy_change": 2.5},
    "raleigh": {"city": "Raleigh, NC", "1br": 1400, "2br": 1700, "3br": 2100, "yoy_change": 2.0},
    "sacramento": {"city": "Sacramento, CA", "1br": 1600, "2br": 2000, "3br": 2500, "yoy_change": 1.8},
}

# National average for fallback
NATIONAL_AVERAGE = {"city": "US National Average", "1br": 1550, "2br": 1950, "3br": 2450, "yoy_change": 2.0}


class RentBenchmarkService:
    """Provides market rent benchmarking based on property address."""

    def _extract_city(self, address: str) -> Optional[str]:
        """Extract city name from address for metro matching."""
        if not address:
            return None
        addr_lower = address.lower().strip()
        # Try direct metro match
        for metro_key in METRO_RENT_DATA:
            if metro_key in addr_lower:
                return metro_key
        # Try extracting city from "City, ST ZIPCODE" pattern
        match = re.search(r"([a-zA-Z\s]+),\s*[A-Z]{2}", address)
        if match:
            city = match.group(1).strip().lower()
            if city in METRO_RENT_DATA:
                return city
        return None

    def _estimate_bedrooms(self, monthly_rent: float, metro_data: Dict) -> Tuple[str, float]:
        """Estimate bedroom count based on rent vs metro medians."""
        if not monthly_rent:
            return "2br", metro_data["2br"]

        # Find closest match
        diffs = {
            "1br": abs(monthly_rent - metro_data["1br"]),
            "2br": abs(monthly_rent - metro_data["2br"]),
            "3br": abs(monthly_rent - metro_data["3br"]),
        }
        best = min(diffs, key=diffs.get)
        return best, metro_data[best]

    def get_benchmark(
        self, property_address: str, monthly_rent: float = None
    ) -> Dict[str, Any]:
        """
        Get rent benchmark data for a property.

        Args:
            property_address: Full property address
            monthly_rent: Current monthly rent for comparison

        Returns:
            Benchmark data with market comparison
        """
        city_key = self._extract_city(property_address)

        if city_key and city_key in METRO_RENT_DATA:
            metro = METRO_RENT_DATA[city_key]
            data_source = "metro"
        else:
            metro = NATIONAL_AVERAGE
            data_source = "national"

        result = {
            "market_area": metro["city"],
            "data_source": data_source,
            "median_rents": {
                "1br": metro["1br"],
                "2br": metro["2br"],
                "3br": metro["3br"],
            },
            "yoy_change_percent": metro["yoy_change"],
            "data_note": (
                "Based on metro-area median rents (2025 estimates)."
                if data_source == "metro"
                else "Using national averages. Metro-specific data not available for this address."
            ),
        }

        # Add comparison if rent is provided
        if monthly_rent and monthly_rent > 0:
            est_type, median = self._estimate_bedrooms(monthly_rent, metro)
            diff = monthly_rent - median
            diff_pct = (diff / median * 100) if median > 0 else 0

            if diff_pct > 10:
                assessment = "above_market"
                assessment_text = f"Your rent is {abs(diff_pct):.1f}% above the estimated market median"
            elif diff_pct < -10:
                assessment = "below_market"
                assessment_text = f"Your rent is {abs(diff_pct):.1f}% below the estimated market median"
            else:
                assessment = "at_market"
                assessment_text = f"Your rent is within {abs(diff_pct):.1f}% of the estimated market median"

            result["comparison"] = {
                "your_rent": monthly_rent,
                "estimated_type": est_type,
                "market_median": median,
                "difference": round(diff, 2),
                "difference_percent": round(diff_pct, 1),
                "assessment": assessment,
                "assessment_text": assessment_text,
            }

            # Projected rent at renewal
            if metro["yoy_change"] > 0:
                projected = monthly_rent * (1 + metro["yoy_change"] / 100)
                result["projection"] = {
                    "next_year_estimate": round(projected, 2),
                    "annual_increase": round(projected - monthly_rent, 2),
                    "note": f"Based on {metro['yoy_change']}% YoY trend in {metro['city']}",
                }

        return result
