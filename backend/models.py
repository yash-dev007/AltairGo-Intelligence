from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, JSON
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
    desc = Column(String(200)) # Short description
    description = Column(Text) # Long description
    image = Column(String(255))
    location = Column(String(100))
    
    # Pricing & Metrics
    price_str = Column(String(50)) # '4,999' stored as string to match current format
    estimated_cost_per_day = Column(Integer)
    rating = Column(Float)
    reviews_count_str = Column(String(20)) # '1.2k'
    
    # Metadata
    best_time = Column(String(100))
    crowd_level = Column(String(50))
    tag = Column(String(50)) # e.g. 'Must Visit'
    
    # JSON Fields for lists/complex data
    highlights = Column(JSON)
    itinerary = Column(JSON)
    best_time_months = Column(JSON)
    vibe_tags = Column(JSON)
    
    # Relationships
    state_id = Column(Integer, ForeignKey('states.id'))

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "desc": self.desc,
            "description": self.description,
            "image": self.image,
            "location": self.location,
            "state_id": self.state_id, # Crucial for frontend filtering
            "price": self.price_str,
            "estimatedCostPerDay": self.estimated_cost_per_day,
            "rating": self.rating,
            "reviews": self.reviews_count_str,
            "bestTime": self.best_time,
            "crowdLevel": self.crowd_level,
            "tag": self.tag,
            "highlights": self.highlights or [],
            "itinerary": self.itinerary or [],
            "bestTimeMonths": self.best_time_months or [],
            "vibe_tags": self.vibe_tags or []
        }
