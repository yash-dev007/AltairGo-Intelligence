import requests
import time
from math import radians, cos, sin, asin, sqrt
from models import Destination
from database import db_session

# --- Configuration ---
NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
OVERPASS_URL = "https://overpass-api.de/api/interpreter"
USER_AGENT = "AltairGo/1.0 (internal-dev-testing)"

def geocode_location(query):
    """
    Geocode a city name to (lat, lon).
    Returns (lat, lon, display_name) or None.
    """
    params = {
        'q': query,
        'format': 'json',
        'limit': 1,
        'addressdetails': 1
    }
    headers = {'User-Agent': USER_AGENT}
    
    try:
        response = requests.get(NOMINATIM_URL, params=params, headers=headers)
        if response.status_code == 200:
            data = response.json()
            if data:
                lat = float(data[0]['lat'])
                lon = float(data[0]['lon'])
                name = data[0]['display_name']
                return lat, lon, name
    except Exception as e:
        print(f"Geocoding error: {e}")
    return None

def fetch_pois(lat, lon, radius=5000):
    """
    Fetch POIs around a coordinate using Overpass API.
    Radius in meters.
    """
    # Overpass QL query
    query = f"""
    [out:json][timeout:25];
    (
      node["tourism"~"attraction|museum|viewpoint|zoo|theme_park|gallery|artwork|historic"](around:{radius},{lat},{lon});
      way["tourism"~"attraction|museum|viewpoint|zoo|theme_park|gallery|artwork|historic"](around:{radius},{lat},{lon});
      relation["tourism"~"attraction|museum|viewpoint|zoo|theme_park|gallery|artwork|historic"](around:{radius},{lat},{lon});
      
      node["historic"~"monument|castle|ruins|memorial|church|temple"](around:{radius},{lat},{lon});
      way["historic"~"monument|castle|ruins|memorial|church|temple"](around:{radius},{lat},{lon});
      
      node["leisure"~"park|nature_reserve|water_park"](around:{radius},{lat},{lon});
      way["leisure"~"park|nature_reserve|water_park"](around:{radius},{lat},{lon});
    );
    out center 50;
    """
    
    try:
        response = requests.get(OVERPASS_URL, params={'data': query})
        if response.status_code == 200:
            return response.json().get('elements', [])
    except Exception as e:
        print(f"Overpass error: {e}")
    return []

from services.image_service import get_image_for_destination

def calculate_score(tags):
    """
    Score a POI based on its tags to determine relevance.
    """
    score = 0
    
    # Base importance
    tourism = tags.get('tourism')
    historic = tags.get('historic')
    leisure = tags.get('leisure')
    
    if tourism in ['attraction', 'museum', 'theme_park', 'zoo']:
        score += 10
    elif tourism in ['viewpoint', 'gallery']:
        score += 7
    elif historic:
        score += 8
    elif leisure in ['park', 'nature_reserve']:
        score += 6
        
    # Bonuses for detailed data
    if tags.get('wikipedia'): score += 5
    if tags.get('website'): score += 2
    if tags.get('opening_hours'): score += 1
    if tags.get('wikidata'): score += 3 # Bonus for having Wikidata ID
    
    # Name quality
    name = tags.get('name', '')
    if len(name) > 3 and all(ord(c) < 128 for c in name): # Prefer ASCII names
        score += 2
        
    return score

def process_and_store_destinations(city_query, lat, lon, pois):
    """
    Process raw POIs, score them, deduplicate, and store the best ones.
    Returns list of creates Destination dicts.
    """
    processed_candidates = []
    
    for poi in pois:
        tags = poi.get('tags', {})
        name = tags.get('name') or tags.get('name:en')
        
        if not name:
            continue
            
        score = calculate_score(tags)
        
        # Threshold for "Smart" destination
        if score < 5:
            continue
            
        # Determine category/tag
        category = 'Attraction'
        if tags.get('tourism') == 'museum': category = 'Museum'
        elif tags.get('leisure') == 'park': category = 'Nature'
        elif tags.get('historic'): category = 'History'
        
        # Prepare for parallel image fetching
        processed_candidates.append({
            'name': name,
            'score': score,
            'category': category,
            'lat': poi.get('lat') or poi.get('center', {}).get('lat'),
            'lon': poi.get('lon') or poi.get('center', {}).get('lon'),
            'tags': tags
        })
        
    # Sort by score descending and take top 10 BEFORE fetching images to save bandwidth
    processed_candidates.sort(key=lambda x: x['score'], reverse=True)
    top_candidates = processed_candidates[:10]
    
    # Parallel Fetch
    import concurrent.futures
    
    def fetch_image_wrapper(candidate):
        candidate['image'] = get_image_for_destination(candidate['name'], candidate['tags'])
        return candidate

    processed = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        future_to_cand = {executor.submit(fetch_image_wrapper, c): c for c in top_candidates}
        for future in concurrent.futures.as_completed(future_to_cand):
            try:
                processed.append(future.result())
            except Exception as e:
                print(f"Image fetch error: {e}")
                # Fallback if thread fails
                c = future_to_cand[future]
                c['image'] = None # or some default
                processed.append(c)

    # Sort again to restore order (ThreadPool finishes out of order)
    processed.sort(key=lambda x: x['score'], reverse=True)
            
    # Deduplicate (simple name check)
    unique_dests = []
    seen_names = set()
    for p in processed:
        if p['name'] not in seen_names:
            seen_names.add(p['name'])
            unique_dests.append(p)
            
    # Take top 10 (already filtered, but safe to keep)
    top_picks = unique_dests[:10]
    
    results = []
    for item in top_picks:
        d = {
            "name": item['name'],
            "desc": f"Top rated {item['category']} in {city_query}",
            "description": f"A highly recommended {item['category']} discovered via smart search. {item['tags'].get('description', '')}",
            "rating": min(5.0, 4.0 + (item['score'] / 20.0)), # Map score to rating roughly
            "image": item['image'],
            "tag": item['category'],
            "price": "Free" if not item['tags'].get('charge') else "Paid",
            "crowdLevel": "Moderate", # Placeholder
            "location": city_query
        }
        results.append(d)
        
    return results

def generate_smart_destinations(city_query):
    # 1. Geocode
    geo = geocode_location(city_query)
    if not geo:
        return {"error": "City not found"}
    
    lat, lon, display_name = geo
    
    # 2. Fetch POIs
    pois = fetch_pois(lat, lon)
    
    # 3. Score & Cluster
    results = process_and_store_destinations(city_query, lat, lon, pois)
    
    return {
        "city": display_name,
        "coordinates": {"lat": lat, "lon": lon},
        "destinations": results
    }
