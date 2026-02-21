
from database import db_session, init_db
from models import Destination

def clear_all_destinations():
    print("⚠️  WARNING: This will DELETE ALL DESTINATIONS from the database.")
    confirm = input("Type 'DELETE' to confirm: ")
    
    if confirm == "DELETE":
        try:
            num_deleted = db_session.query(Destination).delete()
            db_session.commit()
            print(f"✅ Successfully deleted {num_deleted} destinations.")
        except Exception as e:
            db_session.rollback()
            print(f"❌ Error: {e}")
    else:
        print("❌ Operation cancelled.")

if __name__ == "__main__":
    init_db()
    clear_all_destinations()
