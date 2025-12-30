import sys
import os

# Add the parent directory to sys.path to ensure we can import from the backend package
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import db_session
from models import Destination

def clear_destinations():
    print("🧹 Clearing all destinations from the database...")
    try:
        num_deleted = db_session.query(Destination).delete()
        db_session.commit()
        print(f"✅ Successfully deleted {num_deleted} destinations.")
    except Exception as e:
        db_session.rollback()
        print(f"❌ Error clearing destinations: {e}")
    finally:
        db_session.remove()

if __name__ == "__main__":
    clear_destinations()
