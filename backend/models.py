from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, JSON, Boolean, DateTime, func
from sqlalchemy.orm import relationship
from database import Base

class Country(Base):
    __tablename__ = 'countries'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True)
    code = Column(String(10)) # ISO code e.g. 'ph', 'in'
    currency = Column(String(50))
    image = Column(String(255))
    states = relationship('State', backref='country', lazy=True)

class State(Base):
    __tablename__ = 'states' # Often called Regions in your code
    id = Column(Integer, primary_key=True)
    name = Column(String(100))
    image = Column(String(255))
    country_id = Column(Integer, ForeignKey('countries.id'))
    destinations = relationship('Destination', backref='state', lazy=True)

class Destination(Base):
    __tablename__ = 'destinations'
    id = Column(Integer, primary_key=True)
    name = Column(String(100))
    slug = Column(String(255)) # Added for SEO URLs
    desc = Column(String(200)) # Short description
    description = Column(Text) # Long description
    image = Column(String(255))
    location = Column(String(100))
    
    # Pricing & Metrics
    price_str = Column(String(50)) # '4,999' stored as string to match current format
    estimated_cost_per_day = Column(Integer)
    rating = Column(Float)
    reviews_count_str = Column(String(20)) # '1.2k'
    popularity_score = Column(Integer, default=0) # Added
    
    # Metadata
    best_time = Column(String(100))
    crowd_level = Column(String(50))
    tag = Column(String(50)) # e.g. 'Must Visit'
    
    # JSON Fields for lists/complex data
    highlights = Column(JSON)
    itinerary = Column(JSON)
    activities = Column(JSON) # Added
    gallery_images = Column(JSON) # Added
    best_time_months = Column(JSON)
    vibe_tags = Column(JSON)
    
    # Relationships
    state_id = Column(Integer, ForeignKey('states.id'))
    attractions = relationship('Attraction', backref='destination', lazy=True)
    tips = relationship('DestinationTip', backref='destination', lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "slug": self.slug,
            "desc": self.desc,
            "description": self.description,
            "image": self.image,
            "location": self.location,
            "state_id": self.state_id,
            "price": self.price_str,
            "estimatedCostPerDay": self.estimated_cost_per_day,
            "rating": self.rating,
            "reviews": self.reviews_count_str,
            "popularityScore": self.popularity_score,
            "bestTime": self.best_time,
            "crowdLevel": self.crowd_level,
            "tag": self.tag,
            "highlights": self.highlights or [],
            "itinerary": self.itinerary or [],
            "activities": self.activities or [],
            "galleryImages": self.gallery_images or [],
            "bestTimeMonths": self.best_time_months or [],
            "vibe_tags": self.vibe_tags or []
        }

class Attraction(Base):
    __tablename__ = 'attractions'
    id = Column(Integer, primary_key=True)
    destination_id = Column(Integer, ForeignKey('destinations.id'))
    name = Column(String(255), nullable=False)
    image = Column(String(255))
    description = Column(Text)
    entry_cost = Column(Integer)
    duration = Column(String(50))
    booking_required = Column(Boolean, default=False)
    rating = Column(Float)
    type = Column(String(100)) # e.g. 'Nature', 'Historic'
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "image": self.image,
            "description": self.description,
            "entry_cost": self.entry_cost,
            "duration": self.duration,
            "rating": self.rating,
            "type": self.type
        }

class DestinationTip(Base):
    __tablename__ = 'destination_tips'
    id = Column(Integer, primary_key=True)
    destination_id = Column(Integer, ForeignKey('destinations.id'))
    tip = Column(Text, nullable=False)
    category = Column(String(50))
    is_ai_generated = Column(Boolean, default=True)

class DestinationRequest(Base):
    __tablename__ = 'destination_requests'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    cost = Column(Integer)
    tag = Column(String(50))
    state_id = Column(Integer, ForeignKey('states.id'), nullable=True) # Optional link to region
    status = Column(String(20), default='pending') # pending, approved, rejected
    created_at = Column(DateTime, default=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "cost": self.cost,
            "tag": self.tag,
            "state_id": self.state_id,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class Trip(Base):
    __tablename__ = 'trips'
    id = Column(String(36), primary_key=True) # UUID string
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    user = relationship('User', backref='trips')
    title = Column(String(255))
    destination_country = Column(String(100))
    start_city = Column(String(100))
    budget = Column(Integer)
    duration = Column(Integer)
    travelers = Column(Integer, default=1)
    
    # New: Trip Preferences
    style = Column(String(50))  # Budget/Standard/Luxury
    date_type = Column(String(20))  # fixed/flexible/anytime
    travel_start_date = Column(DateTime, nullable=True)
    travel_end_date = Column(DateTime, nullable=True)
    travel_month = Column(String(20), nullable=True)  # For flexible dates
    
    # Generated Data
    itinerary_json = Column(JSON)
    total_cost = Column(Integer)
    
    created_at = Column(DateTime, default=func.now())
    
    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "country": self.destination_country,
            "startCity": self.start_city,
            "budget": self.budget,
            "duration": self.duration,
            "travelers": self.travelers,
            "style": self.style,
            "dateType": self.date_type,
            "travelStartDate": self.travel_start_date.isoformat() if self.travel_start_date else None,
            "travelEndDate": self.travel_end_date.isoformat() if self.travel_end_date else None,
            "travelMonth": self.travel_month,
            "itinerary": self.itinerary_json,
            "cost": self.total_cost,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    email = Column(String(120), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(100))
    created_at = Column(DateTime, default=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name
        }

class AnalyticsEvent(Base):
    __tablename__ = 'analytics_events'
    id = Column(Integer, primary_key=True)
    event_type = Column(String(50), nullable=False)  # itinerary_generated, ai_failed, validation_failed, user_feedback
    event_data = Column(JSON)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    created_at = Column(DateTime, default=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "event_type": self.event_type,
            "event_data": self.event_data,
            "user_id": self.user_id,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

