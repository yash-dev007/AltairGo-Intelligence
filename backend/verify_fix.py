import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_details_ai():
    print("\n--- Testing /destination-details-ai ---")
    payload = {"destinationName": "Taj Mahal"}
    try:
        resp = requests.post(f"{BASE_URL}/destination-details-ai", json=payload)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            print(f"Keys: {list(data.keys())}")
            print(f"Special: {data.get('special')[:100]}...")
        else:
            print(f"Error: {resp.text}")
    except Exception as e:
        print(f"Failed: {e}")

def test_dest_id_string():
    print("\n--- Testing /destinations/<id> with string ---")
    id_str = "ai-test-123"
    try:
        resp = requests.get(f"{BASE_URL}/destinations/{id_str}")
        print(f"Status: {resp.status_code}")
        data = resp.json()
        print(f"Response: {data}")
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    test_details_ai()
    test_dest_id_string()
