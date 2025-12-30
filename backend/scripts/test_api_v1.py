import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_endpoint(endpoint):
    print(f"Testing {endpoint}...")
    try:
        response = requests.get(f"{BASE_URL}{endpoint}")
        if response.status_code == 200:
            print(f"✅ {endpoint} OK")
            data = response.json()
            if isinstance(data, list):
                print(f"   Count: {len(data)}")
                if len(data) > 0:
                    print(f"   Sample: {data[0].get('name')} (Image: {data[0].get('image')})")
            elif isinstance(data, dict):
                print(f"   Name: {data.get('name')}")
            else:
                print("   ⚠️ Empty or invalid data")
        else:
            print(f"❌ {endpoint} Failed: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"❌ {endpoint} Exception: {e}")

if __name__ == "__main__":
    print("Starting API Verification...")
    test_endpoint("/countries")
    test_endpoint("/regions")
    test_endpoint("/destinations")
    test_endpoint("/destinations/1") # El Nido

    # Test POST (Add Destination)
    print("\nTesting POST /destinations...")
    new_dest = {
        "name": "Integration Test Beach",
        "state_id": 1, 
        "desc": "A paradise created by automated tests",
        "tag": "Beach"
    }
    try:
        res = requests.post(f"{BASE_URL}/destinations", json=new_dest)
        if res.status_code == 201:
            data = res.json()
            print(f"✅ POST /destinations Success!")
            print(f"   Created: {data['name']} (ID: {data['id']})")
        else:
            print(f"❌ POST Failed: {res.status_code}")
            print(res.text)
    except Exception as e:
        print(f"❌ POST Exception: {e}")
