import os
import sys
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
load_dotenv()

from services.image_service import get_image_for_destination, get_curated_fallback

print(f"Pexels Key Present:   {bool(os.getenv('PEXELS_API_KEY'))}")
print(f"Pixabay Key Present:  {bool(os.getenv('PIXABAY_API_KEY'))}")
print(f"Unsplash Key Present: {bool(os.getenv('UNSPLASH_ACCESS_KEY'))}")

queries = ["Garden", "City Center", "Market", "Garden", "Market"]

print("\n--- Testing Repetition ---")
for q in queries:
    url = get_image_for_destination(q, {})
    print(f"Query: '{q}' -> URL: {url}")
