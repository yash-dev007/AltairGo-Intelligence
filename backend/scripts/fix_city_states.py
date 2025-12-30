import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Setup DB Connection
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from database import db_session as session
from models import Country, State

def fix_city_states():
    print("--- Fixing City-States (Countries with 0 Regions) ---")
    
    countries = session.query(Country).all()
    fixed_count = 0
    
    for c in countries:
        if len(c.states) == 0:
            print(f"⚠️ {c.name} has NO regions. Creating default...")
            
            # Create a default region with same name
            new_state = State(
                name=c.name,
                country_id=c.id,
                # description not in model
                image=c.image or "https://source.unsplash.com/800x600/?" + c.name
            )
            session.add(new_state)
            fixed_count += 1
            
    if fixed_count > 0:
        session.commit()
        print(f"✅ Fixed {fixed_count} countries (Including Hong Kong, Singapore, etc.)")
    else:
        print("All countries already have regions.")

if __name__ == "__main__":
    fix_city_states()
