from app import app
from models import Destination
from database import db_session
import os

BAD_URL_PART = "ixlib=" # The old URL had query params, the new one doesn't (mostly)
FIXED_URL = "https://images.unsplash.com/5/unsplash-kitsune-4.jpg"

def clean_db():
    with app.app_context():
        # Find generated destinations (Check ALL for broken links)
        candidates = db_session.query(Destination).all()
        
        deleted_count = 0
        for d in candidates:
            # Delete entries with deprecated source.unsplash.com URL
            if "source.unsplash.com" in (d.image or ""):
                print(f"Deleting stale destination: {d.name} (Image: {d.image})")
                db_session.delete(d)
                deleted_count += 1
                
        db_session.commit()
        print(f"Deleted {deleted_count} stale destinations.")

def clean_cache():
    cache_path = 'image_cache.json'
    if os.path.exists(cache_path):
        os.remove(cache_path)
        print("image_cache.json deleted.")
    else:
        print("No image_cache.json found.")

if __name__ == "__main__":
    clean_db()
    clean_cache()
