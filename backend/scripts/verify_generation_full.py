import sys
import os

# Ensure backend dir is in path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(backend_dir)

# Mock Unsplash Key removal just in case
if 'UNSPLASH_ACCESS_KEY' in os.environ:
    del os.environ['UNSPLASH_ACCESS_KEY']

from services.generation_service import generate_smart_destinations

print("--- Starting Generation Verification (Simulating request for 'London') ---")
try:
    result = generate_smart_destinations("London")
    
    if "error" in result:
        print(f"Error: {result['error']}")
    else:
        print(f"City: {result.get('city')}")
        destinations = result.get('destinations', [])
        print(f"Found {len(destinations)} destinations.")
        
        for i, dest in enumerate(destinations[:5]):
            print(f"\n[{i+1}] {dest['name']}")
            print(f"    Category: {dest['tag']}")
            print(f"    Image: {dest['image']}")
            
            if "loremflickr" in dest['image']:
                print("    -> VERIFIED: Using LoremFlickr fallback.")
            elif "unsplash" in dest['image'] and "kitsune" in dest['image']:
                print("    -> FAILED: Still using static Kitsune image.")
            else:
                print("    -> NOTE: Using other image source (possibly wikidata or real unsplash if key existed)")

except Exception as e:
    print(f"Execution Error: {e}")
