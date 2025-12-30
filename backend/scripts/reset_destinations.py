import sys
import os

# Adjust path to import backend modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../')))

from database import db_session
from models import Destination

def reset_destinations():
    try:
        count = db_session.query(Destination).delete()
        db_session.commit()
        print(f"✅ Successfully deleted {count} existing destinations.")
        print("You can now regenerate fresh data with English names.")
    except Exception as e:
        db_session.rollback()
        print(f"❌ Error resetting data: {e}")

if __name__ == "__main__":
    reset_destinations()
