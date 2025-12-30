import sys
import os

# Add parent directory to path to import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import init_db, db_session
from models import Country, State, Destination
from countries import countries_data
from regions import regions_data
from destinations import destinations_data

def migrate():
    print("Initializing Database...")
    # Clean slate usually needed, but generic Create All works if tables don't exist.
    # If tables exist and we want to re-fill, we should ideally drop them or check uniqueness.
    # For now, assuming fresh DB (file deleted).
    init_db()
    
    print("Migrating Countries...")
    countries_lookup = {} # code -> id
    
    for country_data in countries_data:
        # Check if exists (idempotency)
        existing = db_session.query(Country).filter_by(code=country_data['code']).first()
        if existing:
            countries_lookup[country_data['code']] = existing.id
            continue
            
        c = Country(
            name=country_data['name'],
            code=country_data['code'],
            image=country_data.get('image'),
            # currency is not in countries.py, maybe in regions? No. defaulting to None or empty.
            # regions.py doesn't have currency either in the updated view I saw.
            # destinations has price with currency symbol.
            # Let's check regions.py again? I saw "currency" in my first read of regions.py?
            # Re-reading my own logs... regions.py I saw lines 1-800, no currency field.
            # Wait, line 2 in regions.py snippet: "name": "Auvergne...", "country": "fr", "image": ...
            # No currency. My previous script assumption was specific to a different version or hallucination.
            # Removing currency field from population for now.
        )
        db_session.add(c)
        db_session.flush()
        countries_lookup[country_data['code']] = c.id
        
    db_session.commit()
    print(f"Migrated {len(countries_lookup)} countries.")

    print("Migrating States (Regions)...")
    states_lookup = {} # (country_code, state_name) -> state_id
    
    for region in regions_data:
        country_code = region['country']
        country_id = countries_lookup.get(country_code)
        
        if not country_id:
            print(f"Skipping region {region['name']}, country code {country_code} not found.")
            continue
            
        # Check if state exists
        existing = db_session.query(State).filter_by(name=region['name'], country_id=country_id).first()
        if existing:
            states_lookup[(country_code, region['name'])] = existing.id
            continue
            
        s = State(
            name=region['name'],
            image=region.get('image'),
            country_id=country_id
        )
        db_session.add(s)
        db_session.flush()
        states_lookup[(country_code, region['name'])] = s.id
        
    db_session.commit()
    print(f"Migrated states/regions.")
    
    print("Migrating Destinations...")
    dest_count = 0
    for dest_data in destinations_data:
        country_code = dest_data['country']
        location_name = dest_data['location'] # This acts as the State Name
        
        # Link to State
        state_id = states_lookup.get((country_code, location_name))
        
        if not state_id:
            # Need to create this state dynamically if it doesn't exist in regions.py?
            # Or just warn?
            # For data integrity, let's create it if country exists.
            country_id = countries_lookup.get(country_code)
            if country_id:
                print(f"Implicitly creating state '{location_name}' for destination '{dest_data['name']}'")
                new_state = State(name=location_name, country_id=country_id)
                db_session.add(new_state)
                db_session.flush()
                state_id = new_state.id
                states_lookup[(country_code, location_name)] = state_id
            else:
                print(f"Warning: Cannot find country '{country_code}' for destination '{dest_data['name']}'")
                continue
        
        new_dest = Destination(
            name=dest_data['name'],
            desc=dest_data['desc'],
            description=dest_data['description'],
            image=dest_data['image'],
            location=dest_data['location'],
            price_str=dest_data['price'],
            estimated_cost_per_day=dest_data.get('estimatedCostPerDay', 0),
            rating=dest_data['rating'],
            reviews_count_str=dest_data['reviews'],
            best_time=dest_data['bestTime'],
            crowd_level=dest_data['crowdLevel'],
            tag=dest_data['tag'],
            highlights=dest_data.get('highlights', []),
            itinerary=dest_data.get('itinerary', []),
            best_time_months=dest_data.get('bestTimeMonths', []),
            vibe_tags=dest_data.get('vibe_tags', []),
            state_id=state_id
        )
        db_session.add(new_dest)
        dest_count += 1
        
    db_session.commit()
    print(f"Migrated {dest_count} destinations.")
    print("Migration Complete!")

if __name__ == "__main__":
    try:
        migrate()
    except Exception as e:
        import traceback
        traceback.print_exc()
