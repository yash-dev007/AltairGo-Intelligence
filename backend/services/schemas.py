from pydantic import BaseModel, Field, model_validator
from typing import List, Optional
from enum import Enum


# ── Enums ──────────────────────────────────────────────────────────────────────

class CrowdLevel(str, Enum):
    LOW           = "Low"
    MODERATE      = "Moderate"
    HIGH          = "High"

class PacingLevel(str, Enum):
    RELAXED       = "Relaxed"
    LEISURELY     = "Leisurely"
    MODERATE      = "Moderate"
    ACTION_PACKED = "Action-Packed"
    
class AccommodationType(str, Enum):
    HOTEL         = "Hotel"
    HOSTEL        = "Hostel"
    RESORT        = "Resort"
    GUESTHOUSE    = "Guesthouse"
    HOMESTAY      = "Homestay"
    VILLA         = "Villa"
    APARTMENT     = "Apartment"
    BOUTIQUE      = "Boutique"

class BudgetStatus(str, Enum):
    WITHIN_BUDGET = "within_budget"
    OVER_BUDGET   = "over_budget"
    UNDER_BUDGET  = "under_budget"

class MealType(str, Enum):
    BREAKFAST     = "Breakfast"
    LUNCH         = "Lunch"
    DINNER        = "Dinner"
    SNACK         = "Snack"


# ── DestinationDetail ──────────────────────────────────────────────────────────

class DestinationDetail(BaseModel):
    name: str                             = Field(description="Official name of the place")
    location: Optional[str]               = Field(default="Unknown", description="City, Country")
    type: Optional[str]                   = Field(default="Attraction", description="Category e.g. Beach, Temple, National Park")
    description: str                      = Field(description="Vivid 2-3 sentence description with sensory details")
    best_time: Optional[str]              = Field(default="Anytime", description="Best months to visit and why")
    crowd_level: Optional[CrowdLevel]     = Field(default=CrowdLevel.MODERATE)
    rating: Optional[float]               = Field(default=4.5, ge=1.0, le=5.0)
    estimated_cost_per_day: Optional[int] = Field(default=2000, ge=0)
    highlights: List[str]                 = Field(default_factory=list)
    image_keyword: Optional[str]          = Field(default="", description="Best search term for image lookup")
    tags: List[str]                       = Field(default_factory=list)


class DestinationRecommendationList(BaseModel):
    destinations: List[DestinationDetail]


# ── SmartDestinationInsight ────────────────────────────────────────────────────

class SmartDestinationInsight(BaseModel):
    special: str           = Field(description="Detailed paragraph about what makes this destination unique.")
    food: List[str]        = Field(default_factory=list, description="Specific named dishes and where to eat them (e.g. 'Vada Pav at Anand Stall, Dadar')")
    hidden_gems: List[str] = Field(default_factory=list, description="Insider tips only locals know — never generic advice")
    culture: Optional[str] = Field(default="", description="Paragraph about local culture and history.")
    best_time_pace: Optional[str] = Field(default="", description="Best time of day/year to visit and how to pace the trip.")
    best_for: Optional[str]       = Field(default="Everyone", description="Who this destination suits best.")


# ── ActivityList ───────────────────────────────────────────────────────────────

class ActivityList(BaseModel):
    time: str                     = Field(description="Period: Morning | Lunch | Afternoon | Evening")
    time_range: str               = Field(description="E.g. 9:00 AM - 11:30 AM")
    activity: str                 = Field(description="Real specific place name — NEVER generic like 'local market'")
    google_maps_search_query: str = Field(description="Full copy-pasteable Maps query e.g. 'Gateway of India, Mumbai, Maharashtra, India'")
    description: str              = Field(description="Vivid 2-3 sentence description with sensory details")
    why_this_fits: str            = Field(description="Personalized reason tied to the user's specific interests and traveler type")
    local_secret: str             = Field(description="Insider tip unknown to most tourists — specific, not generic")
    cost: int                     = Field(ge=0, description="Cost per person in local currency")
    duration: str                 = Field(description="E.g. '2 hours', '45 minutes'")
    how_to_reach: str             = Field(description="Transport mode + travel time + cost e.g. 'Auto-rickshaw — ₹80, 12 min'")
    tips: str                     = Field(description="Practical actionable tip for this specific activity")
    booking_required: bool
    crowd_level: CrowdLevel
    # FIX (LOW): Added meal_type so frontend can distinguish food stops from sightseeing
    meal_type: Optional[MealType] = Field(default=None, description="Set only for food/restaurant stops. Null for sightseeing.")


# ── AccommodationConfig ────────────────────────────────────────────────────────

class AccommodationConfig(BaseModel):
    name: str
    type: AccommodationType
    cost_per_night: int = Field(ge=0)
    location: str
    why_this: str
    booking_tip: str


# ── InterCityTravel ────────────────────────────────────────────────────────────
# FIX (HIGH): Original used alias="from" and alias="class" creating two problems:
#   1. "from" and "class" are Python reserved keywords — .from / .class = SyntaxError
#   2. model_dump() by default returns Python field names (from_city) not alias names (from)
#      causing inconsistency between what Gemini outputs and what gets serialized back.
# Solution: use clear Python names, NO reserved-keyword aliases.
# The template JSON example now uses from_city/to_city/travel_class to match.

class InterCityTravel(BaseModel):
    day: int                          = Field(description="Day number this travel occurs on")
    from_city: str                    = Field(description="Departure city name")
    to_city: str                      = Field(description="Arrival city name")
    method: str                       = Field(description="Train | Flight | Bus | Car")
    train_name: Optional[str]         = Field(default=None, description="Train name and number e.g. 'Mandore Express (14865)'")
    departure: str                    = Field(description="Departure time e.g. '11:45 PM'")
    arrival: str                      = Field(description="Arrival time e.g. '5:50 AM'")
    duration: str                     = Field(description="Total travel duration e.g. '6h 5m'")
    travel_class: Optional[str]       = Field(default=None, description="Seating class e.g. '3AC', 'Economy', 'Sleeper'")
    cost: int                         = Field(ge=0, description="Cost per person in local currency")
    booking: str                      = Field(description="How and where to book e.g. 'IRCTC app, 60 days in advance'")
    tips: str                         = Field(description="Practical travel tip for this journey")
    alternative: Optional[str]        = Field(default=None, description="Faster or cheaper alternative e.g. 'Flight ₹3,500 | Bus ₹450'")


# ── ItineraryDay ───────────────────────────────────────────────────────────────

class ItineraryDay(BaseModel):
    day: int
    date: Optional[str]               = None
    location: str
    theme: str                        = Field(description="One evocative sentence summarising the day's focus")
    pacing_level: PacingLevel
    daily_weather_tip: str            = Field(description="Clothing or gear advice for this specific day")
    # FIX (LOW): Added day summary fields for UI quick-view without parsing all activities
    morning_summary: str              = Field(description="One sentence preview of the morning plan")
    afternoon_summary: str            = Field(description="One sentence preview of the afternoon plan")
    evening_summary: str              = Field(description="One sentence preview of the evening plan")
    activities: List[ActivityList]
    accommodation: Optional[AccommodationConfig] = None
    day_total: int                    = Field(ge=0, description="Total estimated spend for this day in local currency")
    transport_within_city: int        = Field(ge=0)
    notes: str
    travel_hours: Optional[str] = Field(default="2 hrs", description="e.g. '4-5 hrs'")
    intensity_score: Optional[int] = Field(default=5, description="1 to 10")
    weather_sensitivity: Optional[str] = Field(default="Low", description="Low/Medium/High")
    risk: Optional[str] = Field(default="Low", description="Low/Medium/High")
    base_location: Optional[str] = Field(default="", description="Base city for the night")
    purpose: Optional[str] = Field(default="", description="e.g. 'Body adjustment after travel'")
    stay_logic: Optional[str] = Field(default="", description="Reasoning for stay location")

    # FIX (MEDIUM): Validate day_total is internally consistent
    @model_validator(mode="after")
    def check_day_total_consistency(self) -> "ItineraryDay":
        activity_cost_sum = sum(a.cost for a in self.activities)
        acc_cost = self.accommodation.cost_per_night if self.accommodation else 0
        expected = activity_cost_sum + self.transport_within_city + acc_cost
        # Allow ±15% tolerance — Gemini rounds and may include minor unlisted costs
        tolerance = expected * 0.15
        if abs(self.day_total - expected) > max(tolerance, 300):  # min ₹300 absolute tolerance
            # Auto-correct rather than reject — Gemini hallucination shouldn't crash the app
            object.__setattr__(self, 'day_total', expected)
        return self


# ── CostBreakdown ──────────────────────────────────────────────────────────────

class CostBreakdown(BaseModel):
    transport: int      = Field(ge=0)
    accommodation: int  = Field(ge=0)
    food: int           = Field(ge=0)
    activities: int     = Field(ge=0)
    miscellaneous: int  = Field(ge=0)

    @property
    def total(self) -> int:
        return self.transport + self.accommodation + self.food + self.activities + self.miscellaneous


# ── TripPlan ───────────────────────────────────────────────────────────────────

class TripPlan(BaseModel):
    trip_title: str
    overall_vibe: str               = Field(description="2-3 sentence narrative of the trip feel, written in second person")
    total_cost: int                 = Field(ge=0)
    cost_breakdown: CostBreakdown
    budget_status: BudgetStatus
    currency: str                   = Field(default="INR", description="ISO currency code e.g. INR, USD, EUR")
    smart_insights: List[str]       = Field(description="3-5 actionable insights about crowds, weather, booking timing")
    cultural_etiquette: List[str]   = Field(description="3-5 specific actionable local customs to respect")
    itinerary: List[ItineraryDay]
    travel_between_cities: List[InterCityTravel] = Field(default_factory=list)
    packing_tips: List[str]
    important_tips: List[str]
    money_saving_hacks: List[str]
    image_keyword: str
    ai_perfect_reasons: List[str] = Field(default_factory=list, description="List of reasons why this is AI perfect, e.g. 'Geographic flow optimized: No backtracking'")

    # FIX (MEDIUM): Auto-correct total_cost to match cost_breakdown sum
    @model_validator(mode="after")
    def sync_total_cost(self) -> "TripPlan":
        breakdown_sum = self.cost_breakdown.total
        # If Gemini's total_cost deviates more than 5% from breakdown sum, auto-correct
        if breakdown_sum > 0:
            deviation = abs(self.total_cost - breakdown_sum) / breakdown_sum
            if deviation > 0.05:
                object.__setattr__(self, 'total_cost', breakdown_sum)
        return self
