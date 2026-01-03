import requests
import json
import os
import hashlib
from urllib.parse import quote

# --- Configuration ---
CACHE_FILE = 'backend/image_cache.json'
WIKIDATA_API = "https://www.wikidata.org/w/api.php"
UNSPLASH_BASE = "https://loremflickr.com/800/600/" 
UNSPLASH_ACCESS_KEY = "YOUR_UNSPLASH_ACCESS_KEY_HERE" # User to replace this
UNSPLASH_API_URL = "https://api.unsplash.com/search/photos"
USER_AGENT = "AltairGo/1.0 (internal-dev-testing)"

# ... (Cache Management stays same)

# ... (Wikidata/Wikimedia stays same)

# --- Fallback 1: Official Unsplash API ---
def fetch_unsplash_api_image(query):
    if not UNSPLASH_ACCESS_KEY or "YOUR_UNSPLASH" in UNSPLASH_ACCESS_KEY:
        return None
        
    headers = {
        'Authorization': f'Client-ID {UNSPLASH_ACCESS_KEY}',
        'User-Agent': USER_AGENT
    }
    params = {
        'query': query,
        'per_page': 1,
        'orientation': 'landscape'
    }
    
    try:
        resp = requests.get(UNSPLASH_API_URL, params=params, headers=headers, timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            if data['results']:
                return data['results'][0]['urls']['regular']
    except Exception as e:
        print(f"Unsplash API Error: {e}")
        
    return None

# --- Cache Management ---
_cache = {}

def load_cache():
    global _cache
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, 'r') as f:
                _cache = json.load(f)
        except:
            _cache = {}

def save_cache():
    try:
        with open(CACHE_FILE, 'w') as f:
            json.dump(_cache, f, indent=2)
    except:
        pass

def get_cached_image(key):
    if not _cache: load_cache()
    return _cache.get(key)

def cache_image(key, data):
    _cache[key] = data
    save_cache()

# --- Wikidata / Wikimedia ---
def fetch_wikimedia_image(wikidata_id):
    """
    Fetch the main image (P18) from a Wikidata item.
    Returns: URL or None
    """
    params = {
        'action': 'wbgetclaims',
        'entity': wikidata_id,
        'property': 'P18', # P18 is "image"
        'format': 'json'
    }
    headers = {'User-Agent': USER_AGENT}
    
    try:
        resp = requests.get(WIKIDATA_API, params=params, headers=headers, timeout=5)
        data = resp.json()
        
        # Navigate JSON: claims -> P18 -> [0] -> mainsnak -> datavalue -> value (filename)
        claims = data.get('claims', {})
        p18 = claims.get('P18', [])
        
        if p18:
            filename = p18[0]['mainsnak']['datavalue']['value']
            # Convert filename to Wikimedia source URL
            # Standard format: https://upload.wikimedia.org/wikipedia/commons/a/ab/Filename.jpg
            # But we need to calculate the hash path 'a/ab'
            
            # Simple trick: Use the MediaWiki API to resolve the URL, or use a Commons helper.
            # Let's use the MediaWiki API on Commons for robust resolution.
            return resolve_commons_url(filename)
            
    except Exception as e:
        print(f"Wikidata lookup failed for {wikidata_id}: {e}")
    
    return None

def resolve_commons_url(filename):
    """
    Resolve a Commons filename to a direct URL.
    """
    commons_api = "https://commons.wikimedia.org/w/api.php"
    params = {
        'action': 'query',
        'titles': f"File:{filename}",
        'prop': 'imageinfo',
        'iiprop': 'url',
        'format': 'json'
    }
    headers = {'User-Agent': USER_AGENT}
    
    try:
        resp = requests.get(commons_api, params=params, headers=headers, timeout=5)
        data = resp.json()
        pages = data.get('query', {}).get('pages', {})
        
        for k, v in pages.items():
            if 'imageinfo' in v:
                return v['imageinfo'][0]['url']
                
    except Exception as e:
        print(f"Commons resolution failed for {filename}: {e}")
        
    return None

import random

# --- Fallback Images (LoremFlickr - Reliable & Simple) ---
def get_fallback_image(tags):
    """
    Get a reliable placeholder image based on category.
    """
    category = 'travel'
    
    if tags.get('tourism') == 'museum' or tags.get('tourism') == 'gallery':
        category = 'museum'
    elif tags.get('leisure') == 'park' or tags.get('natural') or tags.get('tourism') == 'zoo':
        category = 'nature'
    elif tags.get('historic') or tags.get('tourism') == 'attraction':
        category = 'archaeology'
    elif tags.get('natural') == 'beach':
        category = 'ocean'
    elif tags.get('amenity') == 'restaurant':
        category = 'food'
        
    return f"https://loremflickr.com/800/600/{category}/all"

# --- Main Service Function ---
def get_image_for_destination(name, tags):
    """
    Best-effort image fetcher.
    1. Check Cache
    2. Check Wikidata ID (if in tags)
    3. Fallback to Curated List
    """
    
    # 1. Cache Check (Key: wikidata_id OR name)
    wikidata_id = tags.get('wikidata')
    cache_key = wikidata_id if wikidata_id else f"name:{name}"
    
    cached = get_cached_image(cache_key)
    if cached:
        return cached

    result_url = None

    # 2. Wikidata Strategy
    if wikidata_id:
        # Check if it has an image property
        print(f"   Fetching metadata for {name} ({wikidata_id})...")
        image_url = fetch_wikimedia_image(wikidata_id)
        if image_url:
            result_url = image_url

    # 3. Fallback Strategy A: Unsplash API (High Quality, Exact Match)
    if not result_url:
        # Try to use specific query
        cat = tags.get('tourism') or tags.get('historic') or tags.get('leisure', 'travel')
        api_query = f"{name} {cat}"
        print(f"   Fetching Unsplash API for {api_query}...")
        result_url = fetch_unsplash_api_image(api_query)

    # 4. Fallback Strategy B: Curated List (Guaranteed Safety Net)
    if not result_url:
        print(f"   Fallback to Curated Image for {name}...")
        result_url = get_fallback_image(tags)

    # Save to cache
    if result_url:
        cache_image(cache_key, result_url)
        
    return result_url
