# 🌍 AltairGo - AI-Powered Trip Planner

## Complete Product Workflow & Implementation Guide

---

## 📋 Table of Contents

1. [Product Overview](#product-overview)
2. [Core Features](#core-features)
3. [User Workflow](#user-workflow)
4. [Technical Architecture](#technical-architecture)
5. [Database Schema](#database-schema)
6. [AI Implementation](#ai-implementation)
7. [Image & Media Strategy](#image--media-strategy)
8. [API Integrations](#api-integrations)
9. [Development Roadmap](#development-roadmap)
10. [Tech Stack](#tech-stack)
11. [Cost Analysis](#cost-analysis)
12. [Monetization Strategy](#monetization-strategy)

---

## 🎯 Product Overview

### What is AltairGo?

AltairGo is an AI-powered trip planning platform that generates personalized travel itineraries in seconds. Users input their preferences (destination, budget, duration, interests), and our AI creates detailed, day-by-day trip plans with activities, costs, and booking options.

### Unique Value Proposition

- **Instant Planning**: Complete itinerary in 30 seconds vs hours of manual research
- **AI Personalization**: Tailored to budget, interests, and travel style
- **Visual Experience**: Beautiful destination images and detailed information
- **One-Click Booking**: Direct links to flights, hotels, and activities
- **Smart Optimization**: AI balances cost, time, and experiences perfectly

### Target Users

- **Primary**: Young travelers (18-35) planning domestic trips
- **Secondary**: Families planning vacations
- **Tertiary**: Solo travelers and adventure seekers

---

## ✨ Core Features

### MVP (Month 1-2)

1. **Smart Trip Input Form**
   - Destination selection
   - Budget slider (₹5k - ₹2L)
   - Duration picker (1-14 days)
   - Travel style (Budget/Mid-range/Luxury)
   - Interest tags (Adventure, Culture, Food, Beaches, etc.)

2. **AI Itinerary Generation**
   - 2-3 trip options generated instantly
   - Day-by-day breakdown
   - Activity suggestions with timing
   - Cost estimates per activity
   - Total trip cost calculation

3. **Destination Cards with Images**
   - High-quality photos
   - Quick stats (cost, duration, highlights)
   - "Details" button for more info

4. **Detailed Destination View**
   - Hero images and gallery
   - Top attractions with ratings
   - Local tips (AI-generated)
   - Getting there information
   - Similar destinations

5. **Save & Share**
   - Save trips to account
   - Share via link
   - PDF export

6. **Booking Integration**
   - Affiliate links to MakeMyTrip
   - Booking.com hotel links
   - Activity booking partners

### Phase 2 (Month 3-6)

7. **Interactive Itinerary Editor**
   - Drag-and-drop day reordering
   - Swap activities
   - Chat with AI to modify ("Make day 3 more relaxing")

8. **User Accounts**
   - Email/Google login
   - Trip history
   - Favorites list

9. **Community Features**
   - User reviews of generated trips
   - Photo uploads from actual trips
   - Traveler match (find trip buddies)

### Phase 3 (Month 6-12 - Post Funding)

10. **Real-time Pricing**
    - Live flight prices
    - Hotel availability and rates
    - Dynamic budget updates

11. **Mobile App**
    - iOS and Android
    - Offline itinerary access
    - GPS-based recommendations

12. **Premium Features**
    - Unlimited regenerations
    - Priority AI (better models)
    - Collaboration tools
    - Advanced customization

---

## 🔄 User Workflow

### Step 1: Trip Input Form

User arrives at homepage and fills out:
- Where are you traveling from? [City Dropdown]
- Where do you want to go? [Country/Region Dropdown]
- Budget slider: ₹5,000 - ₹2,00,000
- Duration: Weekend / 1 week / 2 weeks / Custom
- Travel dates (optional)
- Interests: [Multi-select checkboxes]
  - Adventure, Beach, Culture, Food, Nature, Photography, Party, Relaxation, Spiritual, Wildlife
- Travel style: Budget / Mid-range / Luxury

[Generate My Perfect Trip ✨] Button

---

### Step 2: AI Generates Options (3-5 seconds)

Display 2-3 trip options:

**Option 1: "Royal Rajasthan Explorer" 👑**
- Image: Jaipur Palace
- Destinations: Jaipur → Udaipur → Jodhpur (7 days)
- Total: ₹35,000
- Why this: Perfect blend of forts, palaces, and local culture. Great for photography!
- Quick Preview: Day 1: Jaipur - Amber Fort, City Palace...
- [See Full Itinerary] [Customize]

**Option 2: "Goa Beach Escape" 🏖️**
- Image: Beach sunset
- Destinations: North & South Goa (5 days)
- Total: ₹18,000
- Why this: Relaxing beach vibes, water sports, amazing seafood
- [See Full Itinerary] [Customize]

[🔄 Generate Different Options]

---

### Step 3: Detailed Itinerary View

**Royal Rajasthan Explorer 👑**
7 Days | ₹35,000 | Jaipur → Udaipur → Jodhpur

**DESTINATIONS IN THIS TRIP**
Three cards showing: Jaipur (3 days), Udaipur (2 days), Jodhpur (2 days)
Each with image and [Details] button

**DAY-BY-DAY ITINERARY**

**Day 1: Arrive Jaipur - The Pink City**

Morning (9:00 AM - 12:00 PM)
- 🏰 Amber Fort
- Duration: 3 hours | Cost: ₹500
- Why: Stunning architecture, elephant rides, panoramic views
- [View Photos] [Add to favorites]

Lunch (12:30 PM - 1:30 PM)
- 🍽️ Laxmi Mishtan Bhandar
- Cost: ₹400 | Famous for: Dal Baati Churma

Afternoon (2:00 PM - 5:00 PM)
- 🏛️ City Palace & Hawa Mahal
- Duration: 2 hours | Cost: ₹700
- [Swap Activity] [Skip]

Evening (6:00 PM - 9:00 PM)
- 🛍️ Bapu Bazaar Shopping
- Budget: ₹2,000

Stay: Hotel Pink Pearl (₹2,500/night)
[Book Now via Booking.com]

Day Total: ₹6,100

---

**COST BREAKDOWN**
- Accommodation: ₹17,500 (7 nights)
- Food: ₹7,000 (₹1,000/day)
- Activities: ₹5,500
- Shopping: ₹3,000
- Transport: ₹2,000
Total: ₹35,000

**GETTING THERE**
- ✈️ Flights: [Search Delhi to Jaipur on MakeMyTrip]
- 🚂 Trains: Jaipur Junction (5 hrs from Delhi)

[💾 Save This Trip] [📤 Share] [📄 Download PDF]
[✅ Book This Trip]

---

### Step 4: Destination Details Modal

When user clicks [Details] on Jaipur card:

**JAIPUR - The Pink City**
[Hero Image: Hawa Mahal at Sunset]

**QUICK STATS**
- ₹2,500 per day
- 2-3 days ideal
- Oct-Mar best time

**ABOUT**
Jaipur, capital of Rajasthan, known as Pink City due to distinctive pink buildings. UNESCO World Heritage Site, famous for forts, palaces, markets.

**TOP ATTRACTIONS**
- Amber Fort ⭐ 4.8 | ⏱️ 3 hours | ₹500
- Hawa Mahal ⭐ 4.6 | ⏱️ 1 hour | ₹200
- City Palace ⭐ 4.7 | ⏱️ 2 hours | ₹500
[See all 12 attractions →]

**INSIDER TIPS (AI-Generated)**
✓ Visit Amber Fort early (8 AM) to avoid crowds
✓ Try Dal Baati Churma at LMB in Johari Bazaar
✓ Bargain at Bapu Bazaar - start at 50% of ask price
✓ Best photography: Hawa Mahal at sunrise

**MUST-TRY FOOD**
Dal Baati Churma • Ghewar • Laal Maas • Pyaaz Kachori

**GETTING THERE**
- ✈️ Jaipur Airport (JAI) - 12 km from city
- 🚂 Jaipur Junction - Well connected
- 🚌 From Delhi: 280 km, 5 hours

**SIMILAR DESTINATIONS**
[Udaipur] [Jodhpur] [Pushkar] [Jaisalmer]

[✅ Add Jaipur to My Trip] [Close]

---

### Step 5: Booking & Checkout

**Your Trip is Ready! 🎉**

**TRAVEL DATES**
March 15-21, 2025 [Change Dates]

**BOOK FLIGHTS**
Delhi → Jaipur: March 15
From ₹3,500
[Search Flights on MakeMyTrip →]

**BOOK HOTELS**
- Jaipur: Hotel Pink Pearl (3 nights) - ₹2,500/night ⭐ 4.2
- Udaipur: Lake View Resort (2 nights) - ₹3,000/night ⭐ 4.5

**BOOK ACTIVITIES**
- Amber Fort Entry (₹500) [Book →]
- Udaipur Boat Ride (₹800) [Book →]

[📱 Send to Phone] [📧 Email] [📄 Download PDF]

---

## 🏗️ Technical Architecture

### System Architecture

```
FRONTEND (React 19 + Vite)
├── Landing Page
├── Trip Builder
├── Itinerary Viewer
├── Destination Details
├── User Dashboard
└── Saved Trips
         ↓
BACKEND API LAYER (Python Flask)
├── POST /generate-itinerary
├── GET /destinations/:id
├── POST /api/save-trip
├── GET /api/user/trips
├── POST /regions/:id/populate
└── GET /destinations/:id
         ↓
AI & DATA LAYER
├── Gemini 2.0 Flash (Itinerary & Destinations)
├── Unsplash API (Images)
└── SQLite (Dev) / PostgreSQL (Prod)
         ↓
HOSTING & CDN
├── Vercel (Frontend)
├── Cloudflare (CDN)
└── Render/Railway (Backend)
```

### API Flow for Trip Generation

```
1. User submits form
2. Frontend: POST /generate-itinerary
   {
     selectedDestIds: [101, 102],
     preferences: {
       budget: 35000,
       duration: 7,
       style: "mid-range"
     }
   }
3. Backend validates input
4. Backend constructs AI prompt
5. Call Gemini 2.0 Flash API (services/gemini_service.py)
6. AI generates itinerary JSON
7. Backend enriches with images (Unsplash)
8. Return JSON to frontend
9. Frontend displays trip options
```

---

## 🗄️ Database Schema

### Users Table (SQLAlchemy Model)
```python
class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, nullable=False)
    name = Column(String(255))
    password_hash = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
```

### Destinations Table (Core Entity)
```python
class Destination(Base):
    __tablename__ = 'destinations'
    id = Column(Integer, primary_key=True)
    # Basic Info
    name = Column(String(255), unique=True, nullable=False)
    state_id = Column(Integer, ForeignKey('states.id'))
    
    # AI & Metadata
    description = Column(Text)
    image = Column(Text) # Main hero image URL
    
    # Travel Info
    estimated_cost_per_day = Column(Integer)
    best_time = Column(String(100))
    crowd_level = Column(String(50))
    rating = Column(Float) # e.g. 4.5
    
    # Categorization
    tag = Column(String(50)) # e.g. "Hidden Gem"
    vibe_tags = Column(JSON) # e.g. ["Nature", "Adventure"]
    highlights = Column(JSON)
```

### Trips Table (User-generated)
```python
class Trip(Base):
    __tablename__ = 'trips'
    id = Column(String(36), primary_key=True) # UUID
    user_id = Column(Integer, ForeignKey('users.id'))
    
    # Trip Config
    title = Column(String(255))
    start_city = Column(String(100))
    budget = Column(Integer)
    duration = Column(Integer)
    
    # The Generated Plan
    itinerary_json = Column(JSON) # Stores list of days/activities
    total_cost = Column(Integer)
```

---

## 🤖 AI Implementation

### Prompt Engineering

**Master Prompt Template (`services/ai_destination_service.py`):**
```python
prompt = f"""
You are a travel expert. Generate a list of {limit} tourist destinations in {region_name}, {country_name}.

For each destination, provide:
- name: Official name of the place
- type: Category (e.g., "Historic Monument", "Nature", "Temple")
- description: A compelling 2-3 sentence description
- rating: Estimated rating from 4.0 to 4.9
- estimated_cost: Entry fee or estimated daily cost
- best_time: Best time to visit
- crowd_level: Expected crowd level
- highlights: Array of 3-4 key highlights
- image_keyword: Best search term for finding an image

Output MUST be pure JSON.
"""
```

### Gemini API Integration (Python)
```python
from google import genai
import os

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

def generate_destinations_for_region(region_name, limit=50):
    # ... setup prompt ...
    response = client.models.generate_content(
        model='gemini-2.0-flash',
        contents=prompt,
        config={'response_mime_type': 'application/json'}
    )
    return json.loads(response.text)
```

### API Route (Flask)
```python
# app.py
@app.route('/generate-itinerary', methods=['POST'])
def generate_itinerary():
    data = request.json
    selected_ids = data.get('selectedDestIds', [])
    preferences = data.get('preferences', {})
    
    # 1. Fetch Selected Destinations
    selected_dests = db_session.query(Destination).filter(Destination.id.in_(selected_ids)).all()
    
    # 2. Call Gemini Service
    ai_result = generate_trip_options(preferences, [d.to_dict() for d in selected_dests])
    
    # 3. Enrich with Images
    # ...
    
    return jsonify(ai_result)
```

---

## 🖼️ Image & Media Strategy

### Unsplash API Integration (Python)
```python
def get_image_for_destination(query, context):
    # ... check cache ...
    resp = requests.get(
       f"https://api.unsplash.com/search/photos?query={query}&client_id={KEY}"
    )
    data = resp.json()
    if data['results']:
        return data['results'][0]['urls']['regular']
    return FALLBACK_IMAGE
```

### Frontend Image Component
```jsx
export function DestinationImage({ src, alt, className }) {
  // Handles lazy loading and skeletons
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {!loaded && <Skeleton className="absolute inset-0" />}
      <img 
        src={src} 
        alt={alt} 
        className={loaded ? 'opacity-100' : 'opacity-0'}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
```

---

## 🔌 API Integrations

### Current (MVP)
1. **Google Gemini 2.0 Flash** - AI itinerary generation
2. **Unsplash API** - Destination images
3. **Internal Flask API** - Logic and Coordination

---

## 📅 Development Roadmap

### Phase 1: MVP (Weeks 1-6) - Complete ✅

**Week 1-2: Setup**
- [x] Initialize React + Vite project
- [x] Set up Flask Backend
- [x] Sign up for Gemini & Unsplash APIs
- [x] Create SQLite database schema
- [x] Seed initial destinations

**Week 3-4: Backend**
- [x] Build AI integration (Gemini)
- [x] Implement trip generation API
- [x] Build image fetching system
- [x] Test AI with various inputs

**Week 5-6: Frontend**
- [x] Build landing page
- [x] Build trip form
- [x] Build itinerary viewer
- [ ] Implement Drag & Drop Editor (In Progress)
- [ ] User Dashboard

**Deliverable:** Live MVP running locally.

---

## 🛠️ Tech Stack

### Frontend
- React 19 + Vite
- Tailwind CSS
- Lucide React (Icons)
- dnd-kit (Drag & Drop)

### Backend
- Python 3.12 + Flask
- SQLAlchemy (ORM)
- SQLite (Database)
- JWT (Authentication)

### AI & APIs
- Google Gemini 2.0 Flash
- Unsplash API

### Hosting
- Frontend: Vercel (Recommended)
- Backend: Render / Railway (Recommended)

---

## 💰 Cost Analysis

### MVP Phase (Current)
| Item | Cost |
|------|------|
| Gemini API | ₹0 (free tier) |
| Unsplash API | ₹0 (free) |
| Backend Hosting | ₹0 (Render Free Tier) |
| Frontend Hosting | ₹0 (Vercel Hobby) |
| **Total** | **₹0/month** |

**Supports:** Development and early testing.

---

## 🚀 Getting Started

### Immediate Next Steps

**1. Start Backend**
```bash
cd backend
# Create virtual environment
python -m venv .venv
# Activate
.venv\Scripts\activate
# Install deps
pip install -r requirements.txt
# Run
python app.py
```

**2. Start Frontend**
```bash
# In new terminal
npm install
npm run dev
```

**3. Verify**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000 (Health check)

---