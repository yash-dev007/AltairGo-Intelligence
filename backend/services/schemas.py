from pydantic import BaseModel, Field
from typing import List, Optional

class DestinationDetail(BaseModel):
    name: str = Field(description="Official Name")
    location: Optional[str] = Field(default="Unknown", description="City, Country")
    type: Optional[str] = Field(default="Attraction", description="Category (Beach/Temple/etc)")
    description: str = Field(description="Engaging description")
    best_time: Optional[str] = Field(default="Anytime", description="Best months to visit")
    crowd_level: Optional[str] = Field(default="Moderate", description="Low/Moderate/High")
    rating: Optional[float] = Field(default=4.5, ge=1.0, le=5.0)
    estimated_cost_per_day: Optional[int] = Field(default=2000)
    highlights: List[str] = Field(default_factory=list)
    image_keyword: Optional[str] = Field(default="", description="Best search term for image")
    tags: List[str] = Field(default_factory=list)

class DestinationRecommendationList(BaseModel):
    destinations: List[DestinationDetail]

class SmartDestinationInsight(BaseModel):
    special: str = Field(description="Detailed paragraph about what makes it special.")
    food: List[str] = Field(default_factory=list, description="Specific local dishes or food experiences")
    hidden_gems: List[str] = Field(default_factory=list, description="Secret spots or local favorites")
    culture: Optional[str] = Field(default="", description="Paragraph about local culture/history.")
    best_time_pace: Optional[str] = Field(default="", description="Advice on best time of day/year and pacing.")
    best_for: Optional[str] = Field(default="Everyone", description="Who this is best for (e.g. History buffs, families).")

class ActivityList(BaseModel):
    time: Optional[str] = Field(default="Morning")
    time_range: Optional[str] = Field(default="9:00 AM - 12:00 PM")
    activity: str
    description: Optional[str] = Field(default="")
    cost: Optional[int] = Field(default=0)
    duration: Optional[str] = Field(default="2-3 hours")
    how_to_reach: Optional[str] = Field(default="Local Taxi/Walk")
    tips: Optional[str] = Field(default="Bring water and camera")
    booking_required: Optional[bool] = Field(default=False)
    crowd_level: Optional[str] = Field(default="Moderate")

class AccommodationConfig(BaseModel):
    name: str = Field(default="Local Stay")
    type: Optional[str] = Field(default="Hotel")
    cost_per_night: Optional[int] = Field(default=3000)
    location: Optional[str] = Field(default="Central Area")
    why_this: Optional[str] = Field(default="Good reviews and location")
    booking_tip: Optional[str] = Field(default="Book 2 weeks in advance")

class ItineraryDay(BaseModel):
    day: int
    date: Optional[str] = None
    location: str
    theme: Optional[str] = Field(default="Exploration")
    activities: List[ActivityList] = Field(default_factory=list)
    accommodation: Optional[AccommodationConfig] = None
    day_total: Optional[int] = Field(default=0)
    transport_within_city: Optional[int] = Field(default=500)
    notes: Optional[str] = Field(default="")

class CostBreakdown(BaseModel):
    transport: Optional[int] = 0
    accommodation: Optional[int] = 0
    food: Optional[int] = 0
    activities: Optional[int] = 0
    miscellaneous: Optional[int] = 0
    
class TripPlan(BaseModel):
    trip_title: str
    total_cost: Optional[int] = 0
    cost_breakdown: Optional[CostBreakdown] = None
    budget_status: Optional[str] = "Within Budget"
    smart_insights: List[str] = Field(default_factory=list)
    itinerary: List[ItineraryDay] = Field(default_factory=list)
    travel_between_cities: List[dict] = Field(default_factory=list)
    packing_tips: List[str] = Field(default_factory=list)
    important_tips: List[str] = Field(default_factory=list)
    money_saving_hacks: List[str] = Field(default_factory=list)
    image_keyword: Optional[str] = ""
