from app import app
from models import Destination
from database import db_session

with app.app_context():
    dests = db_session.query(Destination).all()
    print(f"Total Destinations: {len(dests)}")
    for d in dests:
        print(f"ID: {d.id} | Name: {d.name} | Image: {d.image}")
