import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Setup DB Connection
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from database import db_session as session
from models import Country, State, Destination

def seed_hk():
    print("--- Manual Seeding: Hong Kong ---")
    
    # 1. Get the Country and State
    country = session.query(Country).filter(Country.name.like('%Hong Kong%')).first()
    if not country:
        print("❌ Hong Kong Country not found!")
        return

    state = session.query(State).filter(State.name == 'Hong Kong', State.country_id == country.id).first()
    if not state:
        print("❌ Hong Kong Region not found! (Did fix_city_states.py run?)")
        return

    print(f"Target: {state.name} (ID: {state.id})")

    # 2. Define Top Spots
    spots = [
        {
            "name": "Victoria Peak",
            "desc": "The highest point on Hong Kong Island, offering sweeping views of the skyscrapers and Victoria Harbour.",
            "type": "Viewpoint",
            "price": "Free",
            "rating": 4.8
        },
        {
            "name": "Hong Kong Disneyland",
            "desc": "A magical theme park located on Lantau Island, featuring classic Disney attractions and entertainment.",
            "type": "Theme Park",
            "price": "₹6000",
            "rating": 4.7
        },
         {
            "name": "Tian Tan Buddha",
            "desc": "A large bronze statue of Buddha Shakyamuni, located at Ngong Ping, Lantau Island. Also known as the Big Buddha.",
            "type": "Monument",
            "price": "Free",
            "rating": 4.6
        },
        {
            "name": "Star Ferry",
            "desc": "The charming Star Ferry boats have been faithfully carrying passengers from Hong Kong Island to Kowloon since 1888.",
            "type": "Transport",
            "price": "₹30",
            "rating": 4.9
        },
        {
            "name": "Temple Street Night Market",
            "desc": "A popular street bazaar, named after a Tin Hau temple in the centre, the best place to eat and shop.",
            "type": "Market",
            "price": "Free",
            "rating": 4.4
        }
    ]

    # 3. Insert
    count = 0
    for spot in spots:
        exists = session.query(Destination).filter_by(name=spot['name'], state_id=state.id).first()
        if exists:
            print(f"   Skipping {spot['name']} (Already exists)")
            continue

        image_url = f"https://source.unsplash.com/800x600/?{spot['name']}"
        
        new_dest = Destination(
            name=spot['name'],
            state_id=state.id,
            desc=spot['desc'],
            description=spot['desc'],
            image=image_url,
            location="Hong Kong",
            price_str=spot['price'],
            estimated_cost_per_day=5000, 
            rating=spot['rating'],
            reviews_count_str="1000+",
            best_time="Oct-Dec",
            crowd_level="High",
            tag=spot['type'],
            vibe_tags=[spot['type'], 'Urban']
        )
        session.add(new_dest)
        count += 1
        
    session.commit()
    print(f"✅ Successfully added {count} destinations to Hong Kong!")

if __name__ == "__main__":
    seed_hk()
