"""
image_service.py
================
Travel app image fetcher — optimised for 10,000+ Indian destinations.

Priority chain:
    1. SQLite cache         → instant, no API calls
    2. Wikipedia REST API   → auto-lookup by name, no key needed, most accurate
    3. Wikimedia / Wikidata → direct P18 image if wikidata tag present
    4. Pexels API           → high-quality stock, rate-limited carefully
    5. Category placeholder → local SVG data-URI, never fails

Setup:
    pip install requests
    export PEXELS_API_KEY="your_key_here"   # optional but recommended
"""

import os
import re
import time
import sqlite3
import hashlib
import logging
import requests
from datetime import datetime, timedelta
from threading import Lock

# ─────────────────────────── Logging ──────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s  %(levelname)-7s %(message)s',
    datefmt='%H:%M:%S',
)
log = logging.getLogger('image_service')

# ─────────────────────────── Configuration ────────────────────────────────────

DB_PATH          = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'image_cache.db')
CACHE_TTL_DAYS   = 60          # Re-fetch after 60 days (handles dead URLs)
PEXELS_API_KEY   = os.getenv('PEXELS_API_KEY', '')
PEXELS_API_URL   = 'https://api.pexels.com/v1/search'
WIKIDATA_API     = 'https://www.wikidata.org/w/api.php'
COMMONS_API      = 'https://commons.wikimedia.org/w/api.php'
WIKIPEDIA_API    = 'https://en.wikipedia.org/w/api.php'
USER_AGENT       = 'AltairTravelApp/2.0 (travel-app; image-fetch-bot)'

# Pexels rate-limit guard — stays well inside 200/hr and 20k/month
PEXELS_MAX_PER_HOUR  = 150      # leave 50 buffer
PEXELS_MAX_PER_MONTH = 18_000   # leave 2000 buffer

# ─────────────────────────── SQLite Cache ─────────────────────────────────────

_db_lock = Lock()

def _get_db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.execute('''
        CREATE TABLE IF NOT EXISTS image_cache (
            cache_key   TEXT PRIMARY KEY,
            url         TEXT NOT NULL,
            source      TEXT,
            fetched_at  TEXT NOT NULL
        )
    ''')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS pexels_usage (
            period  TEXT PRIMARY KEY,   -- "YYYY-MM" or "YYYY-MM-DD HH"
            count   INTEGER DEFAULT 0
        )
    ''')
    conn.commit()
    return conn


def _cache_get(key: str):
    """Return (url, source) if cached and not expired, else None."""
    with _db_lock:
        conn = _get_db()
        row = conn.execute(
            'SELECT url, source, fetched_at FROM image_cache WHERE cache_key = ?', (key,)
        ).fetchone()
        conn.close()
    if not row:
        return None
    url, source, fetched_at = row
    age = datetime.utcnow() - datetime.fromisoformat(fetched_at)
    if age > timedelta(days=CACHE_TTL_DAYS):
        return None   # expired — re-fetch
    return url, source


def _cache_set(key: str, url: str, source: str):
    with _db_lock:
        conn = _get_db()
        conn.execute('''
            INSERT OR REPLACE INTO image_cache (cache_key, url, source, fetched_at)
            VALUES (?, ?, ?, ?)
        ''', (key, url, source, datetime.utcnow().isoformat()))
        conn.commit()
        conn.close()


# ─────────────────────────── Pexels Rate Limiter ──────────────────────────────

def _pexels_allowed() -> bool:
    """Returns True if we're safely within Pexels rate limits."""
    now   = datetime.utcnow()
    month = now.strftime('%Y-%m')
    hour  = now.strftime('%Y-%m-%d %H')

    with _db_lock:
        conn = _get_db()
        monthly = conn.execute(
            'SELECT count FROM pexels_usage WHERE period = ?', (month,)
        ).fetchone()
        hourly = conn.execute(
            'SELECT count FROM pexels_usage WHERE period = ?', (hour,)
        ).fetchone()
        conn.close()

    monthly_count = monthly[0] if monthly else 0
    hourly_count  = hourly[0]  if hourly  else 0

    return monthly_count < PEXELS_MAX_PER_MONTH and hourly_count < PEXELS_MAX_PER_HOUR


def _pexels_increment():
    now   = datetime.utcnow()
    month = now.strftime('%Y-%m')
    hour  = now.strftime('%Y-%m-%d %H')
    with _db_lock:
        conn = _get_db()
        for period in (month, hour):
            conn.execute('''
                INSERT INTO pexels_usage (period, count) VALUES (?, 1)
                ON CONFLICT(period) DO UPDATE SET count = count + 1
            ''', (period,))
        conn.commit()
        conn.close()


# ─────────────────────────── Smart Query Builder ──────────────────────────────

# Maps name keywords → descriptive search suffix for better relevance
_LANDMARK_MAP = {
    'taj mahal':        'white marble mausoleum Agra',
    'hawa mahal':       'pink facade palace Jaipur',
    'amber fort':       'hilltop fort Jaipur Rajasthan',
    'amer fort':        'hilltop fort Jaipur Rajasthan',
    'gateway of india': 'arch monument Mumbai waterfront',
    'golden temple':    'golden gurdwara Amritsar',
    'red fort':         'red sandstone fort Delhi',
    'qutub minar':      'tall minaret tower Delhi',
    'lotus temple':     'white lotus shaped temple Delhi',
    'victoria memorial':'white marble building Kolkata',
    'india gate':       'war memorial arch Delhi',
    'meenakshi':        'colourful gopuram temple Madurai',
    'khajuraho':        'carved sandstone temples',
    'konark':           'sun temple Odisha',
    'ajanta':           'Buddhist cave paintings Maharashtra',
    'ellora':           'rock cut caves Maharashtra',
    'hampi':            'ruins Vijayanagara Karnataka',
    'mysore palace':    'illuminated palace Karnataka',
    'charminar':        'four minarets monument Hyderabad',
    'dal lake':         'shikara boat lake Srinagar Kashmir',
    'backwaters':       'houseboat Kerala green water',
}

_TYPE_MAP = [
    (['fort', 'qila', 'fortress', 'citadel'],         'historic fort architecture'),
    (['palace', 'mahal', 'haveli', 'darbar'],          'royal palace architecture'),
    (['temple', 'mandir', 'kovil'],                    'Hindu temple architecture'),
    (['mosque', 'masjid', 'dargah'],                   'mosque architecture'),
    (['church', 'cathedral', 'basilica'],              'church architecture'),
    (['gurdwara', 'gurudwara'],                        'Sikh gurdwara'),
    (['beach', 'coast', 'shore'],                      'beach coastline'),
    (['lake', 'sagar', 'talab', 'reservoir'],          'lake water landscape'),
    (['waterfall', 'falls', 'jharna'],                 'waterfall nature'),
    (['mountain', 'hill', 'peak', 'ghats'],            'mountain landscape'),
    (['forest', 'wildlife', 'sanctuary', 'national park'], 'wildlife forest India'),
    (['garden', 'bagh', 'park', 'botanical'],          'garden park landscape'),
    (['museum', 'gallery'],                            'museum building'),
    (['market', 'bazaar', 'chowk', 'haat'],            'Indian market street'),
    (['cave', 'cavern'],                               'cave natural'),
    (['monument', 'memorial', 'stupa', 'pillar'],      'monument India'),
    (['island'],                                       'island India sea'),
]


def build_query(name: str, tags: dict = None, location: dict = None) -> str:
    """
    Build a highly specific search query for a destination.
    Priority: known landmark map → type keywords → location context → name alone.
    """
    name_lower = name.lower().strip()

    # 1. Known landmark — highest precision
    for landmark, suffix in _LANDMARK_MAP.items():
        if landmark in name_lower:
            return f"{name} {suffix}"

    parts = [name.strip()]

    # 2. Location context
    if location:
        city    = location.get('city', '')
        state   = location.get('state', '')
        country = location.get('country', 'India')
        joined  = name_lower
        if city and city.lower() not in joined:
            parts.append(city)
            joined += ' ' + city.lower()
        if state and state.lower() not in joined:
            parts.append(state)
            joined += ' ' + state.lower()
        if country and country.lower() not in joined:
            parts.append(country)

    # 3. Type keywords from name
    for keywords, label in _TYPE_MAP:
        if any(kw in name_lower for kw in keywords):
            parts.append(label)
            break

    # 4. OSM tag hints
    if isinstance(tags, dict):
        historic = tags.get('historic', '')
        natural  = tags.get('natural', '')
        tourism  = tags.get('tourism', '')
        if historic == 'castle':
            parts.append('fort')
        elif historic == 'palace':
            parts.append('palace')
        elif natural == 'beach':
            parts.append('beach')
        elif natural in ('peak', 'mountain_range'):
            parts.append('mountain')
        elif tourism == 'museum':
            parts.append('museum')

    query = ' '.join(parts)
    return query[:120]   # API hard limit guard


# ─────────────────────────── Source 2: Wikipedia REST ─────────────────────────

def _wikipedia_image(name: str) -> str | None:
    """
    Use Wikipedia's REST summary API to get the page image for a destination.
    Automatically handles name → article lookup. No API key needed.
    Very high accuracy for any destination that has a Wikipedia article.
    """
    # Try exact name first, then simplified version
    candidates = [name, re.sub(r'\s+', '_', name.strip())]
    for candidate in candidates:
        try:
            url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{requests.utils.quote(candidate)}"
            resp = requests.get(url, headers={'User-Agent': USER_AGENT}, timeout=6)
            if resp.status_code == 200:
                data = resp.json()
                img = data.get('originalimage') or data.get('thumbnail')
                if img and img.get('source'):
                    log.info('  ✓ Wikipedia REST: %s', name)
                    return img['source']
        except Exception as e:
            log.debug('  Wikipedia REST error (%s): %s', candidate, e)
    return None


def _wikipedia_search_image(name: str, location: dict = None) -> str | None:
    """
    If direct Wikipedia lookup fails, search for the article first.
    Handles slightly misspelled or alternate names.
    """
    search_term = name
    if location and location.get('city'):
        search_term = f"{name} {location['city']}"

    try:
        params = {
            'action': 'query',
            'list': 'search',
            'srsearch': search_term,
            'srlimit': 3,
            'format': 'json',
        }
        resp = requests.get(
            WIKIPEDIA_API,
            params=params,
            headers={'User-Agent': USER_AGENT},
            timeout=6
        )
        results = resp.json().get('query', {}).get('search', [])
        for result in results:
            title = result.get('title', '')
            img_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{requests.utils.quote(title)}"
            r2 = requests.get(img_url, headers={'User-Agent': USER_AGENT}, timeout=5)
            if r2.status_code == 200:
                data = r2.json()
                img = data.get('originalimage') or data.get('thumbnail')
                if img and img.get('source'):
                    log.info('  ✓ Wikipedia search: %s → %s', name, title)
                    return img['source']
    except Exception as e:
        log.debug('  Wikipedia search error (%s): %s', name, e)
    return None


# ─────────────────────────── Source 3: Wikidata P18 ───────────────────────────

def _wikidata_image(wikidata_id: str) -> str | None:
    """Direct P18 image fetch when we already have the Wikidata ID from OSM tags."""
    try:
        resp = requests.get(
            WIKIDATA_API,
            params={'action': 'wbgetclaims', 'entity': wikidata_id, 'property': 'P18', 'format': 'json'},
            headers={'User-Agent': USER_AGENT},
            timeout=6
        )
        p18 = resp.json().get('claims', {}).get('P18', [])
        if p18:
            filename = p18[0]['mainsnak']['datavalue']['value']
            return _resolve_commons(filename)
    except Exception as e:
        log.debug('  Wikidata error (%s): %s', wikidata_id, e)
    return None


def _resolve_commons(filename: str) -> str | None:
    """Resolve a Wikimedia Commons filename to a direct CDN URL."""
    # Skip non-image file types
    if not re.search(r'\.(jpe?g|png|gif|webp)$', filename, re.IGNORECASE):
        log.debug('  Skipping non-image Commons file: %s', filename)
        return None
    try:
        resp = requests.get(
            COMMONS_API,
            params={
                'action': 'query',
                'titles': f'File:{filename}',
                'prop': 'imageinfo',
                'iiprop': 'url',
                'format': 'json'
            },
            headers={'User-Agent': USER_AGENT},
            timeout=6
        )
        pages = resp.json().get('query', {}).get('pages', {})
        for v in pages.values():
            info = v.get('imageinfo', [])
            if info:
                return info[0]['url']
    except Exception as e:
        log.debug('  Commons resolve error (%s): %s', filename, e)
    return None


# ─────────────────────────── Source 4: Pexels ─────────────────────────────────

def _pexels_image(query: str) -> str | None:
    """
    Fetch from Pexels with smart rate-limit guarding.
    Falls back to simpler queries if full query returns nothing.
    """
    if not PEXELS_API_KEY:
        return None
    if not _pexels_allowed():
        log.warning('  Pexels rate limit reached — skipping')
        return None

    words   = query.split()
    # Try progressively simpler queries for better hit rate
    attempts = [
        query,
        ' '.join(words[:5]),
        ' '.join(words[:3]),
    ]
    # De-duplicate
    seen, unique_attempts = set(), []
    for a in attempts:
        if a not in seen:
            seen.add(a)
            unique_attempts.append(a)

    for attempt in unique_attempts:
        try:
            resp = requests.get(
                PEXELS_API_URL,
                headers={'Authorization': PEXELS_API_KEY},
                params={
                    'query': attempt,
                    'per_page': 5,
                    'orientation': 'landscape',
                },
                timeout=6
            )
            _pexels_increment()

            if resp.status_code == 429:
                log.warning('  Pexels 429 — backing off')
                return None
            if resp.status_code != 200:
                log.debug('  Pexels %d for query: %s', resp.status_code, attempt)
                continue

            photos = resp.json().get('photos', [])
            if photos:
                # First result is Pexels' best relevance match — don't re-sort by likes
                best = photos[0]
                url  = best['src'].get('large2x') or best['src'].get('large')
                log.info('  ✓ Pexels: %s', attempt)
                return url

        except Exception as e:
            log.debug('  Pexels error (%s): %s', attempt, e)

    return None


# ─────────────────────────── Source 5: Category Placeholder ───────────────────

# Deterministic, self-contained SVG placeholders per category.
# These are data-URIs — no external server dependency, never go 404.
_PLACEHOLDER_SVGS = {
    'fort':       ('🏯', '#8B4513'),
    'palace':     ('🏰', '#DAA520'),
    'temple':     ('⛩️',  '#DC143C'),
    'mosque':     ('🕌', '#2E8B57'),
    'church':     ('⛪', '#4682B4'),
    'beach':      ('🏖️', '#00CED1'),
    'mountain':   ('⛰️',  '#696969'),
    'waterfall':  ('💧', '#1E90FF'),
    'wildlife':   ('🐘', '#228B22'),
    'garden':     ('🌿', '#32CD32'),
    'lake':       ('🌊', '#4169E1'),
    'museum':     ('🏛️', '#708090'),
    'market':     ('🛍️', '#FF8C00'),
    'monument':   ('🗿', '#A0522D'),
    'cave':       ('🕳️',  '#2F4F4F'),
    'island':     ('🏝️', '#20B2AA'),
    'default':    ('📍', '#6C757D'),
}

def _get_placeholder(name: str, tags: dict = None) -> str:
    """
    Returns a minimal inline SVG as a data URI.
    Always succeeds, deterministic, zero external dependencies.
    """
    name_lower = name.lower()
    category   = 'default'

    checks = [
        (['fort', 'qila', 'fortress', 'citadel'],            'fort'),
        (['palace', 'mahal', 'haveli'],                      'palace'),
        (['temple', 'mandir', 'gurdwara', 'kovil'],          'temple'),
        (['mosque', 'masjid', 'dargah'],                     'mosque'),
        (['church', 'cathedral'],                            'church'),
        (['beach', 'coast'],                                 'beach'),
        (['mountain', 'hill', 'peak', 'ghats'],              'mountain'),
        (['waterfall', 'falls'],                             'waterfall'),
        (['wildlife', 'sanctuary', 'national park', 'jungle'],'wildlife'),
        (['garden', 'bagh', 'park', 'botanical'],            'garden'),
        (['lake', 'sagar', 'backwater'],                     'lake'),
        (['museum', 'gallery'],                              'museum'),
        (['market', 'bazaar', 'chowk'],                      'market'),
        (['monument', 'memorial', 'stupa'],                  'monument'),
        (['cave', 'cavern'],                                 'cave'),
        (['island'],                                         'island'),
    ]
    for keywords, cat in checks:
        if any(kw in name_lower for kw in keywords):
            category = cat
            break

    if isinstance(tags, dict):
        t = tags.get('historic', '')
        n = tags.get('natural', '')
        if t in ('castle', 'fort'):      category = 'fort'
        elif t == 'palace':              category = 'palace'
        elif n == 'beach':               category = 'beach'
        elif n in ('peak',):             category = 'mountain'

    emoji, color = _PLACEHOLDER_SVGS.get(category, _PLACEHOLDER_SVGS['default'])

    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500">'
        f'<rect width="800" height="500" fill="{color}" opacity="0.15"/>'
        f'<text x="400" y="220" font-size="100" text-anchor="middle">{emoji}</text>'
        f'<text x="400" y="320" font-size="28" text-anchor="middle" '
        f'fill="#333" font-family="sans-serif">{name}</text>'
        f'</svg>'
    )
    import base64
    encoded = base64.b64encode(svg.encode('utf-8')).decode('ascii')
    log.info('  ℹ Placeholder [%s]: %s', category, name)
    return f'data:image/svg+xml;base64,{encoded}'


# ─────────────────────────── Main Entry Point ─────────────────────────────────

def get_image(
    name: str,
    tags: dict = None,
    location: dict = None,
) -> dict:
    """
    Fetch the best available image for a travel destination.

    Args:
        name:     Destination name, e.g. "Amber Fort"
        tags:     OSM tags dict — used for wikidata ID and type hints
        location: {'city': 'Jaipur', 'state': 'Rajasthan', 'country': 'India'}

    Returns:
        {
            'url':    str,   # Always populated — data-URI if all APIs fail
            'source': str,   # 'cache' | 'wikipedia' | 'wikidata' | 'pexels' | 'placeholder'
            'name':   str,
        }
    """
    if not isinstance(tags, dict):
        tags = {}

    wikidata_id = tags.get('wikidata', '')
    cache_key   = wikidata_id if wikidata_id else f'dest:{name}'

    # 1. Cache
    cached = _cache_get(cache_key)
    if cached:
        url, source = cached
        log.info('✓ Cache [%s]: %s', source, name)
        return {'url': url, 'source': 'cache', 'name': name}

    log.info('🔍 Fetching: %s', name)

    url    = None
    source = None

    # 2. Wikipedia REST (most accurate, free, unlimited)
    url = _wikipedia_image(name)
    if url:
        source = 'wikipedia'

    # 2b. Wikipedia search fallback (handles alternate spellings)
    if not url:
        url = _wikipedia_search_image(name, location)
        if url:
            source = 'wikipedia_search'

    # 3. Wikidata P18 (when OSM provides wikidata ID directly)
    if not url and wikidata_id:
        url = _wikidata_image(wikidata_id)
        if url:
            source = 'wikidata'

    # 4. Pexels (rate-limited, used only when Wikipedia misses)
    if not url:
        query = build_query(name, tags, location)
        log.info('  Query: %s', query)
        url = _pexels_image(query)
        if url:
            source = 'pexels'

    # 5. Category placeholder (always succeeds)
    if not url:
        url    = _get_placeholder(name, tags)
        source = 'placeholder'

    _cache_set(cache_key, url, source)
    log.info('✓ Done [%s]: %s', source, name)
    return {'url': url, 'source': source, 'name': name}


# ─────────────────────────── Batch Helper ─────────────────────────────────────

def get_images_batch(destinations: list, delay: float = 0.3) -> dict:
    """
    Fetch images for multiple destinations with a small delay to respect APIs.

    Args:
        destinations: list of dicts with keys: name, tags (optional), location (optional)
        delay:        seconds between requests (default 0.3s)

    Returns:
        { destination_name: result_dict }
    """
    results = {}
    total   = len(destinations)
    for i, dest in enumerate(destinations, 1):
        name = dest.get('name')
        if not name:
            continue
        log.info('[%d/%d]', i, total)
        results[name] = get_image(
            name     = name,
            tags     = dest.get('tags'),
            location = dest.get('location'),
        )
        if i < total:
            time.sleep(delay)
    return results


def get_image_for_destination(name: str, tags: dict = None, location: dict = None, **kwargs) -> str | None:
    """Wrapper function for backward compatibility. Returns only the URL string."""
    # Catch older parameter names like location_context and use them as location fallback
    loc = location or kwargs.get('location_context') or kwargs.get('context')
    res = get_image(name, tags, location=loc)
    return res.get('url') if res else None


# ─────────────────────────── CLI Self-Test ────────────────────────────────────

def _self_test():
    test_cases = [
        {
            'name': 'Taj Mahal',
            'tags': {'historic': 'monument', 'wikidata': 'Q9620'},
            'location': {'city': 'Agra', 'state': 'Uttar Pradesh', 'country': 'India'},
        },
        {
            'name': 'Amber Fort',
            'tags': {'historic': 'castle'},
            'location': {'city': 'Jaipur', 'state': 'Rajasthan', 'country': 'India'},
        },
        {
            'name': 'Calangute Beach',
            'tags': {'natural': 'beach'},
            'location': {'city': 'Goa', 'state': 'Goa', 'country': 'India'},
        },
        {
            'name': 'Shri Balaji Temple Ajmer',
            'tags': {'amenity': 'place_of_worship'},
            'location': {'city': 'Ajmer', 'state': 'Rajasthan', 'country': 'India'},
        },
        {
            'name': 'Dudhsagar Waterfalls',
            'tags': {'natural': 'waterfall'},
            'location': {'city': 'Mollem', 'state': 'Goa', 'country': 'India'},
        },
    ]

    print('\n' + '=' * 65)
    print('IMAGE SERVICE SELF-TEST')
    print('=' * 65)
    results = get_images_batch(test_cases, delay=0.5)
    print()
    for name, res in results.items():
        ok     = res['url'] and (res['url'].startswith('http') or res['url'].startswith('data:'))
        status = '✅' if ok else '❌'
        src    = res['source']
        url    = res['url'][:70] if res['url'] else 'NONE'
        print(f"{status} [{src:20s}] {name}")
        print(f"   {url}...")
    print('=' * 65)


if __name__ == '__main__':
    _self_test()