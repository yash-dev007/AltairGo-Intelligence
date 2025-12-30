import requests
try:
    data = requests.get('http://127.0.0.1:5000/destinations').json()[0]
    if 'state_id' in data:
        print(f"SUCCESS: state_id found! Value: {data['state_id']}")
    else:
        print("FAILURE: state_id NOT found in keys:", data.keys())
except Exception as e:
    print(f"ERROR: {e}")
