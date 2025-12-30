import sys
import os
import requests

def test_berlin_area_only():
    # Attempt 1: Just search for Berlin relation directly
    # Berlin admin_level is usually 4 (state)
    query = """
    [out:json][timeout:25];
    relation["name"="Berlin"]["admin_level"="4"];
    out tags;
    """
    
    url = "https://overpass-api.de/api/interpreter"
    print(f"🌍 querying OSM for Berlin Relation admin_level=4...")
    
    try:
        response = requests.get(url, params={'data': query})
        if response.status_code == 200:
            data = response.json()
            elems = data.get('elements', [])
            print(f"Found {len(elems)} matching relations.")
            if elems:
                print(f"ID: {elems[0]['id']}")
                print(f"Tags: {elems[0]['tags']}")
        else:
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"Ex: {e}")

    # Attempt 2: Search via Area + Country Code (the current logic) but JUST returning the area
    # This verifies if the intersection is the bottleneck or if it returns 0 areas.
    print("\n🌍 Testing Area Intersection Logic (Simulated)...")
    query_2 = """
    [out:json][timeout:25];
    area["ISO3166-1"="DE"]->.country;
    (
      area["name"="Berlin"](area.country);
    );
    out tags;
    """
    try:
        response = requests.get(url, params={'data': query_2})
        if response.status_code == 200:
            data = response.json()
            elems = data.get('elements', [])
            print(f"Found {len(elems)} matching areas inside DE.")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Ex: {e}")

if __name__ == "__main__":
    test_berlin_area_only()
