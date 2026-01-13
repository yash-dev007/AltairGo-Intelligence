from services.image_service import get_image_for_destination
import os

# Ensure clean state (no key)
if 'UNSPLASH_ACCESS_KEY' in os.environ:
    del os.environ['UNSPLASH_ACCESS_KEY']

print("--- Verifying Image Generation Logic (No API Key) ---")

test_cases = [
    ("The British Museum", {'tourism': 'museum', 'name': 'The British Museum'}),
    ("Hyde Park", {'leisure': 'park', 'name': 'Hyde Park'}),
    ("Colosseum", {'historic': 'monument', 'name': 'Colosseum'}),
    ("Bondi Beach", {'natural': 'beach', 'name': 'Bondi Beach'})
]

for name, tags in test_cases:
    print(f"\nFetching image for: {name}")
    url = get_image_for_destination(name, tags)
    print(f" -> URL: {url}")
    
    if "loremflickr" in url:
        category = url.split('/')[-2]
        print(f" -> STATUS: VERIFIED (Dynamic Fallback Used, Category: {category})")
    elif "kitsune" in url:
        print(" -> STATUS: FAILED (Static Fallback Used)")
    else:
        print(" -> STATUS: UNKNOWN SOURCE")
