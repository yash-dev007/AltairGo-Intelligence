import requests
import json

url = "http://127.0.0.1:5000/generate-destinations"
payload = {"query": "Lisbon, Portugal"}

try:
    print(f"Testing {url} with query '{payload['query']}'...")
    response = requests.post(url, json=payload, timeout=30)
    
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print("Success!")
        print(f"City: {data.get('city')}")
        print(f"Found {len(data.get('destinations', []))} destinations.")
        for d in data.get('destinations', [])[:3]:
             print(f"- {d['name']} ({d['tag']}) [Rating: {d['rating']}]")
    else:
        print("Failed.")
        print(response.text)
        
except Exception as e:
    print(f"Error: {e}")
