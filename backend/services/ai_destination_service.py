"""
destination_service.py
======================
AI-powered destination generation for a travel app.
Wired directly into image_service.py for a single unified pipeline.

Features:
    - SQLite cache (persists across restarts, TTL-based expiry)
    - Gemini AI with model fallback chain
    - Strict response validation (types, required fields, cost normalization)
    - Automatic image fetching via image_service.get_image()
    - Curated fallbacks for all major Indian states + key international destinations
    - Full error propagation with clear logging

Setup:
    pip install requests python-dotenv
    export GEMINI_API_KEY="your_key_here"
    export PEXELS_API_KEY="your_key_here"   # optional, from image_service
"""

import json
import logging
import os
import re
import sqlite3
import sys
import time
from datetime import datetime, timedelta
from threading import Lock

import requests
from dotenv import load_dotenv

# ── Import image service (same directory) ─────────────────────────────────────
try:
    from image_service import get_image
    IMAGE_SERVICE_AVAILABLE = True
except ImportError:
    IMAGE_SERVICE_AVAILABLE = False
    logging.warning('image_service.py not found — images will not be fetched')

load_dotenv(override=False)

# ─────────────────────────── Logging ──────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s  %(levelname)-7s %(message)s',
    datefmt='%H:%M:%S',
)
log = logging.getLogger('destination_service')

# Force UTF-8 stdout on Windows
try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

# ─────────────────────────── Configuration ────────────────────────────────────

GEMINI_API_KEY   = os.getenv('GEMINI_API_KEY', '')
GEMINI_BASE_URL  = 'https://generativelanguage.googleapis.com/v1beta/models'
MODELS_TO_TRY    = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
]
DB_PATH          = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'destinations_cache.db')
CACHE_TTL_DAYS   = 30       # Re-generate after 30 days (keeps content fresh)
REQUEST_TIMEOUT  = 60       # Gemini can be slow on large prompts
MAX_RETRIES      = 3

# ─────────────────────────── SQLite Cache ─────────────────────────────────────

_db_lock = Lock()

def _get_db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.execute('''
        CREATE TABLE IF NOT EXISTS destinations (
            cache_key   TEXT PRIMARY KEY,
            data        TEXT NOT NULL,
            fetched_at  TEXT NOT NULL
        )
    ''')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS regions (
            cache_key   TEXT PRIMARY KEY,
            data        TEXT NOT NULL,
            fetched_at  TEXT NOT NULL
        )
    ''')
    conn.commit()
    return conn


def _cache_get(table: str, key: str):
    with _db_lock:
        conn = _get_db()
        row = conn.execute(
            f'SELECT data, fetched_at FROM {table} WHERE cache_key = ?', (key,)
        ).fetchone()
        conn.close()
    if not row:
        return None
    data, fetched_at = row
    age = datetime.utcnow() - datetime.fromisoformat(fetched_at)
    if age > timedelta(days=CACHE_TTL_DAYS):
        return None
    return json.loads(data)


def _cache_set(table: str, key: str, data: list):
    with _db_lock:
        conn = _get_db()
        conn.execute(
            f'INSERT OR REPLACE INTO {table} (cache_key, data, fetched_at) VALUES (?, ?, ?)',
            (key, json.dumps(data, ensure_ascii=False), datetime.utcnow().isoformat())
        )
        conn.commit()
        conn.close()


# ─────────────────────────── Gemini HTTP Client ───────────────────────────────

def _call_gemini(prompt: str, model: str) -> str:
    """
    Single Gemini API call. Returns raw text or raises on failure.
    Caller handles retries and model fallback.
    """
    if not GEMINI_API_KEY:
        raise EnvironmentError(
            'GEMINI_API_KEY is not set. Add it to your .env file.'
        )

    url     = f'{GEMINI_BASE_URL}/{model}:generateContent?key={GEMINI_API_KEY}'
    payload = {'contents': [{'parts': [{'text': prompt}]}]}

    for attempt in range(MAX_RETRIES):
        try:
            resp = requests.post(
                url,
                headers={'Content-Type': 'application/json'},
                json=payload,
                timeout=REQUEST_TIMEOUT,
            )

            if resp.status_code == 200:
                try:
                    return resp.json()['candidates'][0]['content']['parts'][0]['text']
                except (KeyError, IndexError):
                    raise ValueError(f'Unexpected Gemini response format: {resp.text[:200]}')

            if resp.status_code in (429, 503):
                wait = (attempt + 1) * 3
                log.warning('%s on %s — retrying in %ds', resp.status_code, model, wait)
                time.sleep(wait)
                continue

            raise RuntimeError(f'HTTP {resp.status_code} from {model}: {resp.text[:200]}')

        except requests.exceptions.RequestException as exc:
            if attempt < MAX_RETRIES - 1:
                log.warning('Network error on %s (attempt %d): %s', model, attempt + 1, exc)
                time.sleep(2)
                continue
            raise

    raise RuntimeError(f'All {MAX_RETRIES} attempts failed on {model}')


def _call_gemini_with_fallback(prompt: str) -> str:
    """Try each model in order, return first success."""
    last_exc = None
    for model in MODELS_TO_TRY:
        try:
            log.info('  Trying %s...', model)
            return _call_gemini(prompt, model)
        except EnvironmentError:
            raise   # Never swallow missing API key
        except Exception as exc:
            log.warning('  %s failed: %s', model, exc)
            last_exc = exc
    raise RuntimeError(f'All Gemini models failed. Last error: {last_exc}')


# ─────────────────────────── Response Validation ──────────────────────────────

def _parse_cost(raw) -> float:
    """
    Normalize estimated_cost to a float regardless of what the AI returns.
    Handles: 0, 500, "500", "₹500", "Free", "500-1000", "500 INR", etc.
    """
    if raw is None:
        return 0.0
    if isinstance(raw, (int, float)):
        return float(raw)
    text = str(raw).strip().lower()
    if text in ('free', 'nil', 'none', 'no charge', '0', ''):
        return 0.0
    # Extract first number from strings like "₹500-1000" or "500 INR"
    match = re.search(r'[\d,]+(?:\.\d+)?', text.replace(',', ''))
    if match:
        return float(match.group().replace(',', ''))
    return 0.0


def _validate_destination(raw: dict, currency: str) -> dict | None:
    """
    Validate and normalize a single destination dict from the AI.
    Returns None if the entry is too broken to use.
    """
    if not isinstance(raw, dict):
        return None
    name = str(raw.get('name', '')).strip()
    if not name:
        return None

    # Ensure rating is a float in [3.5, 5.0]
    try:
        rating = float(raw.get('rating', 4.3))
        rating = max(3.5, min(5.0, rating))
    except (TypeError, ValueError):
        rating = 4.3

    # Ensure highlights is a list of strings
    highlights = raw.get('highlights', [])
    if not isinstance(highlights, list):
        highlights = [str(highlights)]
    highlights = [str(h).strip() for h in highlights if str(h).strip()][:5]

    return {
        'name':           name,
        'type':           str(raw.get('type', 'Attraction')).strip(),
        'description':    str(raw.get('description', '')).strip(),
        'rating':         round(rating, 1),
        'estimated_cost': _parse_cost(raw.get('estimated_cost')),
        'currency':       currency,
        'best_time':      str(raw.get('best_time', 'Year Round')).strip(),
        'crowd_level':    str(raw.get('crowd_level', 'Moderate')).strip(),
        'highlights':     highlights,
        'image_keyword':  str(raw.get('image_keyword', name)).strip(),
        'image_url':      None,   # Filled in by _attach_images()
        'image_source':   None,
    }


def _parse_destinations_response(text: str, currency: str) -> list:
    """Parse and validate a full Gemini response for destinations."""
    clean = text.replace('```json', '').replace('```', '').strip()
    try:
        data = json.loads(clean)
    except json.JSONDecodeError as exc:
        log.error('JSON decode error: %s | Raw (300 chars): %s', exc, clean[:300])
        return []

    if isinstance(data, dict):
        raw_list = data.get('destinations', [])
    elif isinstance(data, list):
        raw_list = data
    else:
        log.error('Unexpected top-level type: %s', type(data))
        return []

    valid = []
    for item in raw_list:
        dest = _validate_destination(item, currency)
        if dest:
            valid.append(dest)

    dropped = len(raw_list) - len(valid)
    if dropped:
        log.warning('Dropped %d invalid destination entries', dropped)

    return valid


def _parse_regions_response(text: str) -> list:
    """Parse and validate a Gemini response for region recommendations."""
    clean = text.replace('```json', '').replace('```', '').strip()
    try:
        data = json.loads(clean)
    except json.JSONDecodeError as exc:
        log.error('Region JSON decode error: %s', exc)
        return []

    raw_list = data.get('regions', []) if isinstance(data, dict) else data
    valid = []
    for item in raw_list:
        if not isinstance(item, dict) or not item.get('name'):
            continue
        valid.append({
            'name':          str(item.get('name', '')).strip(),
            'reason':        str(item.get('reason', '')).strip(),
            'best_for':      str(item.get('best_for', '')).strip(),
            'image_keyword': str(item.get('image_keyword', item.get('name', ''))).strip(),
            'image_url':     None,
            'image_source':  None,
        })
    return valid


# ─────────────────────────── Image Attachment ─────────────────────────────────

def _attach_images(items: list, location: dict = None, item_type: str = 'destination'):
    """
    Fetch and attach image URLs to a list of destination or region dicts.
    Mutates items in place. Silently skips if image_service is unavailable.
    """
    if not IMAGE_SERVICE_AVAILABLE:
        return

    for item in items:
        name    = item.get('name', '')
        keyword = item.get('image_keyword', name)

        # Build OSM-style tags hint from type field for image_service
        dest_type = item.get('type', '').lower()
        tags = {}
        if 'fort' in dest_type or 'castle' in dest_type:
            tags['historic'] = 'castle'
        elif 'palace' in dest_type:
            tags['historic'] = 'palace'
        elif 'beach' in dest_type:
            tags['natural'] = 'beach'
        elif 'mountain' in dest_type or 'nature' in dest_type:
            tags['natural'] = 'peak'
        elif 'museum' in dest_type:
            tags['tourism'] = 'museum'
        elif 'temple' in dest_type or 'mosque' in dest_type or 'church' in dest_type:
            tags['tourism'] = 'attraction'

        try:
            result = get_image(name=name, tags=tags, location=location)
            item['image_url']    = result['url']
            item['image_source'] = result['source']
        except Exception as exc:
            log.warning('Image fetch failed for %s: %s', name, exc)
            item['image_url']    = None
            item['image_source'] = 'error'


# ─────────────────────────── Destination Prompt ───────────────────────────────

def _build_destination_prompt(region: str, country: str, currency: str, limit: int) -> str:
    currency_label = 'INR (₹)' if currency == 'INR' else f'USD ($)'
    return f"""
You are an expert travel guide. Generate exactly {limit} real, visitable tourist destinations
in {region}, {country}.

Rules:
- Only include REAL places that actually exist and tourists can visit.
- Mix popular landmarks with hidden gems.
- Variety: include nature, culture, history, food, adventure.
- estimated_cost must be a plain NUMBER (integer or float), never a string like "Free" or "₹500".
  Use 0 for free places.
- rating must be a number between 4.0 and 4.9.
- highlights must be an array of exactly 3-4 short strings.
- image_keyword: a specific phrase that would find a great photo of this place.

Return ONLY a valid JSON object. No markdown, no explanation, no extra text.

{{
    "destinations": [
        {{
            "name": "string",
            "type": "string (e.g. Historic Monument, Beach, Temple, Nature, Market)",
            "description": "string (2-3 compelling sentences for travellers)",
            "rating": 4.5,
            "estimated_cost": 500,
            "currency": "{currency}",
            "best_time": "string (e.g. October to March)",
            "crowd_level": "string (Low | Moderate | High)",
            "highlights": ["string", "string", "string"],
            "image_keyword": "string"
        }}
    ]
}}
"""


def _build_regions_prompt(country_code: str, preferences: dict = None) -> str:
    pref_text = ''
    if preferences:
        pref_text = f"""
User preferences:
- Budget: {preferences.get('budget', 'Any')}
- Duration: {preferences.get('duration', 'Any')} days
- Travel style: {preferences.get('style', 'Any')}
- Travel month: {preferences.get('travelMonth', 'Any')}
"""
    return f"""
You are a travel expert. Recommend the best 4-5 regions or states to visit in the country
with ISO code "{country_code.upper()}".
{pref_text}
Return ONLY a valid JSON object. No markdown, no explanation, no extra text.

{{
    "regions": [
        {{
            "name": "string",
            "reason": "string (2-3 sentences why it is recommended)",
            "best_for": "string (type of traveller it suits)",
            "image_keyword": "string (specific phrase to find a great photo)"
        }}
    ]
}}
"""


# ─────────────────────────── Public API ───────────────────────────────────────

def generate_destinations(
    region_name:  str,
    country_name: str,
    country_code: str = 'IN',
    limit:        int  = 30,
    fetch_images: bool = True,
) -> list:
    """
    Generate and return tourist destinations for a region.

    Args:
        region_name:  e.g. "Goa", "Rajasthan", "Kyoto"
        country_name: e.g. "India", "Japan"
        country_code: ISO 3166-1 alpha-2, e.g. "IN", "JP"
        limit:        number of destinations to generate (max ~50 for reliability)
        fetch_images: whether to attach image URLs via image_service

    Returns:
        list of validated destination dicts, each with image_url attached.
        Falls back to curated data if AI is unavailable.
        Returns [] only if no data is available at all.
    """
    cache_key = f'{region_name.lower().strip()}:{country_code.lower()}'
    cached    = _cache_get('destinations', cache_key)
    if cached:
        log.info('Cache hit (destinations): %s', region_name)
        return cached

    log.info('Generating destinations for: %s, %s', region_name, country_name)
    currency = 'INR' if country_code.upper() == 'IN' else 'USD'
    prompt   = _build_destination_prompt(region_name, country_name, currency, limit)

    destinations = []
    try:
        text         = _call_gemini_with_fallback(prompt)
        destinations = _parse_destinations_response(text, currency)
        if destinations:
            log.info('AI returned %d destinations for %s', len(destinations), region_name)
    except EnvironmentError:
        raise
    except Exception as exc:
        log.error('AI generation failed for %s: %s', region_name, exc)

    # Fall back to curated data if AI returned nothing
    if not destinations:
        log.info('Falling back to curated data for: %s', region_name)
        destinations = _get_curated_destinations(region_name, currency)

    if not destinations:
        log.warning('No destinations found for: %s', region_name)
        return []

    # Attach location context for image fetching
    location = {'city': region_name, 'country': country_name}
    if fetch_images:
        log.info('Fetching images for %d destinations...', len(destinations))
        _attach_images(destinations, location=location)

    _cache_set('destinations', cache_key, destinations)
    return destinations


def generate_region_recommendations(
    country_code: str,
    preferences:  dict = None,
    fetch_images: bool = True,
) -> list:
    """
    Recommend top regions/states for a country.

    Args:
        country_code: ISO 3166-1 alpha-2, e.g. "IN", "TH", "JP"
        preferences:  optional dict with budget, duration, style, travelMonth
        fetch_images: whether to attach image URLs

    Returns:
        list of region recommendation dicts with image_url attached.
    """
    pref_key  = json.dumps(preferences, sort_keys=True) if preferences else ''
    cache_key = f'{country_code.upper()}:{pref_key}'
    cached    = _cache_get('regions', cache_key)
    if cached:
        log.info('Cache hit (regions): %s', country_code)
        return cached

    log.info('Generating region recommendations for: %s', country_code)
    prompt  = _build_regions_prompt(country_code, preferences)
    regions = []

    try:
        text    = _call_gemini_with_fallback(prompt)
        regions = _parse_regions_response(text)
        if regions:
            log.info('AI returned %d regions for %s', len(regions), country_code)
    except EnvironmentError:
        raise
    except Exception as exc:
        log.error('Region generation failed for %s: %s', country_code, exc)

    if not regions:
        log.info('Falling back to curated regions for: %s', country_code)
        regions = _CURATED_REGIONS.get(country_code.upper(), [])

    if not regions:
        log.warning('No regions found for country code: %s', country_code)
        return []

    if fetch_images:
        _attach_images(regions, item_type='region')

    _cache_set('regions', cache_key, regions)
    return regions


def invalidate_cache(region_name: str = None, country_code: str = None):
    """
    Manually invalidate cache entries.
    Pass region_name to clear a specific destination cache,
    country_code to clear a region cache, or neither to clear all.
    """
    with _db_lock:
        conn = _get_db()
        if region_name:
            key = f'{region_name.lower().strip()}%'
            conn.execute('DELETE FROM destinations WHERE cache_key LIKE ?', (key,))
            log.info('Invalidated destination cache for: %s', region_name)
        elif country_code:
            key = f'{country_code.upper()}%'
            conn.execute('DELETE FROM regions WHERE cache_key LIKE ?', (key,))
            log.info('Invalidated region cache for: %s', country_code)
        else:
            conn.execute('DELETE FROM destinations')
            conn.execute('DELETE FROM regions')
            log.info('Cleared all destination and region caches')
        conn.commit()
        conn.close()


# ─────────────────────────── Curated Fallback Data ────────────────────────────

def _get_curated_destinations(region_name: str, currency: str) -> list:
    """Match region name to curated data and normalize currency."""
    key = region_name.lower().strip()
    data = _CURATED_DESTINATIONS.get(key)
    if not data:
        for k, v in _CURATED_DESTINATIONS.items():
            if k in key or key in k:
                data = v
                break
    if not data:
        return []
    # Ensure currency field matches current context
    return [{**d, 'currency': currency, 'image_url': None, 'image_source': None}
            for d in data]


_CURATED_DESTINATIONS = {
    "goa": [
        {"name": "Calangute Beach", "type": "Beach", "description": "The largest beach in Goa, famous for water sports, shacks, and vibrant nightlife.", "rating": 4.5, "estimated_cost": 500, "currency": "INR", "best_time": "November to February", "crowd_level": "High", "highlights": ["Water Sports", "Beach Shacks", "Sunset Views", "Flea Markets"], "image_keyword": "Calangute Beach Goa India"},
        {"name": "Basilica of Bom Jesus", "type": "Historic Monument", "description": "UNESCO World Heritage Site housing the mortal remains of St. Francis Xavier, built in 1605.", "rating": 4.7, "estimated_cost": 0, "currency": "INR", "best_time": "October to March", "crowd_level": "Moderate", "highlights": ["Baroque Architecture", "UNESCO Heritage", "Photography", "History"], "image_keyword": "Basilica Bom Jesus Old Goa church"},
        {"name": "Dudhsagar Falls", "type": "Nature", "description": "One of India's tallest waterfalls, a 310-metre cascade nestled in the Western Ghats forest.", "rating": 4.8, "estimated_cost": 400, "currency": "INR", "best_time": "June to September", "crowd_level": "Moderate", "highlights": ["Waterfall Trekking", "Jeep Safari", "Swimming", "Wildlife Spotting"], "image_keyword": "Dudhsagar Falls Goa waterfall"},
        {"name": "Fort Aguada", "type": "Historic Monument", "description": "17th-century Portuguese fort overlooking the Arabian Sea with panoramic coastal views.", "rating": 4.5, "estimated_cost": 50, "currency": "INR", "best_time": "October to March", "crowd_level": "Moderate", "highlights": ["Lighthouse", "Sea Views", "Portuguese Architecture", "Sunset"], "image_keyword": "Fort Aguada Goa lighthouse"},
        {"name": "Palolem Beach", "type": "Beach", "description": "A crescent-shaped paradise in South Goa known for its calm waters and relaxed vibe.", "rating": 4.6, "estimated_cost": 400, "currency": "INR", "best_time": "November to March", "crowd_level": "Low", "highlights": ["Kayaking", "Dolphin Spotting", "Beach Huts", "Silent Disco"], "image_keyword": "Palolem Beach South Goa paradise"},
    ],
    "rajasthan": [
        {"name": "Amber Fort", "type": "Historic Monument", "description": "Magnificent 16th-century Rajput fort with Sheesh Mahal mirror work and sweeping lake views.", "rating": 4.9, "estimated_cost": 550, "currency": "INR", "best_time": "October to March", "crowd_level": "High", "highlights": ["Sheesh Mahal", "Elephant Rides", "Sound and Light Show", "Panoramic Views"], "image_keyword": "Amber Fort Jaipur India hilltop"},
        {"name": "Hawa Mahal", "type": "Historic Monument", "description": "The iconic Palace of Winds with 953 latticed windows, built for royal women to observe street life.", "rating": 4.7, "estimated_cost": 200, "currency": "INR", "best_time": "October to March", "crowd_level": "High", "highlights": ["Latticed Windows", "Architecture", "Rooftop Views", "Museum"], "image_keyword": "Hawa Mahal Jaipur pink palace facade"},
        {"name": "Mehrangarh Fort", "type": "Historic Monument", "description": "One of India's largest forts perched 400 feet above Jodhpur with views of the Blue City.", "rating": 4.8, "estimated_cost": 600, "currency": "INR", "best_time": "October to February", "crowd_level": "Moderate", "highlights": ["Museum", "Blue City Views", "Folk Music", "Zip-lining"], "image_keyword": "Mehrangarh Fort Jodhpur Blue City"},
        {"name": "Jaisalmer Fort", "type": "Historic Monument", "description": "A living fort rising from the Thar Desert, home to locals since the 12th century.", "rating": 4.7, "estimated_cost": 0, "currency": "INR", "best_time": "October to February", "crowd_level": "Moderate", "highlights": ["Desert Views", "Haveli Architecture", "Rooftop Restaurants", "Sunset"], "image_keyword": "Jaisalmer Fort golden desert Rajasthan"},
        {"name": "Thar Desert Camel Safari", "type": "Adventure", "description": "Overnight camel trek into the golden sand dunes with bonfire and folk performances.", "rating": 4.7, "estimated_cost": 1500, "currency": "INR", "best_time": "October to February", "crowd_level": "Low", "highlights": ["Sand Dunes", "Camel Ride", "Stargazing", "Cultural Performances"], "image_keyword": "Thar Desert camel dunes Rajasthan sunset"},
        {"name": "Ranthambore National Park", "type": "Nature", "description": "Famous tiger reserve where Bengal tigers roam ancient ruins — best wildlife safari in Rajasthan.", "rating": 4.6, "estimated_cost": 2000, "currency": "INR", "best_time": "October to June", "crowd_level": "Moderate", "highlights": ["Tiger Safari", "Fort Ruins", "Bird Watching", "Leopards"], "image_keyword": "Ranthambore tiger safari Rajasthan"},
    ],
    "maharashtra": [
        {"name": "Gateway of India", "type": "Historic Monument", "description": "Iconic 1924 basalt arch monument overlooking the Arabian Sea, the symbol of Mumbai.", "rating": 4.6, "estimated_cost": 0, "currency": "INR", "best_time": "Year Round", "crowd_level": "High", "highlights": ["Architecture", "Boat Rides", "Photography", "Sunset Views"], "image_keyword": "Gateway of India Mumbai arch monument"},
        {"name": "Ajanta Caves", "type": "Historic Monument", "description": "UNESCO-listed 30 rock-cut Buddhist cave monuments with breathtaking 2nd-century BCE paintings.", "rating": 4.8, "estimated_cost": 500, "currency": "INR", "best_time": "October to March", "crowd_level": "Moderate", "highlights": ["Rock-cut Architecture", "Ancient Murals", "UNESCO Heritage", "Sculptures"], "image_keyword": "Ajanta Caves paintings ancient India"},
        {"name": "Ellora Caves", "type": "Historic Monument", "description": "34 monasteries and temples cut into vertical rock, representing Buddhist, Hindu and Jain traditions.", "rating": 4.8, "estimated_cost": 500, "currency": "INR", "best_time": "Year Round", "crowd_level": "Moderate", "highlights": ["Kailash Temple", "Rock Architecture", "Three Religions", "Sculpture Art"], "image_keyword": "Ellora Caves Kailash temple rock cut"},
        {"name": "Elephanta Caves", "type": "Historic Monument", "description": "UNESCO island caves featuring magnificent 6th-century rock-cut Shiva sculptures, by ferry.", "rating": 4.6, "estimated_cost": 400, "currency": "INR", "best_time": "November to May", "crowd_level": "Moderate", "highlights": ["Trimurti Shiva", "Ferry Ride", "Rock Architecture", "Sea Views"], "image_keyword": "Elephanta Caves Mumbai island sculptures"},
        {"name": "Lonavala Hill Station", "type": "Nature", "description": "Popular hill station in the Sahyadri range, famous for lush valleys, forts, and chikki sweets.", "rating": 4.4, "estimated_cost": 300, "currency": "INR", "best_time": "June to September", "crowd_level": "Moderate", "highlights": ["Bhushi Dam", "Tiger's Leap", "Chikki Shopping", "Valley Views"], "image_keyword": "Lonavala hill station monsoon Maharashtra"},
    ],
    "kerala": [
        {"name": "Alleppey Backwaters", "type": "Nature", "description": "Serene network of lagoons and canals — experience Kerala's famous houseboat cruises.", "rating": 4.8, "estimated_cost": 3000, "currency": "INR", "best_time": "October to February", "crowd_level": "Moderate", "highlights": ["Houseboat Stay", "Canoe Rides", "Village Life", "Sunset Cruise"], "image_keyword": "Alleppey backwaters houseboat Kerala"},
        {"name": "Munnar Tea Gardens", "type": "Nature", "description": "Picturesque hill station blanketed in tea plantations at 1,600m with misty peaks.", "rating": 4.7, "estimated_cost": 400, "currency": "INR", "best_time": "October to June", "crowd_level": "Moderate", "highlights": ["Tea Factory Tour", "Eravikulam Park", "Top Station", "Nilgiri Tahr"], "image_keyword": "Munnar tea plantations hills Kerala"},
        {"name": "Periyar Wildlife Sanctuary", "type": "Nature", "description": "Tiger reserve around Periyar Lake with boat safaris spotting elephants, gaur and tigers.", "rating": 4.6, "estimated_cost": 700, "currency": "INR", "best_time": "October to May", "crowd_level": "Moderate", "highlights": ["Elephant Herds", "Boat Safari", "Spice Plantation", "Trekking"], "image_keyword": "Periyar wildlife elephants Kerala"},
        {"name": "Kovalam Beach", "type": "Beach", "description": "Crescent-shaped beach famous for its lighthouse and Ayurvedic massage centres.", "rating": 4.5, "estimated_cost": 500, "currency": "INR", "best_time": "September to March", "crowd_level": "Moderate", "highlights": ["Lighthouse Beach", "Ayurvedic Spa", "Surfing", "Seafood"], "image_keyword": "Kovalam Beach lighthouse Kerala"},
    ],
    "himachal pradesh": [
        {"name": "Manali", "type": "Adventure", "description": "Gateway to Ladakh and Spiti, offering skiing, river rafting, and the stunning Rohtang Pass.", "rating": 4.7, "estimated_cost": 1500, "currency": "INR", "best_time": "October to June", "crowd_level": "High", "highlights": ["Rohtang Pass", "Solang Valley", "Rafting", "Hadimba Temple"], "image_keyword": "Manali snow mountains Himachal Pradesh"},
        {"name": "Shimla", "type": "Urban Exploration", "description": "The Queen of Hills — former summer capital of British India with colonial architecture.", "rating": 4.5, "estimated_cost": 800, "currency": "INR", "best_time": "March to June", "crowd_level": "High", "highlights": ["Mall Road", "Christ Church", "Toy Train", "Kufri"], "image_keyword": "Shimla hill station snow Himachal Pradesh"},
        {"name": "Spiti Valley", "type": "Adventure", "description": "Remote high-altitude cold desert with ancient monasteries, stark landscapes, and star gazing.", "rating": 4.9, "estimated_cost": 1000, "currency": "INR", "best_time": "June to September", "crowd_level": "Low", "highlights": ["Key Monastery", "Chandratal Lake", "Fossil Sites", "Stargazing"], "image_keyword": "Spiti Valley monastery Himachal cold desert"},
    ],
    "uttar pradesh": [
        {"name": "Taj Mahal", "type": "Historic Monument", "description": "One of the Seven Wonders of the World. This white marble mausoleum is poetry in stone.", "rating": 5.0, "estimated_cost": 1100, "currency": "INR", "best_time": "October to March", "crowd_level": "High", "highlights": ["Sunrise View", "Main Mausoleum", "Mughal Gardens", "History"], "image_keyword": "Taj Mahal Agra white marble sunrise"},
        {"name": "Agra Fort", "type": "Historic Monument", "description": "UNESCO-listed red sandstone Mughal fort with palaces, mosques, and views of the Taj Mahal.", "rating": 4.6, "estimated_cost": 650, "currency": "INR", "best_time": "October to March", "crowd_level": "High", "highlights": ["Diwan-i-Khas", "Taj Views", "Mughal Architecture", "Jahangiri Mahal"], "image_keyword": "Agra Fort red sandstone Mughal"},
        {"name": "Varanasi Ghats", "type": "Culture", "description": "The world's oldest living city. Experience the Ganga Aarti at Dashashwamedh Ghat at dusk.", "rating": 4.8, "estimated_cost": 200, "currency": "INR", "best_time": "October to March", "crowd_level": "High", "highlights": ["Ganga Aarti", "Sunrise Boat Ride", "Ancient Temples", "Silk Weaving"], "image_keyword": "Varanasi ghats Ganga Aarti ceremony"},
    ],
    "karnataka": [
        {"name": "Hampi", "type": "Historic Monument", "description": "UNESCO ruined city of the Vijayanagara Empire — a surreal landscape of temples and boulders.", "rating": 4.9, "estimated_cost": 500, "currency": "INR", "best_time": "October to February", "crowd_level": "Moderate", "highlights": ["Virupaksha Temple", "Stone Chariot", "Tungabhadra River", "Coracle Ride"], "image_keyword": "Hampi ruins Karnataka UNESCO heritage"},
        {"name": "Mysore Palace", "type": "Historic Monument", "description": "Opulent Indo-Saracenic palace of the Wadiyar dynasty, illuminated by 100,000 bulbs on Sundays.", "rating": 4.7, "estimated_cost": 100, "currency": "INR", "best_time": "October to February", "crowd_level": "High", "highlights": ["Palace Illumination", "Durbar Hall", "Devaraja Market", "Chamundi Hills"], "image_keyword": "Mysore Palace illuminated Karnataka night"},
        {"name": "Coorg Coffee Estates", "type": "Nature", "description": "Scotland of India — misty hills, coffee plantations, and the sacred Cauvery River.", "rating": 4.6, "estimated_cost": 800, "currency": "INR", "best_time": "October to May", "crowd_level": "Moderate", "highlights": ["Coffee Plantation Walk", "Namdroling Monastery", "River Rafting", "Abbey Falls"], "image_keyword": "Coorg coffee plantation Karnataka hills"},
    ],
}

_CURATED_REGIONS = {
    "IN": [
        {"name": "Rajasthan", "reason": "India's most colourful state, packed with forts, palaces, and the Thar Desert.", "best_for": "History & culture lovers", "image_keyword": "Rajasthan fort palace Jaipur India", "image_url": None, "image_source": None},
        {"name": "Kerala", "reason": "Lush backwaters, tea gardens, and pristine beaches make it India's most relaxing destination.", "best_for": "Nature & wellness seekers", "image_keyword": "Kerala backwaters houseboat India", "image_url": None, "image_source": None},
        {"name": "Goa", "reason": "Sun, sea, Portuguese heritage, and a buzzing nightlife scene all in one compact state.", "best_for": "Beach & nightlife travellers", "image_keyword": "Goa beach India sunset", "image_url": None, "image_source": None},
        {"name": "Himachal Pradesh", "reason": "Snow-capped Himalayas, adventure sports, and serene hill stations like Manali and Shimla.", "best_for": "Adventure & trekking enthusiasts", "image_keyword": "Himachal Pradesh mountains Manali snow", "image_url": None, "image_source": None},
        {"name": "Karnataka", "reason": "Home to UNESCO sites Hampi, the royal city of Mysore, and the coffee country of Coorg.", "best_for": "Culture & heritage travellers", "image_keyword": "Karnataka Hampi ruins temple", "image_url": None, "image_source": None},
    ],
    "TH": [
        {"name": "Bangkok", "reason": "Thailand's dazzling capital with grand temples, street food, and endless shopping.", "best_for": "First-time visitors & food lovers", "image_keyword": "Bangkok temple Thailand Grand Palace", "image_url": None, "image_source": None},
        {"name": "Chiang Mai", "reason": "Northern cultural hub with hundreds of temples, elephant sanctuaries, and trekking routes.", "best_for": "Culture & nature seekers", "image_keyword": "Chiang Mai temple Thailand old city", "image_url": None, "image_source": None},
        {"name": "Phuket", "reason": "World-class beaches, dramatic limestone cliffs, and island-hopping adventures.", "best_for": "Beach & water sports travellers", "image_keyword": "Phuket island Thailand beach", "image_url": None, "image_source": None},
    ],
    "JP": [
        {"name": "Kyoto", "reason": "Japan's cultural heartland with over 1,600 Buddhist temples and traditional geisha districts.", "best_for": "Culture & history enthusiasts", "image_keyword": "Kyoto temple Japan cherry blossom", "image_url": None, "image_source": None},
        {"name": "Tokyo", "reason": "A hyper-modern metropolis blending cutting-edge technology with ancient tradition.", "best_for": "Urban explorers & foodies", "image_keyword": "Tokyo skyline Japan neon night", "image_url": None, "image_source": None},
        {"name": "Hokkaido", "reason": "Japan's northern island famous for powder snow skiing, lavender fields, and fresh seafood.", "best_for": "Nature & adventure lovers", "image_keyword": "Hokkaido lavender fields Japan", "image_url": None, "image_source": None},
    ],
}


# ─────────────────────────── CLI Self-Test ────────────────────────────────────

def _self_test():
    print('\n' + '=' * 65)
    print('DESTINATION SERVICE SELF-TEST')
    print('=' * 65)

    # Test 1: Region recommendations
    print('\n[Test 1] Region recommendations for India...')
    regions = generate_region_recommendations('IN', fetch_images=True)
    for r in regions[:3]:
        img_ok = '✅' if r.get('image_url') else '⚠️ '
        print(f"  {img_ok} {r['name']} [{r.get('image_source', '?')}]")

    # Test 2: Destinations for a known region
    print('\n[Test 2] Destinations for Goa...')
    destinations = generate_destinations('Goa', 'India', 'IN', limit=5, fetch_images=True)
    for d in destinations[:5]:
        img_ok = '✅' if d.get('image_url') else '⚠️ '
        cost   = f"₹{d['estimated_cost']}" if d['currency'] == 'INR' else f"${d['estimated_cost']}"
        print(f"  {img_ok} {d['name']} | {d['type']} | {cost} | [{d.get('image_source', '?')}]")

    # Test 3: Cache hit
    print('\n[Test 3] Cache hit test (Goa second call)...')
    t0   = time.time()
    dests = generate_destinations('Goa', 'India', 'IN', limit=5)
    elapsed = time.time() - t0
    print(f"  {'✅' if elapsed < 0.1 else '⚠️ '} Returned {len(dests)} items in {elapsed:.3f}s")

    print('\n' + '=' * 65)


if __name__ == '__main__':
    _self_test()