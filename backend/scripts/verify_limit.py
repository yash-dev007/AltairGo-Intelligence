import sys
import os

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import db_session
from models import State
from services.osm_service import populate_region_data

def test_generation_limit():
    print("🧪 Testing generation limit...")
    
    # Get the first state
    state = db_session.query(State).first()
    if not state:
        print("❌ No states found in database. Cannot test generation.")
        return

    print(f"📍 Testing with state: {state.name} (ID: {state.id})")
    
    # Run population
    new_dests = populate_region_data(state.id)
    
    print(f"📊 Generated {len(new_dests)} destinations.")
    
    if len(new_dests) <= 3:
        print("✅ Limit verification PASSED (<= 3 generated).")
    else:
        print(f"❌ Limit verification FAILED ({len(new_dests)} generated).")

if __name__ == "__main__":
    test_generation_limit()
