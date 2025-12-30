import json
import os
import sys

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import db_session
from models import Country, State

JSON_FILE = 'countries.json'

def seed_world():
    if not os.path.exists(JSON_FILE):
        print(f"Error: {JSON_FILE} not found.")
        return

    print(f"Loading {JSON_FILE}...")
    with open(JSON_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print(f"Loaded {len(data)} countries. Starting seed...")
    
    # Pre-fetch existing countries by code AND name
    existing_countries_code = {c.code: c for c in db_session.query(Country).all()}
    existing_countries_name = {c.name.lower(): c for c in db_session.query(Country).all()}
    
    count_new_countries = 0
    count_new_states = 0
    total_states_processed = 0

    for c_data in data:
        # StefanBinder structure: "code2", "name", "states": [...]
        code = c_data.get('code2')
        name = c_data.get('name')
        if not code:
            code = c_data.get('iso2')
        if not code:
            code = c_data.get('code')
            
        if not code or not name:
            continue
            
        code = code.lower()
        name_lower = name.lower()
        
        country = existing_countries_code.get(code)
        if not country:
            # Check by name
            country = existing_countries_name.get(name_lower)
        
        if not country:
            try:
                country = Country(
                    name=name,
                    code=code,
                    currency=c_data.get('currency'),
                    image=None
                )
                db_session.add(country)
                db_session.flush() # Get ID
                existing_countries_code[code] = country
                existing_countries_name[name_lower] = country
                count_new_countries += 1
            except Exception as e:
                db_session.rollback()
                print(f"Failed to add country {name} ({code}): {e}")
                continue
        
        # Process States
        states_list = c_data.get('states', [])
        if not states_list:
            continue
            
        # Get existing states for this country to avoid dupes
        # Querying per country is better than fetching all states in world (4000+)
        existing_states_names = {s.name for s in db_session.query(State).filter_by(country_id=country.id).all()}
        
        for s_data in states_list:
            # Structure: {"code": "...", "name": "..."}
            s_name = s_data.get('name')
            if not s_name:
                continue
                
            if s_name not in existing_states_names:
                state = State(
                    name=s_name,
                    country_id=country.id,
                    image=None
                )
                db_session.add(state)
                existing_states_names.add(s_name)
                count_new_states += 1
                
        total_states_processed += len(states_list)
        
        # Commit periodically
        if count_new_countries % 10 == 0:
            db_session.commit()

    db_session.commit()
    print("------------------------------------------------")
    print(f"Seeding Complete!")
    print(f"Total Countries in DB: {len(existing_countries_code)}")
    print(f"New Countries Added: {count_new_countries}")
    print(f"New States Added: {count_new_states}")
    print(f"Total States Processed from JSON: {total_states_processed}")

if __name__ == "__main__":
    seed_world()
