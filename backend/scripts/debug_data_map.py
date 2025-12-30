import requests

BASE_URL = "http://127.0.0.1:5000"

def audit_data():
    print("Fetching Regions...")
    regions = requests.get(f"{BASE_URL}/regions").json()
    print(f"Total Regions: {len(regions)}")
    
    print("Fetching Destinations...")
    dests = requests.get(f"{BASE_URL}/destinations").json()
    print(f"Total Destinations: {len(dests)}")
    
    # Map
    region_map = {r['id']: r['name'] for r in regions}
    dest_counts = {}
    
    print("\n--- DATA MAPPING ---")
    for d in dests:
        sid = d.get('state_id')
        sname = region_map.get(sid, "UNKNOWN_REGION")
        
        if sid not in dest_counts:
            dest_counts[sid] = []
        dest_counts[sid].append(d['name'])
        
        print(f"Dest: '{d['name']}' -> State ID: {sid} ({sname})")

    print("\n--- SUMMARY: REGIONS WITH DATA ---")
    if not dest_counts:
        print("CRITICAL: NO DESTINATIONS HAVE STATE IDs ASSIGNED!")
    else:
        for sid, dlist in dest_counts.items():
            print(f"State ID {sid} ({region_map.get(sid, 'Unknown')}): {len(dlist)} destinations")
            print(f"   - {', '.join(dlist)}")

if __name__ == "__main__":
    audit_data()
