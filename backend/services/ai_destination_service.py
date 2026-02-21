"""
AI-based Destination Generation Service
Replaces OSM-based destination discovery with Gemini AI (HTTP Implementation)
"""
import json
import os
import sys
import requests
import time
from dotenv import load_dotenv

load_dotenv(override=False)  # FIX #10: Don't override already-set env vars

# Force UTF-8 stdout so emoji print() calls don't crash on Windows (cp1252)
try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

# Configure Gemini Client
API_KEY = os.getenv("GEMINI_API_KEY")

# FIX #3: Only versioned, stable model strings — no unstable aliases
MODELS_TO_TRY = [
    'gemini-2.5-flash',       # Primary — free tier available
    'gemini-2.0-flash',       # Fallback
    'gemini-2.0-flash-lite',  # Last resort
]

# FIX #8: Simple in-memory cache keyed on (region_name_lower, country_code)
_destinations_cache: dict = {}
_regions_cache: dict = {}


def generate_content_http(prompt: str, model_name: str) -> str:
    """
    Call Gemini API via HTTP.  Retries on transient network/quota errors.

    Raises:
        EnvironmentError: if GEMINI_API_KEY is not configured.
        Exception:        on unrecoverable API or network errors.
    """
    # FIX #1: Fail fast rather than silently returning None
    if not API_KEY:
        raise EnvironmentError(
            "GEMINI_API_KEY is not set. Add it to your .env file."
        )

    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{model_name}:generateContent?key={API_KEY}"
    )
    headers = {"Content-Type": "application/json"}
    payload = {"contents": [{"parts": [{"text": prompt}]}]}

    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=60)

            if response.status_code == 200:
                data = response.json()
                try:
                    return data['candidates'][0]['content']['parts'][0]['text']
                except (KeyError, IndexError):
                    raise Exception(
                        f"Invalid API response format from {model_name}: {data}"
                    )

            elif response.status_code in (429, 503):
                if attempt < max_retries - 1:
                    wait_time = (attempt + 1) * 2  # 2s, 4s, 6s
                    print(
                        f"[GeminiHTTP] {response.status_code} on {model_name}. "
                        f"Retrying in {wait_time}s..."
                    )
                    time.sleep(wait_time)
                    continue
                raise Exception(
                    f"HTTP {response.status_code} quota/service error after "
                    f"{max_retries} retries on {model_name}"
                )

            else:
                raise Exception(
                    f"HTTP {response.status_code} from {model_name}: {response.text}"
                )

        # FIX #2: Catch network-level errors specifically; don't re-check
        #         status codes that are already handled in the if/elif above.
        except requests.exceptions.RequestException as exc:
            if attempt < max_retries - 1:
                print(
                    f"[GeminiHTTP] Network error on {model_name} "
                    f"(attempt {attempt + 1}): {exc}. Retrying..."
                )
                time.sleep(2)
                continue
            raise


def _parse_destinations(text_resp: str, model_name: str, region_name: str) -> list:
    """
    Parse the raw text response from the AI into a list of destination dicts.
    Returns an empty list if parsing fails (caller will try next model).
    """
    clean_text = text_resp.replace("```json", "").replace("```", "").strip()

    try:
        data = json.loads(clean_text)
    except json.JSONDecodeError as exc:
        # FIX #4: Log a snippet of the raw response to aid debugging
        print(
            f"[AI] JSON decode error on {model_name}: {exc}\n"
            f"     Raw (first 300 chars): {clean_text[:300]}"
        )
        return []

    if isinstance(data, dict):
        destinations = data.get('destinations', [])
    elif isinstance(data, list):
        destinations = data
    else:
        print(f"[AI] Unexpected top-level type from {model_name}: {type(data)}")
        return []

    # FIX #5: Validate each entry has at minimum a 'name' key
    valid = [d for d in destinations if isinstance(d, dict) and d.get('name')]
    if len(valid) != len(destinations):
        print(
            f"[AI] Dropped {len(destinations) - len(valid)} invalid entries "
            f"(missing 'name') from {model_name} response"
        )

    return valid


def generate_destinations_for_region(
    region_name: str,
    country_name: str,
    country_code: str = None,
    limit: int = 50,
) -> list:
    """
    Generate tourist destinations for a region using AI.
    Returns a list of destination dicts.  Falls back to curated data on failure.
    """
    # FIX #8: Return cached result if available
    cache_key = (region_name.lower().strip(), (country_code or "").lower())
    if cache_key in _destinations_cache:
        print(f"[AI] Cache hit for {region_name}")
        return _destinations_cache[cache_key]

    # FIX #6: Derive currency from country code so international costs are correct
    currency = "INR" if (country_code or "").upper() == "IN" else "USD"
    currency_label = "INR (₹)" if currency == "INR" else "USD ($)"

    prompt = f"""
You are a travel expert. Generate a list of {limit} tourist destinations in {region_name}, {country_name}.

For each destination, provide:
- name: Official name of the place
- type: Category (e.g., "Historic Monument", "Nature", "Temple", "Beach", "Museum",
  "Viewpoint", "Park", "Market", "Palace", "Fort")
- description: A compelling 2-3 sentence description for travelers
- rating: Estimated rating from 4.0 to 4.9
- estimated_cost: Entry fee or estimated daily cost in {currency_label} (0 for free places)
- currency: "{currency}"
- best_time: Best time to visit (e.g., "October to March", "Year Round", "Monsoon")
- crowd_level: Expected crowd level ("Low", "Moderate", "High")
- highlights: Array of 3-4 key highlights or things to do
- image_keyword: Best search term for finding an image (e.g., "Taj Mahal Agra sunset")

Focus on:
- Mix of popular attractions and hidden gems
- Variety of categories (nature, culture, history, food, adventure)
- Places that are actually visitable by tourists
- Accurate local information

Output MUST be pure JSON with this structure:
{{
    "destinations": [
        {{
            "name": "...",
            "type": "...",
            "description": "...",
            "rating": 4.5,
            "estimated_cost": 500,
            "currency": "{currency}",
            "best_time": "...",
            "crowd_level": "...",
            "highlights": ["...", "..."],
            "image_keyword": "..."
        }}
    ]
}}
"""

    for model_name in MODELS_TO_TRY:
        try:
            print(f"[AI] Trying {model_name} for {region_name}...")
            text_resp = generate_content_http(prompt, model_name)

            destinations = _parse_destinations(text_resp, model_name, region_name)
            if not destinations:
                continue

            print(
                f"[AI] OK: {len(destinations)} places for {region_name} "
                f"via {model_name}"
            )
            _destinations_cache[cache_key] = destinations  # FIX #8: cache it
            return destinations

        except EnvironmentError:
            raise  # Propagate API key errors immediately — no point retrying
        except Exception as exc:
            print(f"[AI] {model_name} failed: {exc}")
            continue

    print("[AI] All models failed. Falling back to curated data.")
    result = get_curated_fallback_destinations(region_name)
    _destinations_cache[cache_key] = result
    return result


# ── Curated fallback destinations ─────────────────────────────────────────────
# Used when ALL AI models fail (quota exhausted, network issues, etc.)
# FIX #7: Only real, named, verifiable destinations here — no invented placeholders.

_CURATED_DESTINATIONS = {
    # ── Indian States ──────────────────────────────────────────────────────────
    "goa": [
        {"name": "Calangute Beach", "type": "Beach", "description": "The largest beach in Goa, famous for water sports, shacks, and vibrant nightlife.", "rating": 4.5, "estimated_cost": 500, "currency": "INR", "best_time": "November to February", "crowd_level": "High", "highlights": ["Water Sports", "Beach Shacks", "Sunset Views", "Flea Markets"], "image_keyword": "Calangute Beach Goa India"},
        {"name": "Baga Beach", "type": "Beach", "description": "Iconic beach known for its buzzing nightlife, water activities, and seaside restaurants.", "rating": 4.4, "estimated_cost": 600, "currency": "INR", "best_time": "November to March", "crowd_level": "High", "highlights": ["Nightlife", "Jet Skiing", "Seafood", "Water Sports"], "image_keyword": "Baga Beach Goa nightlife"},
        {"name": "Basilica of Bom Jesus", "type": "Historic Monument", "description": "UNESCO World Heritage Site housing the mortal remains of St. Francis Xavier, built in 1605.", "rating": 4.7, "estimated_cost": 0, "currency": "INR", "best_time": "October to March", "crowd_level": "Moderate", "highlights": ["Baroque Architecture", "UNESCO Heritage", "St. Francis Xavier Remains", "Photography"], "image_keyword": "Basilica Bom Jesus Old Goa church"},
        {"name": "Dudhsagar Falls", "type": "Nature", "description": "One of India's tallest waterfalls, a 310-metre cascade nestled in the Western Ghats forest.", "rating": 4.8, "estimated_cost": 400, "currency": "INR", "best_time": "June to September", "crowd_level": "Moderate", "highlights": ["Waterfall Trekking", "Jeep Safari", "Swimming", "Wildlife Spotting"], "image_keyword": "Dudhsagar Falls Goa waterfall"},
        {"name": "Fort Aguada", "type": "Historic Monument", "description": "17th-century Portuguese fort overlooking the Arabian Sea, offering panoramic views of the coastline.", "rating": 4.5, "estimated_cost": 50, "currency": "INR", "best_time": "October to March", "crowd_level": "Moderate", "highlights": ["Lighthouse", "Sea Views", "Portuguese Architecture", "Sunset"], "image_keyword": "Fort Aguada Goa lighthouse"},
        {"name": "Anjuna Beach", "type": "Beach", "description": "Bohemian beach famous for its flea market, rocky coves, and legendary trance parties.", "rating": 4.3, "estimated_cost": 300, "currency": "INR", "best_time": "November to February", "crowd_level": "Moderate", "highlights": ["Flea Market", "Rocky Coves", "Hippie Culture", "Beach Parties"], "image_keyword": "Anjuna Beach Goa flea market"},
        {"name": "Palolem Beach", "type": "Beach", "description": "A crescent-shaped paradise in South Goa known for its calm waters and relaxed vibe.", "rating": 4.6, "estimated_cost": 400, "currency": "INR", "best_time": "November to March", "crowd_level": "Low", "highlights": ["Kayaking", "Dolphin Spotting", "Beach Huts", "Silent Disco"], "image_keyword": "Palolem Beach South Goa paradise"},
        {"name": "Spice Plantation Tour", "type": "Nature", "description": "Guided tours through lush spice farms showcasing cardamom, pepper, vanilla, and tropical fruits.", "rating": 4.6, "estimated_cost": 800, "currency": "INR", "best_time": "Year Round", "crowd_level": "Low", "highlights": ["Spice Tasting", "Elephant Ride", "Traditional Goan Lunch", "Nature Walk"], "image_keyword": "Goa spice plantation farm"},
    ],

    "rajasthan": [
        {"name": "Amber Fort", "type": "Historic Monument", "description": "Magnificent 16th-century Rajput fort with Sheesh Mahal mirror work and sweeping views of Maota Lake.", "rating": 4.9, "estimated_cost": 550, "currency": "INR", "best_time": "October to March", "crowd_level": "High", "highlights": ["Sheesh Mahal", "Elephant Rides", "Sound and Light Show", "Panoramic Views"], "image_keyword": "Amber Fort Jaipur India hilltop"},
        {"name": "Hawa Mahal", "type": "Historic Monument", "description": "The iconic 'Palace of Winds' with 953 latticed windows, built for royal women to observe street life.", "rating": 4.7, "estimated_cost": 200, "currency": "INR", "best_time": "October to March", "crowd_level": "High", "highlights": ["Latticed Windows", "Architecture Photography", "Rooftop Views", "Museum"], "image_keyword": "Hawa Mahal Jaipur pink palace facade"},
        {"name": "Mehrangarh Fort", "type": "Historic Monument", "description": "One of India's largest forts, perched 400 feet above Jodhpur with stunning views of the Blue City.", "rating": 4.8, "estimated_cost": 600, "currency": "INR", "best_time": "October to February", "crowd_level": "Moderate", "highlights": ["Museum", "Blue City Views", "Folk Music", "Zip-lining"], "image_keyword": "Mehrangarh Fort Jodhpur Blue City"},
        {"name": "Jaisalmer Fort", "type": "Historic Monument", "description": "A living fort rising from the Thar Desert, home to a quarter of Jaisalmer's population since the 12th century.", "rating": 4.7, "estimated_cost": 0, "currency": "INR", "best_time": "October to February", "crowd_level": "Moderate", "highlights": ["Desert Views", "Haveli Architecture", "Rooftop Restaurants", "Sunset"], "image_keyword": "Jaisalmer Fort golden desert Rajasthan"},
        {"name": "Pushkar Lake", "type": "Nature", "description": "Sacred lake with 52 bathing ghats, surrounded by temples. Site of the famous Pushkar Camel Fair.", "rating": 4.5, "estimated_cost": 0, "currency": "INR", "best_time": "October to March", "crowd_level": "Moderate", "highlights": ["Camel Fair", "Brahma Temple", "Sunset Ghats", "Holy Dip"], "image_keyword": "Pushkar Lake ghats Rajasthan"},
        {"name": "City Palace Udaipur", "type": "Historic Monument", "description": "Majestic palace complex on the banks of Lake Pichola, blending European and Rajput architectural styles.", "rating": 4.7, "estimated_cost": 400, "currency": "INR", "best_time": "October to March", "crowd_level": "High", "highlights": ["Lake Views", "Museum", "Peacock Courtyard", "Boat Ride"], "image_keyword": "City Palace Udaipur lake India"},
        {"name": "Ranthambore National Park", "type": "Nature", "description": "Famous tiger reserve where Bengal tigers roam ancient ruins. Best wildlife safari in Rajasthan.", "rating": 4.6, "estimated_cost": 2000, "currency": "INR", "best_time": "October to June", "crowd_level": "Moderate", "highlights": ["Tiger Safari", "Historic Fort Ruins", "Bird Watching", "Leopards"], "image_keyword": "Ranthambore tiger safari Rajasthan"},
        {"name": "Thar Desert Camel Safari", "type": "Adventure", "description": "Overnight camel trek into the golden sand dunes of the Thar Desert with bonfire and folk performances.", "rating": 4.7, "estimated_cost": 1500, "currency": "INR", "best_time": "October to February", "crowd_level": "Low", "highlights": ["Sand Dunes", "Camel Ride", "Stargazing", "Cultural Performances"], "image_keyword": "Thar Desert camel dunes Rajasthan sunset"},
    ],

    "maharashtra": [
        {"name": "Gateway of India", "type": "Historic Monument", "description": "Iconic 1924 basalt arch monument overlooking the Arabian Sea, the symbol of Mumbai.", "rating": 4.6, "estimated_cost": 0, "currency": "INR", "best_time": "Year Round", "crowd_level": "High", "highlights": ["Architecture", "Boat Rides to Elephanta", "Photography", "Sunset Views"], "image_keyword": "Gateway of India Mumbai arch monument"},
        {"name": "Ajanta Caves", "type": "Historic Monument", "description": "UNESCO-listed 30 rock-cut Buddhist cave monuments with breathtaking 2nd-century BCE paintings.", "rating": 4.8, "estimated_cost": 500, "currency": "INR", "best_time": "October to March", "crowd_level": "Moderate", "highlights": ["Rock-cut Architecture", "Ancient Murals", "UNESCO Heritage", "Buddhist Sculptures"], "image_keyword": "Ajanta Caves paintings ancient India"},
        {"name": "Ellora Caves", "type": "Historic Monument", "description": "34 monasteries and temples cut into vertical rock, representing Buddhist, Hindu, and Jain traditions.", "rating": 4.8, "estimated_cost": 500, "currency": "INR", "best_time": "Year Round", "crowd_level": "Moderate", "highlights": ["Kailash Temple", "Rock Architecture", "Three Religions", "Sculpture Art"], "image_keyword": "Ellora Caves Kailash temple rock cut"},
        {"name": "Marine Drive", "type": "Urban Exploration", "description": "The 'Queen's Necklace' — a 3.6 km boulevard along the Arabian Sea with art deco buildings.", "rating": 4.5, "estimated_cost": 0, "currency": "INR", "best_time": "Year Round", "crowd_level": "High", "highlights": ["Evening Promenade", "Art Deco Architecture", "Night Views", "Street Food"], "image_keyword": "Marine Drive Mumbai sea face night"},
        {"name": "Lonavala Hill Station", "type": "Nature", "description": "Popular hill station in the Sahyadri range, famous for lush valleys, forts, and chikki sweets.", "rating": 4.4, "estimated_cost": 300, "currency": "INR", "best_time": "June to September", "crowd_level": "Moderate", "highlights": ["Bhushi Dam", "Tiger's Leap", "Chikki Shopping", "Valley Views"], "image_keyword": "Lonavala hill station monsoon Maharashtra"},
        {"name": "Shirdi Sai Baba Temple", "type": "Temple", "description": "One of India's most visited religious sites, attracting millions of devotees of Sai Baba.", "rating": 4.7, "estimated_cost": 0, "currency": "INR", "best_time": "Year Round", "crowd_level": "High", "highlights": ["Sai Baba Samadhi", "Dwarkamai", "Chavadi", "Prasad"], "image_keyword": "Shirdi Sai Baba temple Maharashtra"},
        {"name": "Mahabaleshwar", "type": "Nature", "description": "Scenic hill station offering panoramic views across the Western Ghats, famous for strawberry farms.", "rating": 4.5, "estimated_cost": 500, "currency": "INR", "best_time": "October to June", "crowd_level": "Moderate", "highlights": ["Arthur's Seat", "Venna Lake", "Strawberry Picking", "Mapro Garden"], "image_keyword": "Mahabaleshwar hill station Maharashtra strawberry"},
        {"name": "Elephanta Caves", "type": "Historic Monument", "description": "UNESCO island caves featuring magnificent 6th-century rock-cut Shiva sculptures, accessible by ferry.", "rating": 4.6, "estimated_cost": 400, "currency": "INR", "best_time": "November to May", "crowd_level": "Moderate", "highlights": ["Trimurti Shiva", "Ferry Ride", "Rock Architecture", "Sea Views"], "image_keyword": "Elephanta Caves Mumbai island sculptures"},
    ],

    "kerala": [
        {"name": "Alleppey Backwaters", "type": "Nature", "description": "Serene network of lagoons, lakes and canals. Experience Kerala's famous houseboat cruises.", "rating": 4.8, "estimated_cost": 3000, "currency": "INR", "best_time": "October to February", "crowd_level": "Moderate", "highlights": ["Houseboat Stay", "Canoe Rides", "Village Life", "Sunset Cruise"], "image_keyword": "Alleppey backwaters houseboat Kerala"},
        {"name": "Munnar Tea Gardens", "type": "Nature", "description": "Picturesque hill station blanketed in tea plantations at 1,600m, misty peaks and waterfalls.", "rating": 4.7, "estimated_cost": 400, "currency": "INR", "best_time": "October to June", "crowd_level": "Moderate", "highlights": ["Tea Factory Tour", "Eravikulam National Park", "Top Station", "Nilgiri Tahr"], "image_keyword": "Munnar tea plantations hills Kerala"},
        {"name": "Periyar Wildlife Sanctuary", "type": "Nature", "description": "Tiger reserve around beautiful Periyar Lake with boat safaris spotting elephants, gaur and tigers.", "rating": 4.6, "estimated_cost": 700, "currency": "INR", "best_time": "October to May", "crowd_level": "Moderate", "highlights": ["Elephant Herds", "Boat Safari", "Spice Plantation", "Jungle Trekking"], "image_keyword": "Periyar wildlife elephants Kerala"},
        {"name": "Kovalam Beach", "type": "Beach", "description": "Crescent-shaped beach famous for its lighthouse and Ayurvedic massage centres.", "rating": 4.5, "estimated_cost": 500, "currency": "INR", "best_time": "September to March", "crowd_level": "Moderate", "highlights": ["Lighthouse Beach", "Ayurvedic Spa", "Surfing", "Seafood"], "image_keyword": "Kovalam Beach lighthouse Kerala"},
        {"name": "Wayanad Wildlife Sanctuary", "type": "Nature", "description": "Dense forest reserve home to elephants, tigers, leopards, and ancient tribal settlements.", "rating": 4.6, "estimated_cost": 600, "currency": "INR", "best_time": "October to April", "crowd_level": "Low", "highlights": ["Edakkal Caves", "Elephant Corridor", "Tribal Villages", "Bamboo Forest"], "image_keyword": "Wayanad forest wildlife Kerala"},
    ],

    "himachal pradesh": [
        {"name": "Manali", "type": "Adventure", "description": "Gateway to Ladakh and Spiti, offering skiing, river rafting, and the stunning Rohtang Pass.", "rating": 4.7, "estimated_cost": 1500, "currency": "INR", "best_time": "October to June / December to February", "crowd_level": "High", "highlights": ["Rohtang Pass", "Solang Valley", "Kullu Rafting", "Hadimba Temple"], "image_keyword": "Manali snow mountains Himachal Pradesh"},
        {"name": "Shimla", "type": "Urban Exploration", "description": "The 'Queen of Hills' — former summer capital of British India with colonial architecture.", "rating": 4.5, "estimated_cost": 800, "currency": "INR", "best_time": "March to June", "crowd_level": "High", "highlights": ["The Mall Road", "Christ Church", "Toy Train", "Kufri"], "image_keyword": "Shimla hill station snow Himachal Pradesh"},
        {"name": "Spiti Valley", "type": "Adventure", "description": "Remote high-altitude cold desert with ancient monasteries, stark landscapes, and star gazing nights.", "rating": 4.9, "estimated_cost": 1000, "currency": "INR", "best_time": "June to September", "crowd_level": "Low", "highlights": ["Key Monastery", "Chandratal Lake", "Fossil Sites", "Stargazing"], "image_keyword": "Spiti Valley monastery Himachal cold desert"},
        {"name": "Dharamsala & McLeod Ganj", "type": "Culture", "description": "Home of the Dalai Lama and the Tibetan government-in-exile. Vibrant mix of Tibetan and Indian cultures.", "rating": 4.7, "estimated_cost": 700, "currency": "INR", "best_time": "March to June", "crowd_level": "Moderate", "highlights": ["Namgyal Monastery", "Tibetan Cafes", "Triund Trek", "Mcleod Market"], "image_keyword": "McLeod Ganj Dharamsala Tibetan temple"},
    ],

    "uttar pradesh": [
        {"name": "Taj Mahal", "type": "Historic Monument", "description": "One of the Seven Wonders of the World. This white marble mausoleum is poetry in stone.", "rating": 5.0, "estimated_cost": 1100, "currency": "INR", "best_time": "October to March", "crowd_level": "High", "highlights": ["Sunrise View", "Main Mausoleum", "Mughal Gardens", "Shah Jahan Story"], "image_keyword": "Taj Mahal Agra white marble sunrise"},
        {"name": "Agra Fort", "type": "Historic Monument", "description": "UNESCO-listed red sandstone Mughal fort with palaces, mosques, and views of the Taj Mahal.", "rating": 4.6, "estimated_cost": 650, "currency": "INR", "best_time": "October to March", "crowd_level": "High", "highlights": ["Diwan-i-Khas", "Taj Mahal Views", "Mughal Architecture", "Jahangiri Mahal"], "image_keyword": "Agra Fort red sandstone Mughal"},
        {"name": "Varanasi Ghats", "type": "Culture", "description": "The world's oldest living city. Experience the Ganga Aarti at Dashashwamedh Ghat at dusk.", "rating": 4.8, "estimated_cost": 200, "currency": "INR", "best_time": "October to March", "crowd_level": "High", "highlights": ["Ganga Aarti", "Boat Ride at Sunrise", "Ancient Temples", "Silk Weaving"], "image_keyword": "Varanasi ghats Ganga Aarti ceremony"},
        {"name": "Sarnath", "type": "Historic Monument", "description": "Where Buddha gave his first sermon. Ancient stupas, Ashoka pillars and fine Buddhist museum.", "rating": 4.5, "estimated_cost": 300, "currency": "INR", "best_time": "October to March", "crowd_level": "Moderate", "highlights": ["Dhamek Stupa", "Ashoka Pillar", "Buddhist Museum", "Thai Monastery"], "image_keyword": "Sarnath Buddhist stupa Uttar Pradesh"},
    ],

    "karnataka": [
        {"name": "Hampi", "type": "Historic Monument", "description": "UNESCO ruined city of the Vijayanagara Empire — a surreal landscape of boulder-strewn hills and temples.", "rating": 4.9, "estimated_cost": 500, "currency": "INR", "best_time": "October to February", "crowd_level": "Moderate", "highlights": ["Virupaksha Temple", "Stone Chariot", "Tungabhadra River", "Coracle Ride"], "image_keyword": "Hampi ruins Karnataka UNESCO heritage"},
        {"name": "Mysore Palace", "type": "Historic Monument", "description": "Opulent Indo-Saracenic palace of the Wadiyar dynasty, illuminated by 100,000 bulbs on Sundays.", "rating": 4.7, "estimated_cost": 100, "currency": "INR", "best_time": "October to February", "crowd_level": "High", "highlights": ["Palace Illumination", "Durbar Hall", "Devaraja Market", "Chamundi Hills"], "image_keyword": "Mysore Palace illuminated Karnataka night"},
        {"name": "Coorg Coffee Estates", "type": "Nature", "description": "Scotland of India — misty hills, coffee and spice plantations, and the sacred Cauvery River.", "rating": 4.6, "estimated_cost": 800, "currency": "INR", "best_time": "October to May", "crowd_level": "Moderate", "highlights": ["Coffee Plantation Walk", "Namdroling Monastery", "River Rafting", "Abbey Falls"], "image_keyword": "Coorg coffee plantation Karnataka hills"},
        {"name": "Jog Falls", "type": "Nature", "description": "India's second highest plunge waterfall cascading 830 feet in four distinct streams.", "rating": 4.5, "estimated_cost": 0, "currency": "INR", "best_time": "July to September", "crowd_level": "Moderate", "highlights": ["Waterfall View", "Photography", "Nature Trails", "Monsoon Trek"], "image_keyword": "Jog Falls Karnataka waterfall"},
    ],

    # ── International ──────────────────────────────────────────────────────────
    "thailand": [
        {"name": "Grand Palace Bangkok", "type": "Historic Monument", "description": "Dazzling complex of royal halls, temples and the sacred Emerald Buddha — Thailand's top attraction.", "rating": 4.8, "estimated_cost": 35, "currency": "USD", "best_time": "November to April", "crowd_level": "High", "highlights": ["Emerald Buddha", "Wat Phra Kaew", "Royal Halls", "Mural Art"], "image_keyword": "Grand Palace Bangkok temple gold Thailand"},
        {"name": "Phi Phi Islands", "type": "Beach", "description": "Iconic limestone cliffs and turquoise waters — the setting for 'The Beach'. Maya Bay is stunning.", "rating": 4.8, "estimated_cost": 80, "currency": "USD", "best_time": "November to April", "crowd_level": "High", "highlights": ["Maya Bay", "Snorkeling", "Limestone Cliffs", "Sunset Cruise"], "image_keyword": "Phi Phi Islands blue water Thailand limestone"},
        {"name": "Chiang Mai Old City", "type": "Culture", "description": "300+ temples in a moat-encircled old city. Visit during Yi Peng Lantern Festival for magical skies.", "rating": 4.7, "estimated_cost": 30, "currency": "USD", "best_time": "November to April", "crowd_level": "Moderate", "highlights": ["Doi Suthep Temple", "Night Bazaar", "Thai Cooking Class", "Lantern Festival"], "image_keyword": "Chiang Mai temple Thailand old city"},
        {"name": "Pattaya Beach", "type": "Beach", "description": "Lively resort city famous for entertainment, water sports, coral islands and vibrant nightlife.", "rating": 4.2, "estimated_cost": 60, "currency": "USD", "best_time": "November to April", "crowd_level": "High", "highlights": ["Coral Island", "Walking Street", "Sanctuary of Truth", "Speedboat Tour"], "image_keyword": "Pattaya beach Thailand resort"},
    ],

    "japan": [
        {"name": "Fushimi Inari Shrine", "type": "Temple", "description": "Thousands of vermillion torii gates wind through forest-covered hills above Kyoto. Simply magical.", "rating": 4.9, "estimated_cost": 0, "currency": "USD", "best_time": "March to May / October to November", "crowd_level": "High", "highlights": ["Torii Gate Tunnels", "Night Photography", "Summit Trail", "Fox Shrines"], "image_keyword": "Fushimi Inari torii gates Kyoto Japan"},
        {"name": "Mount Fuji", "type": "Nature", "description": "Japan's sacred volcano and highest peak, visible from Tokyo on clear days. Climbing season July-August.", "rating": 4.9, "estimated_cost": 25, "currency": "USD", "best_time": "July to September", "crowd_level": "Moderate", "highlights": ["Sunrise Climb", "Fuji Five Lakes", "Photography", "Bullet Train Views"], "image_keyword": "Mount Fuji snow Japan landmark"},
        {"name": "Shibuya Crossing", "type": "Urban Exploration", "description": "World's busiest pedestrian crossing — a sensory overload of neon, fashion, and Japanese culture.", "rating": 4.6, "estimated_cost": 0, "currency": "USD", "best_time": "Year Round", "crowd_level": "High", "highlights": ["Rush Hour Crossing", "Rooftop Views", "Shopping", "Street Food"], "image_keyword": "Shibuya crossing Tokyo Japan neon night"},
        {"name": "Arashiyama Bamboo Grove", "type": "Nature", "description": "Towering bamboo stalks create an otherworldly path in the hills of western Kyoto.", "rating": 4.7, "estimated_cost": 0, "currency": "USD", "best_time": "March to May / October to November", "crowd_level": "High", "highlights": ["Bamboo Path", "Tenryu-ji Garden", "Boat Ride", "Monkey Park"], "image_keyword": "Arashiyama bamboo grove Kyoto Japan"},
    ],
}

# FIX #9: Curated region fallbacks for common country codes
_CURATED_REGIONS = {
    "IN": [
        {"name": "Rajasthan", "reason": "India's most colourful state, packed with forts, palaces, and the Thar Desert.", "best_for": "History & culture lovers", "image_keyword": "Rajasthan fort palace India"},
        {"name": "Kerala", "reason": "Lush backwaters, tea gardens, and pristine beaches make it India's most relaxing destination.", "best_for": "Nature & wellness seekers", "image_keyword": "Kerala backwaters houseboat India"},
        {"name": "Goa", "reason": "Sun, sea, Portuguese heritage, and a buzzing nightlife scene all in one compact state.", "best_for": "Beach & nightlife travellers", "image_keyword": "Goa beach India sunset"},
        {"name": "Himachal Pradesh", "reason": "Snow-capped Himalayas, adventure sports, and serene hill stations like Manali and Shimla.", "best_for": "Adventure & trekking enthusiasts", "image_keyword": "Himachal Pradesh mountains snow"},
        {"name": "Karnataka", "reason": "Home to UNESCO sites Hampi and Badami, the royal city of Mysore, and coffee country Coorg.", "best_for": "Culture & heritage travellers", "image_keyword": "Karnataka Hampi ruins temple"},
    ],
    "TH": [
        {"name": "Bangkok", "reason": "Thailand's dazzling capital with grand temples, street food, and endless shopping.", "best_for": "First-time visitors & food lovers", "image_keyword": "Bangkok temple Thailand skyline"},
        {"name": "Chiang Mai", "reason": "Northern cultural hub with hundreds of temples, elephant sanctuaries, and trekking routes.", "best_for": "Culture & nature seekers", "image_keyword": "Chiang Mai temple Thailand"},
        {"name": "Phuket & Krabi", "reason": "World-class beaches, dramatic limestone cliffs, and island-hopping adventures.", "best_for": "Beach & water sports travellers", "image_keyword": "Phuket island Thailand beach"},
    ],
    "JP": [
        {"name": "Kyoto", "reason": "Japan's cultural heartland with over 1,600 Buddhist temples and traditional geisha districts.", "best_for": "Culture & history enthusiasts", "image_keyword": "Kyoto temple Japan cherry blossom"},
        {"name": "Tokyo", "reason": "A hyper-modern metropolis that seamlessly blends cutting-edge technology with ancient tradition.", "best_for": "Urban explorers & foodies", "image_keyword": "Tokyo skyline Japan night"},
        {"name": "Hokkaido", "reason": "Japan's northern island famous for powder snow skiing, lavender fields, and fresh seafood.", "best_for": "Nature & adventure lovers", "image_keyword": "Hokkaido lavender fields Japan"},
    ],
}


def get_curated_fallback_destinations(region_name: str) -> list:
    """
    Return curated real destinations when AI is unavailable.
    Returns an empty list (not invented placeholders) if no data exists.
    FIX #7: Removed fabricated generic destination names.
    """
    region_lower = region_name.lower().strip()

    # Exact match
    if region_lower in _CURATED_DESTINATIONS:
        print(f"[Curated] Found data for: {region_name}")
        return _CURATED_DESTINATIONS[region_lower]

    # Partial match (e.g., "Goa, India" → "goa")
    for key, data in _CURATED_DESTINATIONS.items():
        if key in region_lower or region_lower in key:
            print(f"[Curated] Partial match '{key}' for: {region_name}")
            return data

    # FIX #7: Return empty list rather than invented placeholder destinations
    print(
        f"[Curated] No curated data for '{region_name}'. "
        "Returning empty list — add this region to _CURATED_DESTINATIONS."
    )
    return []


def generate_region_recommendations(country_code: str, preferences: dict = None) -> list:
    """
    Return recommended regions/states for a country.
    Tries AI first; falls back to _CURATED_REGIONS on failure.
    """
    # FIX #8: Cache by country_code + serialised preferences
    pref_key = json.dumps(preferences, sort_keys=True) if preferences else ""
    cache_key = f"{country_code.upper()}:{pref_key}"
    if cache_key in _regions_cache:
        return _regions_cache[cache_key]

    pref_context = ""
    if preferences:
        pref_context = f"""
User Preferences:
- Budget: ₹{preferences.get('budget', 50000)}
- Duration: {preferences.get('duration', 5)} days
- Style: {preferences.get('style', 'Standard')}
- Travel Month: {preferences.get('travelMonth', 'Any')}
"""

    prompt = f"""
You are a travel expert. Recommend the top 3-5 regions/states to visit in the country
with ISO code "{country_code.upper()}".

{pref_context}

For each region provide:
- name: Official name of the state/region
- reason: Why it's recommended (2-3 sentences)
- best_for: What type of traveller it suits
- image_keyword: Best search term for an image

Output MUST be pure JSON:
{{
    "regions": [
        {{
            "name": "...",
            "reason": "...",
            "best_for": "...",
            "image_keyword": "..."
        }}
    ]
}}
"""

    for model_name in MODELS_TO_TRY:
        try:
            text_resp = generate_content_http(prompt, model_name)
            if not text_resp:
                continue

            clean_text = text_resp.replace("```json", "").replace("```", "").strip()
            data = json.loads(clean_text)
            regions = data.get('regions', [])
            if regions:
                _regions_cache[cache_key] = regions  # FIX #8
                return regions

        except EnvironmentError:
            raise
        except json.JSONDecodeError as exc:
            print(f"[AI Regions] JSON decode error on {model_name}: {exc}")
            continue
        except Exception as exc:
            print(f"[AI Regions] {model_name} failed: {exc}")
            continue

    # FIX #9: Fall back to curated regions instead of silently returning []
    fallback = _CURATED_REGIONS.get(country_code.upper(), [])
    if fallback:
        print(f"[Regions] Using curated fallback for country code: {country_code}")
    else:
        print(f"[Regions] No curated fallback for '{country_code}'. Returning empty list.")
    _regions_cache[cache_key] = fallback
    return fallback