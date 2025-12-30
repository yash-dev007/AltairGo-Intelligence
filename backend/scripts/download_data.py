import requests
import os

URLS = [
    "https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/countries.json",
    "https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/main/countries.json",
    "https://raw.githubusercontent.com/stefanbinder/countries-states/master/countries.json",
    "https://raw.githubusercontent.com/khkwan0/countryCityStateJson/master/countries.json"
]

OUTPUT_FILE = "countries.json"

import urllib.request

def download():
    # Only target the known good URL
    url = "https://raw.githubusercontent.com/stefanbinder/countries-states/master/countries.json"
    print(f"Downloading from {url}...")
    
    req = urllib.request.Request(
        url, 
        data=None, 
        headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            data = response.read()
            with open(OUTPUT_FILE, 'wb') as f:
                f.write(data)
            print("Download complete via urllib!")
    except Exception as e:
        print(f"Urllib download failed: {e}")

if __name__ == "__main__":
    download()
