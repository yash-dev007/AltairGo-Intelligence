import requests
import random
import time
import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Setup DB Connection
# Need to add backend/ parent dir to path to import models
# Setup DB Connection
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from models import Country, State, Destination, Base
from database import db_session as session
from database import engine

print(f"DEBUG: Connecting to DB at {engine.url}")

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

def fetch_osm_destinations(region_name, country_name):
    """
    Fetch top 10 tourist attractions for a specific region using Overpass API
    """
    print(f"🌍 querying OSM for: {region_name}, {country_name}...")
    
    # Overpass Query: 60s timeout
    query = f"""
    [out:json][timeout:60];
    area["name"="{country_name}"]->.country;
    (
      area["name"="{region_name}"](area.country);
      area["name:en"="{region_name}"](area.country);
    )->.region;
    (
      node["tourism"~"attraction|museum|viewpoint|artwork"]["name"](area.region);
      way["tourism"~"attraction|museum|viewpoint|artwork"]["name"](area.region);
    );
    out center 15;
    """
    
    try:
        response = requests.get(OVERPASS_URL, params={'data': query})
        if response.status_code == 200:
            data = response.json()
            return data.get('elements', [])
        else:
            print(f"❌ OSM Error: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Connection Error: {e}")
        return []

def populate_region(state_obj):
    """
    Populate a single state/region with destinations
    """
    country_name = state_obj.country.name
    region_name = state_obj.name
    
    elements = fetch_osm_destinations(region_name, country_name)
    
    if not elements:
        print(f"   ⚠️ No results for {region_name}")
        return

    count = 0
    start_time = time.time()
    
    for el in elements:
        # Extract fields
        name = el.get('tags', {}).get('name')
        if not name: continue
        
        # Avoid duplicates
        exists = session.query(Destination).filter_by(name=name, state_id=state_obj.id).first()
        if exists:
            continue
            
        tourism_type = el.get('tags', {}).get('tourism', 'attraction')
        
        # Mock Data Generation (to be replaced by AI later)
        rating = round(random.uniform(4.0, 4.9), 1)
        price_val = random.choice([0, 500, 1500, 3000])
        price_str = "Free" if price_val == 0 else f"₹{price_val}"
        desc = f"Discover {name}, a stunning {tourism_type} in {region_name}. Perfect for travelers seeking authentic experiences."
        
        # Unsplash Image Placeholder
        image_keywords = f"{name},{tourism_type}"
        image_url = f"https://source.unsplash.com/800x600/?{image_keywords}"
        
        new_dest = Destination(
            name=name,
            state_id=state_obj.id,
            desc=desc[:190] + "...", # truncate
            description=desc,
            image=image_url,
            location=region_name,
            price_str=price_str,
            estimated_cost_per_day=price_val + 2000, # Base cost + entry
            rating=rating,
            reviews_count_str=f"{random.randint(50, 5000)}",
            best_time="Year Round",
            crowd_level=random.choice(['Low', 'Moderate', 'High']),
            tag=tourism_type.capitalize(),
            vibe_tags=[tourism_type, 'Culture' if 'museum' in tourism_type else 'Nature']
        )
        
        session.add(new_dest)
        count += 1
        
        if count >= 8: # Limit to Top 8 per region to avoid spam
            break
            
    try:
        session.commit()
        print(f"   ✅ Added {count} destinations to {region_name}")
    except Exception as e:
        session.rollback()
        print(f"   ❌ DB Error: {e}")

def run_pilot():
    # Only run for pilot countries to respect API limits
    PILOT_COUNTRIES = ['Hong Kong'] 
    
    for c_name in PILOT_COUNTRIES:
        country = session.query(Country).filter(Country.name.like(f"%{c_name}%")).first()
        if not country:
            continue
            
        print(f"\n🚀 Populating {country.name}...")
        
        states = list(country.states)
        target_states = []
        
        # Prioritize Capital/Major Regions
        for s in states:
            if s.name in ['Île-de-France', 'Maharashtra', 'Tokyo', 'Kyoto', 'Delhi']:
                target_states.append(s)
        
        # Fill rest with random
        remaining = [s for s in states if s not in target_states]
        target_states += random.sample(remaining, min(len(remaining), 5 - len(target_states)))

        for state in target_states[:5]:
            populate_region(state)
            time.sleep(5) # Increased courtesy sleep

if __name__ == "__main__":
    run_pilot()
