import requests
import random
import time
from models import Destination, State
from database import db_session

# List of Overpass instances to try
OVERPASS_URLS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://lz4.overpass-api.de/api/interpreter"
]

def fetch_osm_raw(region_name, country_name, country_code=None):
    print(f"DEBUG: fetch_osm_raw called with: region='{region_name}', country='{country_name}', code='{country_code}'")
    # Overpass Query: Simplified (Nodes only for speed)
    # Timeout 25s to fail fast and retry next mirror
    query = f"""
    [out:json][timeout:90];
    // OPTIMIZED QUERY
    // 1. Find Country Area
    area["ISO3166-1"="{country_code.upper()}"]->.country;
    
    // 2. Find State/Region Area explicitly via Relation (Fastest for admin boundaries)
    (
      // Precise Admin Level 4 search within country
      relation["name"="{region_name}"]["admin_level"="4"](area.country);
      relation["name:en"="{region_name}"]["admin_level"="4"](area.country);
      
      // Broader search if precise fails
      area["name"="{region_name}"](area.country);
    )->.raw_region;
    
    // Convert any relations to areas
    .raw_region map_to_area -> .region;
    
    // 3. Find Attractions
    (
      nwr["tourism"~"attraction|museum|viewpoint|zoo|theme_park|gallery|artwork|historic"](area.region);
      nwr["historic"~"monument|castle|ruins|memorial"](area.region);
      nwr["leisure"~"park|nature_reserve|water_park"](area.region);
      nwr["natural"~"beach|cave|waterfall|peak"](area.region);
    );
    
    out center 5000;
    """
    
    for url in OVERPASS_URLS:
        print(f"🌍 querying OSM ({url}) for: {region_name}, {country_name}...")
        try:
            response = requests.get(url, params={'data': query})
            if response.status_code == 200:
                data = response.json()
                elems = data.get('elements', [])
                if elems:
                    return elems
                print("   ⚠️ No elements found on this mirror.")
            else:
                print(f"   ❌ Error {response.status_code} on {url}")
        except Exception as e:
            print(f"   ❌ Connection Error on {url}: {e}")
            
    print("❌ All OSM mirrors failed or returned no data.")
    return []

def populate_region_data(state_id):
    """
    Fetch and insert destinations for a given state ID.
    Returns the list of newly created Destination objects (as dicts).
    """
    state_obj = db_session.query(State).get(state_id)
    if not state_obj:
        print(f"State ID {state_id} not found")
        return []

    # Check limits? NO LIMITS.
    # Only skip if we truly have a massive amount that suggests a full load (e.g. 2000+)
    existing_count = db_session.query(Destination).filter_by(state_id=state_id).count()
    if existing_count >= 2000:
        print(f"Skipping {state_obj.name}: Already has {existing_count} destinations.")
        return []

    country_name = state_obj.country.name
    country_code = state_obj.country.code
    region_name = state_obj.name
    
    elements = fetch_osm_raw(region_name, country_name, country_code)
    
    if not elements:
        print(f"   ⚠️ No results for {region_name}")
        return []

    new_destinations = []
    count = 0
    
    for el in elements:
        tags = el.get('tags', {})
        # Prioritize English names: name:en -> int_name -> name
        name = tags.get('name:en') or tags.get('int_name') or tags.get('name')
        if not name: continue
        
        # Avoid duplicates
        exists = db_session.query(Destination).filter_by(name=name, state_id=state_obj.id).first()
        if exists:
            continue
            
        # FILTER: Exclude non-tourist amenities
        amenity = tags.get('amenity', '').lower()
        if amenity in ['hospital', 'clinic', 'doctors', 'dentist', 'pharmacy', 
                       'university', 'college', 'school', 'kindergarten', 'childcare',
                       'police', 'post_office', 'bank', 'atm', 'parking']:
            continue
            
        # FILTER: Exclude via name keywords (case insensitive)
        name_lower = name.lower()
        if any(x in name_lower for x in ['hospital', 'clinic', 'university', 'campus', 'college', 'school', 'faculty of']):
            continue
            
        tourism_type = el.get('tags', {}).get('tourism', 'attraction')
        
        # Mock Data Generation
        rating = round(random.uniform(4.0, 4.9), 1)
        price_val = random.choice([0, 500, 1500, 3000])
        price_str = "Free" if price_val == 0 else f"₹{price_val}"
        desc = f"Discover {name}, a stunning {tourism_type} in {region_name}. Perfect for travelers seeking authentic experiences."
        
        image_keywords = f"{name},{tourism_type}"
        image_url = f"https://source.unsplash.com/800x600/?{image_keywords}"
        
        new_dest = Destination(
            name=name,
            state_id=state_obj.id,
            desc=desc[:190] + "...",
            description=desc,
            image=image_url,
            location=region_name,
            price_str=price_str,
            estimated_cost_per_day=price_val + 2000,
            rating=rating,
            reviews_count_str=f"{random.randint(50, 5000)}",
            best_time="Year Round",
            crowd_level=random.choice(['Low', 'Moderate', 'High']),
            tag=tourism_type.capitalize(),
            vibe_tags=[tourism_type, 'Culture' if 'museum' in tourism_type else 'Nature']
        )
        
        db_session.add(new_dest)
        new_destinations.append(new_dest)
        count += 1
        
        # NO BREAK CONDITION. WE EAT EVERYTHING.
        if count % 50 == 0:
            print(f"   ...processed {count} items")
            
    try:
        db_session.commit()
        print(f"   ✅ Added {count} destinations to {region_name}")
        return [d.to_dict() for d in new_destinations]
    except Exception as e:
        db_session.rollback()
        print(f"   ❌ DB Error: {e}")
        return []
