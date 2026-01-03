from services.image_service import get_image_for_destination

import requests

def check_url(url, label):
    try:
        resp = requests.head(url, allow_redirects=True, timeout=5)
        print(f"[{label}] {resp.status_code} OK" if resp.status_code == 200 else f"[{label}] {resp.status_code} FAIL")
        print(f"   URL: {url}")
    except Exception as e:
        print(f"[{label}] ERROR: {e}")

def test_urls():
    print("--- Debugging Image URLs Connectivity ---")
    
    # Test 1: Wikimedia
    url_wiki = get_image_for_destination("Belem Tower", {"wikidata": "Q215003", "tourism": "attraction"})
    check_url(url_wiki, "Wikimedia")
    
    # Test 2: Fallback (LoremFlickr)
    url_fallback = get_image_for_destination("Random Park", {"leisure": "park", "name": "Random Park"})
    check_url(url_fallback, "LoremFlickr")

    # Test 3: Complex Name Fallback
    url_complex = get_image_for_destination("Museu Nacional de Arte Antiga", {"tourism": "museum"})
    check_url(url_complex, "LoremFlickr-Complex")

if __name__ == "__main__":
    test_urls()
