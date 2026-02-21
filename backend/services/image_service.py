import requests
import json
import os
import hashlib
import random
from urllib.parse import quote

# --- Configuration ---
CACHE_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'image_cache.json')
WIKIDATA_API    = "https://www.wikidata.org/w/api.php"
UNSPLASH_ACCESS_KEY = os.getenv('UNSPLASH_ACCESS_KEY')
UNSPLASH_API_URL    = "https://api.unsplash.com/search/photos"
PIXABAY_API_KEY  = os.getenv('PIXABAY_API_KEY')
PIXABAY_API_URL  = "https://pixabay.com/api/"
PEXELS_API_KEY   = os.getenv('PEXELS_API_KEY')
PEXELS_API_URL   = "https://api.pexels.com/v1/search"
USER_AGENT = "AltairGo/1.0 (internal-dev-testing)"


# ──────────────────────────────── Cache ───────────────────────────────────────

_cache = {}

def load_cache():
    global _cache
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, 'r', encoding='utf-8') as f:
                _cache = json.load(f)
        except Exception:
            _cache = {}

def save_cache():
    try:
        with open(CACHE_FILE, 'w', encoding='utf-8') as f:
            json.dump(_cache, f, indent=2, ensure_ascii=False)
    except Exception:
        pass

def get_cached_image(key: str):
    if not _cache:
        load_cache()
    return _cache.get(key)

def cache_image(key: str, url: str):
    _cache[key] = url
    save_cache()


# ──────────────────────────────── Smart Query Builder ─────────────────────────

def build_smart_query(name: str, tags=None, location_context=None) -> str:
    """
    Build a contextual search query that dramatically improves image relevance.

    Examples:
        "Amber Fort"        → "Amber Fort Jaipur Rajasthan India hilltop fort"
        "Hawa Mahal"        → "Hawa Mahal pink palace facade Jaipur India"
        "Calangute Beach"   → "Calangute Beach Goa India beach coastline"
    """
    query_parts = [name.strip()]

    # 1. Inject location context from DB
    if location_context:
        city    = location_context.get('city', '')
        state   = location_context.get('state', '')
        country = location_context.get('country', 'India')
        name_lower = name.lower()

        if city and city.lower() not in name_lower:
            query_parts.append(city)
        if state and state.lower() not in name_lower and state.lower() not in city.lower():
            query_parts.append(state)
        if country and country.lower() not in ' '.join(query_parts).lower():
            query_parts.append(country)

    # 2. Add descriptive keywords based on OSM tags
    if isinstance(tags, dict):
        tourism = tags.get('tourism', '')
        historic = tags.get('historic', '')
        natural = tags.get('natural', '')
        leisure = tags.get('leisure', '')

        if tourism == 'museum':
            query_parts.append('museum')
        elif tourism == 'attraction':
            query_parts.append('landmark')
        elif tourism == 'artwork':
            query_parts.append('monument')

        if historic == 'castle':
            query_parts.append('fort')
        elif historic == 'monument':
            query_parts.append('monument')
        elif historic == 'archaeological_site':
            query_parts.append('ruins')

        if natural == 'beach':
            query_parts.append('beach')
        elif natural in ('peak', 'mountain_range'):
            query_parts.append('mountain')
        elif natural == 'water':
            query_parts.append('lake')

        if leisure == 'park':
            query_parts.append('park')

    # 3. Add descriptive keywords for well-known landmarks
    name_lower = name.lower()
    LANDMARK_KEYWORDS = {
        'taj mahal':       'white marble',
        'hawa mahal':      'pink palace facade',
        'amber fort':      'hilltop fort',
        'amer fort':       'hilltop fort',
        'gateway of india':'arch monument',
        'golden temple':   'golden sikh gurdwara',
        'red fort':        'red sandstone fort',
        'qutub minar':     'tall minaret tower',
        'lotus temple':    'white lotus shaped',
        'victoria memorial':'white marble building',
        'india gate':      'war memorial arch',
        'meenakshi':       'gopuram temple',
        'khajuraho':       'carved temples',
        'konark':          'sun temple',
        'ajanta':          'cave paintings',
        'ellora':          'rock cut caves',
    }
    for keyword, extra in LANDMARK_KEYWORDS.items():
        if keyword in name_lower:
            query_parts.append(extra)
            break
    else:
        # Generic type keywords
        TYPE_MAP = [
            (['fort', 'fortress', 'qila'],    'historic fort'),
            (['palace', 'mahal', 'haveli'],   'royal palace'),
            (['temple', 'mandir'],            'hindu temple'),
            (['mosque', 'masjid'],            'mosque'),
            (['church'],                      'church'),
            (['gurdwara', 'gurudwara'],       'sikh gurdwara'),
            (['beach'],                       'beach coastline'),
            (['lake', 'sagar', 'tal'],        'lake water'),
            (['garden', 'bagh', 'park'],      'garden'),
            (['museum'],                      'museum building'),
            (['market', 'bazaar', 'chowk'],   'traditional market'),
            (['waterfall'],                   'waterfall'),
            (['cave'],                        'cave natural'),
            (['monument', 'memorial'],        'monument'),
        ]
        for keywords, label in TYPE_MAP:
            if any(kw in name_lower for kw in keywords):
                query_parts.append(label)
                break

    # 4. De-duplicate while preserving order
    seen = set()
    unique = []
    for part in ' '.join(query_parts).split():
        if part.lower() not in seen:
            seen.add(part.lower())
            unique.append(part)

    final = ' '.join(unique)
    # API query length limit guard
    if len(final) > 100:
        final = final[:100].rsplit(' ', 1)[0]

    return final


# ──────────────────────────────── Wikidata / Wikimedia ────────────────────────

def fetch_wikimedia_image(wikidata_id: str):
    """Fetch the main image (P18) for a given Wikidata entity ID."""
    params = {
        'action': 'wbgetclaims',
        'entity': wikidata_id,
        'property': 'P18',
        'format': 'json'
    }
    headers = {'User-Agent': USER_AGENT}
    try:
        resp = requests.get(WIKIDATA_API, params=params, headers=headers, timeout=5)
        p18 = resp.json().get('claims', {}).get('P18', [])
        if p18:
            filename = p18[0]['mainsnak']['datavalue']['value']
            return resolve_commons_url(filename)
    except Exception as e:
        print(f"   Wikidata lookup failed ({wikidata_id}): {e}")
    return None


def resolve_commons_url(filename: str):
    """Resolve a Wikimedia Commons filename to a direct image URL."""
    params = {
        'action': 'query',
        'titles': f"File:{filename}",
        'prop': 'imageinfo',
        'iiprop': 'url',
        'format': 'json'
    }
    headers = {'User-Agent': USER_AGENT}
    try:
        resp = requests.get(
            "https://commons.wikimedia.org/w/api.php",
            params=params, headers=headers, timeout=5
        )
        pages = resp.json().get('query', {}).get('pages', {})
        for v in pages.values():
            if 'imageinfo' in v:
                return v['imageinfo'][0]['url']
    except Exception as e:
        print(f"   Commons resolution failed ({filename}): {e}")
    return None


# ──────────────────────────────── Pexels API ──────────────────────────────────

def fetch_pexels_image(query: str):
    """
    Pexels API — Free, high-quality landmark photos, excellent for destinations.
    Sign up at https://www.pexels.com/api/ (free, 200 requests/hour).
    """
    if not PEXELS_API_KEY or not PEXELS_API_KEY.strip():
        return None
    try:
        resp = requests.get(
            PEXELS_API_URL,
            headers={'Authorization': PEXELS_API_KEY},
            params={'query': query, 'per_page': 5, 'orientation': 'landscape'},
            timeout=5
        )
        if resp.status_code == 200:
            photos = resp.json().get('photos', [])
            if photos:
                # Best-rated photo
                best = max(photos, key=lambda p: p.get('liked', 0))
                url = best['src'].get('large2x') or best['src'].get('large')
                print(f"   ✓ Pexels: {query}")
                return url
        else:
            print(f"   Pexels {resp.status_code}")
    except Exception as e:
        print(f"   Pexels error: {e}")
    return None


# ──────────────────────────────── Pixabay API ─────────────────────────────────

def fetch_pixabay_image(query: str):
    """
    Pixabay API — fallback with progressive query simplification.
    """
    if not PIXABAY_API_KEY or not PIXABAY_API_KEY.strip():
        return None

    words = query.split()
    attempts = [
        query,                          # Full smart query
        ' '.join(words[:3]),            # First 3 words
        words[0] if words else query,   # Just the main name word
    ]

    for attempt in attempts:
        try:
            resp = requests.get(
                PIXABAY_API_URL,
                params={
                    'key': PIXABAY_API_KEY,
                    'q': attempt,
                    'image_type': 'photo',
                    'orientation': 'horizontal',
                    'per_page': 5,
                    'safesearch': 'true',
                    'category': 'places',
                },
                timeout=5
            )
            if resp.status_code == 200:
                hits = resp.json().get('hits', [])
                if hits:
                    best = max(hits, key=lambda h: h.get('likes', 0))
                    url = best.get('largeImageURL') or best.get('webformatURL')
                    print(f"   ✓ Pixabay: {attempt}")
                    return url
        except Exception as e:
            print(f"   Pixabay error ({attempt}): {e}")

    return None


# ──────────────────────────────── Unsplash API ────────────────────────────────

def fetch_unsplash_image(query: str):
    """
    Unsplash API — high-artistic-quality photos.
    """
    if not UNSPLASH_ACCESS_KEY or not UNSPLASH_ACCESS_KEY.strip():
        return None

    words = query.split()
    attempts = [
        query,
        ' '.join(words[:4]),
        ' '.join(words[:2]),
    ]

    for attempt in attempts:
        try:
            resp = requests.get(
                UNSPLASH_API_URL,
                headers={
                    'Authorization': f'Client-ID {UNSPLASH_ACCESS_KEY}',
                    'User-Agent': USER_AGENT
                },
                params={
                    'query': attempt,
                    'per_page': 5,
                    'orientation': 'landscape',
                    'content_filter': 'high',
                },
                timeout=5
            )
            if resp.status_code == 200:
                results = resp.json().get('results', [])
                if results:
                    best = max(results, key=lambda r: r.get('likes', 0))
                    url = best['urls'].get('regular')
                    print(f"   ✓ Unsplash: {attempt}")
                    return url
        except Exception as e:
            print(f"   Unsplash error ({attempt}): {e}")

    return None


# ──────────────────────────────── Curated Fallback ────────────────────────────

# Curated, high-resolution (1200px) images organised by destination type.
# Selection is DETERMINISTIC: same destination name → always same image (MD5 hash).
_IMAGE_SETS = {
    'indian_fort': [
        'https://images.unsplash.com/photo-1587135941948-670b381f08ce?w=1200',  # Amber Fort
        'https://images.unsplash.com/photo-1603262110825-c9e0f8086836?w=1200',  # Red Fort
        'https://images.unsplash.com/photo-1619546952812-aa4f498f3e8e?w=1200',  # Fort architecture
    ],
    'indian_palace': [
        'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=1200',  # Hawa Mahal
        'https://images.unsplash.com/photo-1548013146-72479768bada?w=1200',     # Palace architecture
        'https://images.unsplash.com/photo-1624138784509-3e573425b79e?w=1200',  # City Palace
    ],
    'indian_temple': [
        'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200',  # Golden Temple
        'https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?w=1200',  # Temple
        'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=1200',  # Temple detail
    ],
    'indian_monument': [
        'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200',  # Taj Mahal
        'https://images.unsplash.com/photo-1587135941948-670b381f08ce?w=1200',  # Historic
        'https://images.unsplash.com/photo-1548013146-72479768bada?w=1200',     # Architecture
    ],
    'beach': [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200',  # Tropical beach
        'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200',  # Beach sunset
        'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=1200',  # Paradise beach
    ],
    'mountain': [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',  # Mountain peak
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200',  # Range
        'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200',  # Landscape
    ],
    'nature': [
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200',  # Forest
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200',  # Nature
        'https://images.unsplash.com/photo-1518173946687-a4c036bc7b33?w=1200',  # Landscape
    ],
    'city': [
        'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200',  # City skyline
        'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200',  # Urban
        'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1200',  # Architecture
    ],
    'default': [
        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200',  # Travel
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200',  # Nature
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200',  # Beach
        'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200',  # Mountain
    ],
}


def get_curated_fallback(name: str, tags=None) -> str:
    """
    Returns a category-appropriate curated image URL.
    Always returns a valid URL, never None.
    Selection is deterministic (MD5 hash of name) so repeated calls give the same image.
    """
    name_lower = name.lower()

    # Determine category via name keywords, then OSM tags
    category = 'default'
    if any(k in name_lower for k in ('fort', 'qila', 'fortress', 'citadel')):
        category = 'indian_fort'
    elif any(k in name_lower for k in ('palace', 'mahal', 'haveli', 'darbar')):
        category = 'indian_palace'
    elif any(k in name_lower for k in ('temple', 'mandir', 'gurdwara', 'gurudwara', 'mosque', 'masjid', 'church')):
        category = 'indian_temple'
    elif any(k in name_lower for k in ('gate', 'gateway', 'minar', 'memorial', 'stupa', 'pillar')):
        category = 'indian_monument'
    elif any(k in name_lower for k in ('beach', 'sea', 'ocean', 'coast', 'shore')):
        category = 'beach'
    elif any(k in name_lower for k in ('mountain', 'hill', 'peak', 'valley', 'pass', 'glacier')):
        category = 'mountain'
    elif any(k in name_lower for k in ('forest', 'wildlife', 'sanctuary', 'garden', 'park', 'waterfall')):
        category = 'nature'
    elif any(k in name_lower for k in ('city', 'town', 'metro', 'urban', 'market', 'bazaar')):
        category = 'city'

    # Override with OSM tags if available
    if isinstance(tags, dict):
        if tags.get('historic') in ('castle', 'fort', 'fortress'):
            category = 'indian_fort'
        elif tags.get('historic') == 'palace':
            category = 'indian_palace'
        elif tags.get('natural') == 'beach':
            category = 'beach'
        elif tags.get('natural') in ('peak', 'mountain_range'):
            category = 'mountain'
        elif tags.get('tourism') == 'museum':
            category = 'indian_monument'

    images = _IMAGE_SETS.get(category, _IMAGE_SETS['default'])
    # Deterministic selection using MD5 hash
    idx = int(hashlib.md5(name.encode('utf-8')).hexdigest()[:8], 16) % len(images)
    chosen = images[idx]
    print(f"   ℹ Curated fallback [{category}]: {name}")
    return chosen


# ──────────────────────────────── Main Entry Point ────────────────────────────

def get_image_for_destination(name: str, tags=None, location_context=None) -> str:
    """
    Fetch the best available image for a destination with a 6-level fallback chain.

    Priority:
        1. Cache              — instant, no API calls
        2. Wikidata/Wikimedia — Wikipedia-sourced photos for famous landmarks
        3. Pexels             — high-quality stock photos (requires PEXELS_API_KEY)
        4. Pixabay            — good variety (requires PIXABAY_API_KEY)
        5. Unsplash           — artistic photos (requires UNSPLASH_ACCESS_KEY)
        6. Curated fallback   — always succeeds, category-specific, deterministic

    Args:
        name:             Destination name, e.g. "Amber Fort"
        tags:             OSM tags dict, e.g. {'historic': 'castle', 'wikidata': 'Q123'}
        location_context: {'city': 'Jaipur', 'state': 'Rajasthan', 'country': 'India'}

    Returns:
        str: A valid image URL (never None)
    """
    if not isinstance(tags, dict):
        tags = {}

    # 1. Cache
    wikidata_id = tags.get('wikidata')
    cache_key = wikidata_id if wikidata_id else f"dest:{name}"

    cached = get_cached_image(cache_key)
    if cached:
        print(f"✓ Cache hit: {name}")
        return cached

    print(f"\n🔍 Fetching image for: {name}")

    # Build smart query (used by all search APIs)
    smart_query = build_smart_query(name, tags, location_context)
    print(f"   Query: '{smart_query}'")

    result_url = None

    # 2. Wikidata / Wikimedia (highest accuracy for famous landmarks)
    if wikidata_id:
        print(f"   Trying Wikidata ({wikidata_id})...")
        result_url = fetch_wikimedia_image(wikidata_id)

    # 3. Pexels (best quality for destinations)
    if not result_url:
        result_url = fetch_pexels_image(smart_query)

    # 4. Pixabay
    if not result_url:
        result_url = fetch_pixabay_image(smart_query)

    # 5. Unsplash
    if not result_url:
        result_url = fetch_unsplash_image(smart_query)

    # 6. Curated fallback (always succeeds)
    if not result_url:
        result_url = get_curated_fallback(name, tags)

    # Cache and return
    cache_image(cache_key, result_url)
    print(f"✓ Cached: {name}")
    return result_url


# ──────────────────────────────── Batch Helper ────────────────────────────────

def get_images_batch(destinations: list) -> dict:
    """
    Fetch images for multiple destinations.

    Args:
        destinations: list of dicts — each has 'name', optional 'tags', 'location_context'

    Returns:
        dict: { destination_name: image_url }
    """
    results = {}
    for dest in destinations:
        name = dest.get('name')
        if not name:
            continue
        results[name] = get_image_for_destination(
            name=name,
            tags=dest.get('tags'),
            location_context=dest.get('location_context')
        )
    return results


# ──────────────────────────────── Self-Test ───────────────────────────────────

def test_image_service():
    """Run a quick smoke test with 4 real Indian destinations."""
    test_cases = [
        {'name': 'Amber Fort',       'tags': {'historic': 'castle'}, 'location_context': {'city': 'Jaipur', 'state': 'Rajasthan', 'country': 'India'}},
        {'name': 'Hawa Mahal',       'tags': {'historic': 'monument'}, 'location_context': {'city': 'Jaipur', 'state': 'Rajasthan', 'country': 'India'}},
        {'name': 'Calangute Beach',  'tags': {'natural': 'beach'},    'location_context': {'city': 'Goa', 'state': 'Goa', 'country': 'India'}},
        {'name': 'Gateway of India', 'tags': {'historic': 'monument'}, 'location_context': {'city': 'Mumbai', 'state': 'Maharashtra', 'country': 'India'}},
    ]

    print("=" * 60)
    print("IMAGE SERVICE SELF-TEST")
    print("=" * 60)
    for case in test_cases:
        url = get_image_for_destination(case['name'], case['tags'], case['location_context'])
        status = "✅" if url and url.startswith('http') else "❌"
        print(f"{status} {case['name']}: {url[:80] if url else 'NONE'}...")
    print("=" * 60)


if __name__ == '__main__':
    test_image_service()
