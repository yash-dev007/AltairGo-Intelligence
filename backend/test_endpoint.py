import requests

resp = requests.post(
    "http://localhost:5000/generate-itinerary",
    json={
        "selectedDestIds": [],
        "preferences": {
            "startCity": "Mumbai",
            "country": "India",
            "budget": 50000,
            "duration": 5,
            "style": "Standard"
        }
    }
)

print("STATUS:", resp.status_code)
print("BODY:", resp.text)
