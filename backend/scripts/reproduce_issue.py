import requests
import sys

BASE_URL = "http://127.0.0.1:5000"

def run():
    print("1. Fetching Regions...")
    try:
        r = requests.get(f"{BASE_URL}/regions")
        if r.status_code != 200:
            print(f"Failed to fetch regions: {r.status_code} {r.text}")
            return
        
        regions = r.json()
        if not regions:
            print("No regions found.")
            return

        # Pick a region. Preferably one with no destinations yet to trigger population?
        # Or just pick the first one.
        target = regions[0]
        print(f"Targeting Region: {target['name']} (ID: {target['id']})")
        
        print("2. Triggering Population...")
        t0 = requests.post(f"{BASE_URL}/regions/{target['id']}/populate")
        
        print(f"Status Code: {t0.status_code}")
        print(f"Response: {t0.text[:500]}...") # Print first 500 chars
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    run()
