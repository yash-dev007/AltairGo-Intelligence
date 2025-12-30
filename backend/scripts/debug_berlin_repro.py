import sys
import os

# Add parent directory to path to import modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../')))

from database import db_session
from models import State
from services.osm_service import populate_region_data

def debug_berlin():
    print("Searching for Berlin state...")
    berlin = db_session.query(State).filter_by(name="Berlin").first()
    
    if not berlin:
        print("❌ 'Berlin' state NOT found in DB. Did you run migration?")
        return
        
    print(f"✅ Found Berlin: ID={berlin.id}, CountryID={berlin.country_id}")
    if berlin.country:
        print(f"   Country: {berlin.country.name} (Code: {berlin.country.code})")
    else:
        print("   ❌ Country relationship broken!")
        
    print("\nAttempting to populate data...")
    results = populate_region_data(berlin.id)
    print(f"\nResult: {len(results)} items found.")

if __name__ == "__main__":
    debug_berlin()
