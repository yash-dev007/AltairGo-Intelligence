import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Setup DB Connection
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from database import db_session as session
from models import Country, State

def check_hk():
    print("--- Searching for Hong Kong ---")
    
    # Check as Country
    hk_country = session.query(Country).filter(Country.name.like('%Hong Kong%')).first()
    if hk_country:
        print(f"✅ Found Country: {hk_country.name} (ID: {hk_country.id})")
        states = hk_country.states
        print(f"   Has {len(states)} regions/states.")
        for s in states:
            print(f"   - {s.name}")
    else:
        print("❌ 'Hong Kong' NOT found as a Country.")

    # Check as State (maybe under China?)
    hk_state = session.query(State).filter(State.name.like('%Hong Kong%')).first()
    if hk_state:
        print(f"✅ Found State: {hk_state.name} (ID: {hk_state.id}) in Country: {hk_state.country.name}")
    else:
        print("❌ 'Hong Kong' NOT found as a State.")

if __name__ == "__main__":
    check_hk()
