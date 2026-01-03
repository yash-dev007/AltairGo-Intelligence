from services.image_service import get_image_for_destination, fetch_wikimedia_image
import time

def test_single_fetch():
    print("--- Testing Single Fetch ---")
    # Known ID: Eiffel Tower (Q243)
    start = time.time()
    url = fetch_wikimedia_image("Q243")
    print(f"Wikidata Fetch (Q243): {url} (took {time.time() - start:.2f}s)")
    
    # Fallback Test
    print("\n--- Testing Fallback ---")
    start = time.time()
    url = get_image_for_destination("Random Park", {"leisure": "park"})
    print(f"Fallback Fetch: {url} (took {time.time() - start:.2f}s)")

if __name__ == "__main__":
    test_single_fetch()
