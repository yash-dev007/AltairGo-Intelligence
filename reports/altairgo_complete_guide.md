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
FRONTEND (Next.js 14 + React)
├── Landing Page
├── Trip Builder
├── Itinerary Viewer
├── Destination Details
├── User Dashboard
└── Saved Trips
         ↓
BACKEND API LAYER (Next.js API Routes)
├── POST /api/generate-trip
├── GET /api/destinations/:id
├── POST /api/save-trip
├── GET /api/user/trips
├── POST /api/customize-itinerary
└── GET /api/destination-details/:name
         ↓
AI & DATA LAYER
├── Gemini 2.0 Flash API (Itinerary)
├── Unsplash API (Images)
└── Supabase (PostgreSQL Database)
         ↓
HOSTING & CDN
├── Vercel (App Hosting)
├── Cloudflare (CDN)
└── Supabase (Database Hosting)
```

### API Flow for Trip Generation

```
1. User submits form
2. Frontend: POST /api/generate-trip
   {
     startCity: "Mumbai",
     destination: "Rajasthan",
     budget: 35000,
     duration: 7,
     interests: ["culture", "photography"],
     travelStyle: "mid-range"
   }
3. Backend validates input
4. Backend constructs AI prompt
5. Call Gemini 2.0 Flash API
6. AI generates itinerary JSON
7. Backend enriches with images (Unsplash)
8. Backend stores in database
9. Return to frontend
10. Frontend displays trip options
```

---

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Destinations Table (Pre-populated)
```sql
CREATE TABLE destinations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  country VARCHAR(100) NOT NULL,
  region VARCHAR(100),
  state VARCHAR(100),
  
  -- Media
  hero_image_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  gallery_images TEXT[],
  
  -- Basic Info
  description TEXT NOT NULL,
  nickname VARCHAR(255),
  tagline VARCHAR(255),
  
  -- Travel Info
  avg_cost_per_day INTEGER NOT NULL,
  ideal_duration INTEGER NOT NULL,
  best_season VARCHAR(100),
  peak_season_months VARCHAR(100)[],
  
  -- Categories
  destination_type VARCHAR(50),
  activities TEXT[],
  suitable_for TEXT[],
  
  -- Getting There
  nearest_airport VARCHAR(100),
  airport_code VARCHAR(10),
  airport_distance_km INTEGER,
  train_connectivity VARCHAR(50),
  major_train_station VARCHAR(100),
  
  -- Ratings
  popularity_score INTEGER DEFAULT 0,
  user_rating DECIMAL(2,1),
  total_reviews INTEGER DEFAULT 0,
  
  -- SEO
  meta_title VARCHAR(255),
  meta_description TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_destinations_country ON destinations(country);
CREATE INDEX idx_destinations_activities ON destinations USING GIN(activities);
CREATE INDEX idx_destinations_popularity ON destinations(popularity_score DESC);
```

### Attractions Table
```sql
CREATE TABLE attractions (
  id SERIAL PRIMARY KEY,
  destination_id INTEGER REFERENCES destinations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  
  -- Media
  image_url TEXT NOT NULL,
  gallery_images TEXT[],
  
  -- Details
  description TEXT,
  short_description VARCHAR(500),
  
  -- Visit Info
  entry_cost INTEGER,
  duration VARCHAR(50),
  best_time_to_visit VARCHAR(100),
  
  -- Categories
  category VARCHAR(100),
  tags TEXT[],
  
  -- Ratings
  rating DECIMAL(2,1),
  review_count INTEGER DEFAULT 0,
  
  -- Location
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Practical Info
  opening_hours VARCHAR(100),
  closed_on VARCHAR(100),
  average_crowd_level VARCHAR(50),
  
  -- Booking
  booking_required BOOLEAN DEFAULT FALSE,
  booking_url TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_attractions_destination ON attractions(destination_id);
CREATE INDEX idx_attractions_rating ON attractions(rating DESC);
```

### Destination Tips Table (AI-Generated)
```sql
CREATE TABLE destination_tips (
  id SERIAL PRIMARY KEY,
  destination_id INTEGER REFERENCES destinations(id) ON DELETE CASCADE,
  tip TEXT NOT NULL,
  category VARCHAR(50),
  generated_at TIMESTAMP DEFAULT NOW(),
  is_ai_generated BOOLEAN DEFAULT TRUE,
  cache_valid_until TIMESTAMP,
  UNIQUE(destination_id, tip)
);
```

### Trips Table (User-generated)
```sql
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Trip Basics
  title VARCHAR(255) NOT NULL,
  destination_country VARCHAR(100) NOT NULL,
  destinations TEXT[] NOT NULL,
  
  -- User Inputs
  start_city VARCHAR(100),
  budget INTEGER NOT NULL,
  duration INTEGER NOT NULL,
  travel_style VARCHAR(50),
  interests TEXT[],
  
  -- Travel Dates
  start_date DATE,
  end_date DATE,
  
  -- Generated Data
  itinerary_json JSONB NOT NULL,
  total_cost INTEGER,
  
  -- Status
  is_public BOOLEAN DEFAULT FALSE,
  is_completed BOOLEAN DEFAULT FALSE,
  
  -- Engagement
  view_count INTEGER DEFAULT 0,
  save_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_trips_user ON trips(user_id);
CREATE INDEX idx_trips_destination ON trips(destination_country);
CREATE INDEX idx_trips_created ON trips(created_at DESC);
```

### Sample Data
```sql
INSERT INTO destinations (
  name, slug, country, region,
  hero_image_url, thumbnail_url,
  description, nickname,
  avg_cost_per_day, ideal_duration, best_season,
  activities, suitable_for,
  nearest_airport, airport_code
) VALUES (
  'Jaipur', 'jaipur', 'India', 'Rajasthan',
  'https://images.unsplash.com/photo-jaipur',
  'https://images.unsplash.com/photo-jaipur?w=400',
  'The Pink City, known for magnificent forts and palaces',
  'The Pink City',
  2500, 3, 'October to March',
  ARRAY['Forts', 'Palaces', 'Markets', 'Photography'],
  ARRAY['Families', 'Couples', 'Solo'],
  'Jaipur International Airport', 'JAI'
);
```

---

## 🤖 AI Implementation

### Prompt Engineering

**Master Prompt Template:**
```javascript
export function buildItineraryPrompt(userInputs) {
  const {
    startCity,
    destination,
    budget,
    duration,
    interests,
    travelStyle
  } = userInputs;

  return `You are an expert travel planner. Generate personalized trip itineraries.

USER REQUIREMENTS:
- From: ${startCity}
- To: ${destination}
- Budget: ₹${budget} (${travelStyle})
- Duration: ${duration} days
- Interests: ${interests.join(', ')}

Create 2 trip options with day-by-day itineraries.

RESPONSE FORMAT (JSON only):
{
  "options": [
    {
      "title": "Trip name",
      "destinations": ["City1", "City2"],
      "total_cost": 35000,
      "reasoning": "Why perfect for them",
      "itinerary": [
        {
          "day": 1,
          "location": "City",
          "activities": [
            {
              "time": "Morning",
              "activity": "Amber Fort",
              "description": "Details",
              "duration": "3 hours",
              "cost": 500
            }
          ]
        }
      ]
    }
  ]
}`;
}
```

### Gemini API Integration
```javascript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateItinerary(userInputs) {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash-exp"
  });

  const prompt = buildItineraryPrompt(userInputs);
  const result = await model.generateContent(prompt);
  const response = result.response.text();
  
  const cleanedResponse = response
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();
  
  return JSON.parse(cleanedResponse);
}
```

### API Route
```javascript
// app/api/generate-trip/route.js
import { generateItinerary } from '@/lib/ai/gemini';
import { enrichWithImages } from '@/lib/images/unsplash';

export async function POST(request) {
  const userInputs = await request.json();
  
  // Generate with AI
  const itinerary = await generateItinerary(userInputs);
  
  // Add images
  const enrichedItinerary = await enrichWithImages(itinerary);
  
  // Save to database
  await saveToDatabase(enrichedItinerary);
  
  return NextResponse.json({ itinerary: enrichedItinerary });
}
```

---

## 🖼️ Image & Media Strategy

### Unsplash API Integration
```javascript
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

export async function searchDestinationImage(destinationName) {
  const query = `${destinationName} landmark travel`;
  const response = await fetch(
    `https://api.unsplash.com/search/photos?query=${query}&per_page=1&client_id=${UNSPLASH_ACCESS_KEY}`
  );
  
  const data = await response.json();
  
  if (data.results?.length > 0) {
    const photo = data.results[0];
    return {
      url: photo.urls.regular,
      thumbnail: photo.urls.small,
      photographer: photo.user.name
    };
  }
  
  return getPlaceholderImage(destinationName);
}
```

### Image Caching
```javascript
export async function getCachedImage(destinationName) {
  // Check database first
  const cached = await db.getDestination(destinationName);
  if (cached?.image_url) return cached;
  
  // Fetch from Unsplash
  const imageData = await searchDestinationImage(destinationName);
  
  // Cache for next time
  await db.updateDestination(destinationName, { image_url: imageData.url });
  
  return imageData;
}
```

### Frontend Image Component
```jsx
export function DestinationImage({ destination, className }) {
  const [imageData, setImageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadImage() {
      const data = await fetch(`/api/images/destination?name=${destination}`);
      setImageData(await data.json());
      setLoading(false);
    }
    loadImage();
  }, [destination]);

  if (loading) {
    return (
      <div className={`animate-pulse bg-gradient-to-br from-blue-400 to-purple-500 ${className}`}>
        <span className="text-white">{destination}</span>
      </div>
    );
  }

  return (
    <img 
      src={imageData.url} 
      alt={destination} 
      className={className}
    />
  );
}
```

---

## 🔌 API Integrations

### Current (MVP)
1. **Google Gemini 2.0 Flash** - AI itinerary generation
2. **Unsplash API** - Destination images
3. **Supabase** - Database and authentication

### Future (Post-Funding)

**Amadeus API (Flights)**
```javascript
export async function searchFlights(origin, destination, date) {
  const response = await amadeus.shopping.flightOffersSearch.get({
    originLocationCode: origin,
    destinationLocationCode: destination,
    departureDate: date,
    adults: '1',
    max: '5'
  });
  
  return response.data.map(offer => ({
    price: offer.price.total,
    airline: offer.validatingAirlineCodes[0],
    departure: offer.itineraries[0].segments[0].departure.at,
    bookingLink: `https://makemytrip.com/...`
  }));
}
```

**Booking.com (Hotels)**
```javascript
export function getHotelSearchLink(city, checkIn, checkOut) {
  const affiliateId = process.env.BOOKING_AFFILIATE_ID;
  return `https://www.booking.com/searchresults.html?ss=${city}&checkin=${checkIn}&checkout=${checkOut}&aid=${affiliateId}`;
}
```

---

## 📅 Development Roadmap

### Phase 1: MVP (Weeks 1-6) - ₹0 Budget

**Week 1-2: Setup**
- [ ] Initialize Next.js project
- [ ] Set up Supabase
- [ ] Sign up for Gemini & Unsplash APIs
- [ ] Create database schema
- [ ] Seed 50 destinations

**Week 3-4: Backend**
- [ ] Build AI integration
- [ ] Implement trip generation API
- [ ] Build image fetching system
- [ ] Test AI with 20+ inputs

**Week 5-6: Frontend**
- [ ] Build landing page
- [ ] Build trip form
- [ ] Build itinerary viewer
- [ ] Build destination modal
- [ ] Deploy to Vercel

**Deliverable:** Live MVP at altairgo.vercel.app

---

### Phase 2: Growth (Weeks 7-12) - ₹2k Budget

**Week 7-8: Polish**
- [ ] Add user authentication
- [ ] Build user dashboard
- [ ] Add PDF export
- [ ] Optimize performance

**Week 9-10: Content**
- [ ] Expand to 200 destinations
- [ ] Add SEO optimization
- [ ] Create example trips

**Week 11-12: Marketing**
- [ ] Share on social media
- [ ] Reddit/Facebook posts
- [ ] Product Hunt launch
- [ ] Get 100 users

**Deliverable:** 100+ users, testimonials

---

### Phase 3: Funding (Weeks 13-16)

- [ ] Create pitch deck
- [ ] Apply to grants (Startup India, NIDHI)
- [ ] Apply to competitions
- [ ] Pitch to incubators

**Target:** ₹5-10L funding

---

### Phase 4: Scale (Months 5-12) - ₹5-10L Budget

**Months 5-6: Enhancement**
- [ ] Upgrade to Claude/GPT-4
- [ ] Integrate flight/hotel APIs
- [ ] Add chat interface
- [ ] Build mobile app

**Months 7-9: Team**
- [ ] Hire 2 developers
- [ ] Hire content writer
- [ ] Scale infrastructure

**Months 10-12: Revenue**
- [ ] Launch premium subscription
- [ ] Optimize conversions
- [ ] Scale to 10k+ users
- [ ] Achieve ₹50k-2L revenue/month

---

## 🛠️ Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Framer Motion (animations)

### Backend
- Next.js API Routes
- PostgreSQL (Supabase)
- Supabase Auth

### AI & APIs
- Google Gemini 2.0 Flash
- Unsplash API
- Future: Amadeus, Booking.com

### Hosting
- Vercel (app)
- Supabase (database)
- Cloudflare (CDN)

### Tools
- Git + GitHub
- pnpm
- ESLint + Prettier

---

## 💰 Cost Analysis

### MVP Phase (Months 1-4)
| Item | Cost |
|------|------|
| Gemini API | ₹0 (free tier) |
| Unsplash API | ₹0 (free) |
| Supabase | ₹0 (free tier) |
| Vercel | ₹0 (hobby plan) |
| Domain | ₹1,000/year |
| **Total** | **₹83/month** |

**Supports:** 5,000 users/month

---

### Growth Phase (Months 5-6)
| Item | Cost/Month |
|------|------------|
| Gemini API | ₹2,000-5,000 |
| Supabase Pro | ₹2,000 |
| Vercel Pro | ₹1,500 |
| **Total** | **₹5,500-8,500** |

**Supports:** 20,000 users/month

---

### Funded Phase (Months 7-12)
| Item | Cost/Month |
|------|------------|
| AI (Claude/GPT-4) | ₹40,000 |
| Flight/Hotel APIs | ₹15,000 |
| Infrastructure | ₹10,000 |
| Team (2 devs) | ₹50,000 |
| Marketing | ₹30,000 |
| **Total** | **₹145,000** |

**Revenue Target:** ₹200,000/month
**Profitable!**

---

## 💵 Monetization Strategy

### 1. Affiliate Commissions (70% revenue)

**Flights**
- Commission: 2-5% per booking
- Avg booking: ₹8,000
- Per booking: ₹160-400
- Target: 100/month = ₹16k-40k

**Hotels**
- Commission: 4-8%
- Avg booking: ₹10,000
- Per booking: ₹400-800
- Target: 150/month = ₹60k-120k

**Activities**
- Commission: 10-15%
- Avg: ₹2,000
- Per booking: ₹200-300
- Target: 50/month = ₹10k-15k

**Total:** ₹86k-175k/month

---

### 2. Premium Subscription (20% revenue)

**AltairGo Plus - ₹299/month**

Features:
- Unlimited regenerations
- Premium AI models
- Priority support
- Collaboration tools
- No ads

Target: 500 users × ₹299 = ₹149,500/month

---

### 3. B2B API (10% revenue)

For travel agencies:
- API access: ₹10k-50k/month per client
- Target: 3-5 clients = ₹30k-250k/month

---

### Revenue Projections

**Month 6**
- Users: 5,000
- Revenue: ₹30k-50k

**Month 12**
- Users: 20,000
- Revenue: ₹200k-400k/month

**Year 2**
- Users: 100,000
- Revenue: ₹1M-2M/month

---

## 🚀 Getting Started

### Immediate Next Steps

**Day 1:** Sign up
- Google Gemini: https://ai.google.dev
- Unsplash: https://unsplash.com/developers
- Supabase: https://supabase.com
- Vercel: https://vercel.com

**Day 2-3:** Initialize
```bash
npx create-next-app@latest altairgo --typescript --tailwind
cd altairgo
pnpm install @google/generative-ai @supabase/supabase-js
```

**Day 4-5:** Database
- Create Supabase project
- Run SQL schema
- Seed 10 destinations

**Day 6-7:** Test AI
- Build test script
- Refine prompts
- Validate JSON

---