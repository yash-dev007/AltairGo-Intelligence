from services.image_service import CURATED_IMAGES
import requests

def verify_curated_images():
    print("--- Verifying Curated Images ---")
    for category, urls in CURATED_IMAGES.items():
        print(f"Checking {category} ({len(urls)} images)...")
        for i, url in enumerate(urls):
            try:
                resp = requests.head(url, timeout=5)
                if resp.status_code != 200:
                    print(f"  [FAIL] {url} -> {resp.status_code}")
                else:
                    # Print only first one to confirm success
                     if i == 0: print(f"  [OK] {url}...")
            except Exception as e:
                print(f"  [ERROR] {url} -> {e}")

if __name__ == "__main__":
    verify_curated_images()
