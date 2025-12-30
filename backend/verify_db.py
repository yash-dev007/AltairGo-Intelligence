import sys
import os

# Add current directory to path
sys.path.append(os.getcwd())

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Destination
from database import Base

# DB is in current folder
engine = create_engine('sqlite:///travel.db')
Session = sessionmaker(bind=engine)
session = Session()

dest = session.query(Destination).filter_by(name="Integration Test Beach").first()
if dest:
    print(f"FOUND: {dest.name}, ID: {dest.id}, State: {dest.state_id}")
else:
    print("NOT FOUND")
