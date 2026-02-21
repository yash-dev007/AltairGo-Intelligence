"""
validation.py — ItineraryValidator

Validates and auto-corrects AI-generated itineraries before sending to the frontend.
Checks: budget accuracy, activity count, generic name detection, cost consistency.
"""

import os
import re

VALIDATION_STRICT = os.getenv("VALIDATION_STRICT", "true").lower() == "true"

# Generic names that indicate low-quality AI output
GENERIC_NAME_PATTERNS = [
    r'\blocal market\b', r'\bcity center\b', r'\bcentral park\b',
    r'\bbeach\b(?! \w)', r'\btemple\b(?! \w)', r'\bpark\b(?! \w)',
    r'\brestaurant\b(?! \w)', r'\bhotel\b(?! \w)', r'\bmuseum\b(?! \w)',
    r'\bfort\b(?! \w)', r'\bpalace\b(?! \w)', r'\bmarket\b(?! \w)',
]


class ItineraryValidator:
    """
    Validates AI-generated itinerary data and returns an adjusted result with warnings.
    """

    def __init__(self, itinerary_data: dict, preferences: dict):
        self.data = itinerary_data
        self.prefs = preferences
        self.warnings = []
        self.errors = []
        self.adjusted = False

    def validate(self) -> dict:
        """
        Run all validation checks and return a result dict:
        {
            "valid": bool,
            "warnings": [...],
            "errors": [...],
            "adjusted": bool,
            "data": { ...original or corrected itinerary... }
        }
        """
        if not isinstance(self.data, dict):
            return {
                "valid": False,
                "warnings": [],
                "errors": ["Itinerary data is not a valid object."],
                "adjusted": False,
                "data": self.data
            }

        self._check_budget()
        self._check_activity_counts()
        self._check_generic_names()
        self._check_cost_consistency()
        self._check_required_fields()

        valid = len(self.errors) == 0

        return {
            "valid": valid,
            "warnings": self.warnings,
            "errors": self.errors,
            "adjusted": self.adjusted,
            "data": self.data
        }

    # ────────────────────── Budget Check ──────────────────────

    def _check_budget(self):
        """Verify total_cost is within ±5% of user's budget. Auto-scale if needed."""
        user_budget = self.prefs.get('budget', 0)
        ai_cost = self.data.get('total_cost', 0)

        if not user_budget or not ai_cost:
            return

        tolerance = 0.05
        lower = user_budget * (1 - tolerance)
        upper = user_budget * (1 + tolerance)

        if ai_cost > upper:
            over_pct = round(((ai_cost - user_budget) / user_budget) * 100, 1)
            if VALIDATION_STRICT:
                # Auto-scale all costs down proportionally
                scale = user_budget / ai_cost
                self._scale_costs(scale)
                self.warnings.append(
                    f"AI estimated ₹{ai_cost:,} but your budget is ₹{user_budget:,} "
                    f"({over_pct}% over). Costs have been scaled down proportionally."
                )
                self.adjusted = True
            else:
                self.warnings.append(
                    f"Estimated cost ₹{ai_cost:,} is {over_pct}% over your ₹{user_budget:,} budget."
                )

        elif ai_cost < lower:
            under_pct = round(((user_budget - ai_cost) / user_budget) * 100, 1)
            # Under budget is fine — just note it
            self.warnings.append(
                f"Great news! Estimated cost ₹{ai_cost:,} is {under_pct}% under your ₹{user_budget:,} budget. "
                f"Consider adding an extra experience or upgrading accommodation."
            )

    def _scale_costs(self, scale: float):
        """Proportionally scale all costs in the itinerary."""
        # Scale total
        if 'total_cost' in self.data:
            self.data['total_cost'] = int(self.data['total_cost'] * scale)

        # Scale cost breakdown
        if 'cost_breakdown' in self.data and isinstance(self.data['cost_breakdown'], dict):
            for key in self.data['cost_breakdown']:
                self.data['cost_breakdown'][key] = int(self.data['cost_breakdown'][key] * scale)

        # Scale per-day costs
        if 'itinerary' in self.data and isinstance(self.data['itinerary'], list):
            for day in self.data['itinerary']:
                if isinstance(day, dict):
                    if 'day_total' in day:
                        day['day_total'] = int(day['day_total'] * scale)
                    if 'transport_within_city' in day:
                        day['transport_within_city'] = int(day['transport_within_city'] * scale)
                    # Scale accommodation
                    if 'accommodation' in day and isinstance(day['accommodation'], dict):
                        if 'cost_per_night' in day['accommodation']:
                            day['accommodation']['cost_per_night'] = int(
                                day['accommodation']['cost_per_night'] * scale
                            )
                    # Scale activity costs
                    if 'activities' in day and isinstance(day['activities'], list):
                        for act in day['activities']:
                            if isinstance(act, dict) and 'cost' in act:
                                act['cost'] = int(act['cost'] * scale)

    # ────────────────────── Activity Count Check ──────────────────────

    def _check_activity_counts(self):
        """Flag days with more than 5 activities."""
        itinerary = self.data.get('itinerary', [])
        for day in itinerary:
            if not isinstance(day, dict):
                continue
            activities = day.get('activities', [])
            if isinstance(activities, list) and len(activities) > 5:
                day_num = day.get('day', '?')
                self.warnings.append(
                    f"Day {day_num} has {len(activities)} activities — this may be an overpacked schedule. "
                    f"Consider dropping 1-2 for a more relaxed experience."
                )

    # ────────────────────── Generic Name Detection ──────────────────────

    def _check_generic_names(self):
        """Detect low-quality generic activity names."""
        itinerary = self.data.get('itinerary', [])
        generic_found = []
        for day in itinerary:
            if not isinstance(day, dict):
                continue
            activities = day.get('activities', [])
            if isinstance(activities, list):
                for act in activities:
                    if isinstance(act, dict):
                        name = act.get('activity', '')
                        for pattern in GENERIC_NAME_PATTERNS:
                            if re.search(pattern, name, re.IGNORECASE):
                                generic_found.append(name)
                                break

        if generic_found:
            self.warnings.append(
                f"Some activities may have generic names (e.g.: {', '.join(generic_found[:3])}). "
                f"For more specific recommendations, try providing more detailed preferences."
            )

    # ────────────────────── Cost Consistency Check ──────────────────────

    def _check_cost_consistency(self):
        """Check if individual day totals roughly add up to the total_cost."""
        itinerary = self.data.get('itinerary', [])
        if not itinerary:
            return

        day_sum = sum(
            day.get('day_total', 0)
            for day in itinerary
            if isinstance(day, dict)
        )

        total = self.data.get('total_cost', 0)
        if total and day_sum and abs(day_sum - total) > total * 0.15:
            self.warnings.append(
                f"Note: Individual day costs sum to ₹{day_sum:,}, "
                f"which differs from the stated total of ₹{total:,}. "
                f"Transport between cities may account for this difference."
            )

    # ────────────────────── Required Fields Check ──────────────────────

    def _check_required_fields(self):
        """Check that all required top-level fields are present."""
        required = ['trip_title', 'total_cost', 'itinerary']
        for field in required:
            if field not in self.data or not self.data[field]:
                self.errors.append(f"Missing required field: '{field}'")


def validate_itinerary(itinerary_data: dict, preferences: dict) -> dict:
    """Convenience wrapper for ItineraryValidator."""
    validator = ItineraryValidator(itinerary_data, preferences)
    return validator.validate()
