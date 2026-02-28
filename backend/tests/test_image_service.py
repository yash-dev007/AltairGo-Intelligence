import os
import sys
import pytest
from dotenv import load_dotenv

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)
load_dotenv()

from services.image_service import get_image_for_destination

def test_image_service_queries():
    print(f"Pexels Key Present:   {bool(os.getenv('PEXELS_API_KEY'))}")
    
    queries = ["Garden", "City Center", "Market", "Garden", "Market"]
    
    print("\n--- Testing Repetition ---")
    results = []
    for q in queries:
        url = get_image_for_destination(q, {})
        results.append(url)
        print(f"Query: '{q}' -> URL: {url}")
        
    assert len(results) == len(queries)
