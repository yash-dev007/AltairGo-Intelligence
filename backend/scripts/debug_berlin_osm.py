import sys
import os
import requests

# Add parent directory to path to import modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../')))

def test_berlin_query():
    region_name = "Berlin"
    country_name = "Germany"
    country_code = "DE"
    
    query = f"""
    [out:json][timeout:90];
    // Search for country by ISO code if available, otherwise name
    (
      area["ISO3166-1"="{country_code}"];
      area["name:en"="{country_name}"];
      area["name"="{country_name}"];
    )->.country;
    
    (
      area["name"="{region_name}"](area.country);
      area["name:en"="{region_name}"](area.country);
      area["name"~"{region_name}",i](area.country);
    )->.region;
    
    (
      nwr["tourism"~"attraction|museum|viewpoint|zoo|theme_park|gallery|artwork|historic"](area.region);
      nwr["historic"~"monument|castle|ruins|memorial"](area.region);
      nwr["leisure"~"park|nature_reserve|water_park"](area.region);
      nwr["natural"~"beach|cave|waterfall|peak"](area.region);
    );
    
    out center 100;
    """
    
    url = "https://overpass-api.de/api/interpreter"
    print(f"🌍 querying OSM ({url}) for: {region_name}, {country_name}, code={country_code}...")
    
    try:
        response = requests.get(url, params={'data': query})
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            elems = data.get('elements', [])
            print(f"Found {len(elems)} elements.")
            if len(elems) > 0:
                print("First 5 elements:")
                for i, el in enumerate(elems[:5]):
                    tags = el.get('tags', {})
                    name = tags.get('name:en') or tags.get('name')
                    print(f"  {i+1}. {name} ({tags.get('tourism') or tags.get('historic') or tags.get('leisure')})")
        else:
            print(f"Error Response: {response.text}")
            
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    test_berlin_query()
