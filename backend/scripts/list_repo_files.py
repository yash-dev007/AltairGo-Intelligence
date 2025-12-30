import requests

def list_files():
    url = "https://api.github.com/repos/stefanbinder/countries-states/contents"
    print(f"Fetching {url}...")
    try:
        r = requests.get(url)
        if r.status_code == 200:
            data = r.json()
            for item in data:
                if item['name'].endswith('.json') or item['name'].endswith('.csv'):
                    print(f"File: {item['name']}")
                    print(f"URL: {item['download_url']}")
        else:
            print(f"Error: {r.status_code}")
    except Exception as e:
        print(e)

if __name__ == "__main__":
    list_files()
