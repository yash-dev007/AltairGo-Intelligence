from flask import Flask, request, jsonify
from flask_cors import CORS
from database import db_session, init_db
from models import Country, State, Destination
from packages import packages_data
from packages import packages_data
from blogs import blogs_data
from features import features_data
import json
import os

REVIEWS_FILE = 'backend/reviews.json'

def load_reviews():
    if not os.path.exists(REVIEWS_FILE):
        return {}
    try:
        with open(REVIEWS_FILE, 'r') as f:
            return json.load(f)
    except:
        return {}

def save_reviews(data):
    with open(REVIEWS_FILE, 'w') as f:
        json.dump(data, f, indent=4)

app = Flask(__name__)
# Enable CORS for all routes, allowing requests from any origin
CORS(app, resources={r"/*": {"origins": "*"}})

# Startup Hook: Ensure DB and Data exist (Critical for Render Free Tier)
with app.app_context():
    init_db()
    # Check if we have countries (proxy for "is initialized")
    if db_session.query(Country).count() == 0:
        print("⚡ DB Empty! Running initial seed (Migrate V1)...")
        from migrate_v1_init import migrate
        try:
            migrate()
            print("✅ Seeding Complete.")
        except Exception as e:
            print(f"❌ Seeding Failed: {e}")

@app.teardown_appcontext
def shutdown_session(exception=None):
    db_session.remove()

@app.route('/generate-itinerary', methods=['POST'])
def generate_itinerary():
    data = request.json
    selected_ids = data.get('selectedDestIds', [])
    
    # Fetch from DB
    selected_dests = db_session.query(Destination).filter(Destination.id.in_(selected_ids)).all()
    selected_dests = [d.to_dict() for d in selected_dests]

    current_day = 1
    plan = []

    for dest in selected_dests:
        # Heuristic: limit days to 3 or description length
        # Note: dest['itinerary'] from to_dict() handling handles None
        itinerary_list = dest.get('itinerary') or []
        days_to_spend = min(3, len(itinerary_list))
        
        for i in range(days_to_spend):
            activity = itinerary_list[i] if i < len(itinerary_list) else "Explore local culture"
            plan.append({
                "day": current_day,
                "location": dest['name'],
                "activities": activity,
                "image": dest['image'],
                "destId": dest['id']
            })
            current_day += 1

    return jsonify(plan)

@app.route('/calculate-budget', methods=['POST'])
def calculate_budget():
    data = request.json
    itinerary = data.get('itinerary', [])
    
    total_cost = 0
    for item in itinerary:
        dest_id = item.get('destId')
        dest = db_session.query(Destination).get(dest_id)
        if dest:
            total_cost += dest.estimated_cost_per_day or 3000
        else:
            total_cost += 3000
            
    return jsonify({"totalCost": total_cost})

@app.route('/smart-insight', methods=['POST'])
def smart_insight():
    data = request.json
    itinerary = data.get('itinerary', [])
    
    # Get full destination objects for the itinerary items
    # Filter valid destinations
    selected_destinations = []
    for item in itinerary:
        dest = db_session.query(Destination).get(item.get('destId'))
        if dest:
            selected_destinations.append(dest.to_dict())
            
    if not selected_destinations:
        return jsonify({
            "type": "info",
            "text": "Select destinations to get smart AI insights."
        })

    has_crowded_spots = any(d.get('crowdLevel') == 'High' for d in selected_destinations)
    is_all_nature = all(d.get('tag') in ['Nature', 'Beach', 'Diving', 'Surfer\'s Paradise'] for d in selected_destinations)
    
    if has_crowded_spots:
        return jsonify({
            "type": "warning",
            "text": "You selected some popular spots. We recommend booking early morning tours to avoid peak crowds."
        })
    elif is_all_nature:
        return jsonify({
            "type": "success",
            "text": "Looks like a pure nature retreat! Don't forget to pack eco-friendly sunscreen and bug spray."
        })
    else:
        return jsonify({
            "type": "info",
            "text": "Great choices! These destinations offer a balanced mix of adventure and relaxation with manageable crowds."
        })

@app.route('/countries', methods=['GET'])
def get_countries():
    countries = db_session.query(Country).all()
    # Simple serialization
    return jsonify([{
        "id": c.id,
        "code": c.code,
        "name": c.name,
        "image": c.image
    } for c in countries])

@app.route('/regions', methods=['GET'])
def get_regions():
    states = db_session.query(State).all()
    return jsonify([{
        "id": s.id,
        "name": s.name,
        "country": s.country.code if s.country else None,
        "image": s.image 
    } for s in states])

# New On-Demand Population Route
from services.osm_service import populate_region_data

@app.route('/regions/<int:region_id>/populate', methods=['POST'])
def populate_region_endpoint(region_id):
    try:
        new_data = populate_region_data(region_id)
        if new_data:
            return jsonify({"status": "success", "data": new_data}), 201
        else:
            # Check if we have existing data
            existing = db_session.query(Destination).filter_by(state_id=region_id).all()
            if existing:
                 return jsonify({"status": "success", "data": [d.to_dict() for d in existing]}), 200
            else:
                # Truly empty
                return jsonify({"status": "no_change", "data": []}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/destinations', methods=['GET', 'POST'])
def handle_destinations():
    if request.method == 'GET':
        dests = db_session.query(Destination).all()
        return jsonify([d.to_dict() for d in dests])
    
    if request.method == 'POST':
        data = request.json
        if not data or 'name' not in data or 'state_id' not in data:
            return jsonify({"error": "Missing required fields: name, state_id"}), 400
            
        new_dest = Destination(
            name=data['name'],
            state_id=data['state_id'],
            desc=data.get('desc', 'Undiscovered Gem'),
            description=data.get('description', 'A beautiful place waiting to be explored.'),
            image=data.get('image'), # Frontend handles fallback if None
            location=data.get('location', 'Unknown Location'),
            price_str=data.get('price', '₹3,000'),
            estimated_cost_per_day=data.get('cost', 3000),
            rating=4.5, # Default bias for new entries
            reviews_count_str='New',
            best_time=data.get('best_time', 'Anytime'),
            crowd_level=data.get('crowd_level', 'Low'),
            tag=data.get('tag', 'Hidden Gem'),
            highlights=data.get('highlights', []),
            itinerary=data.get('itinerary', []),
            best_time_months=data.get('best_time_months', []),
            vibe_tags=data.get('vibe_tags', ['New', 'Adventure'])
        )
        
        db_session.add(new_dest)
        db_session.commit()
        
        return jsonify(new_dest.to_dict()), 201

@app.route('/destinations/<int:dest_id>', methods=['GET'])
def get_destination_detail(dest_id):
    dest = db_session.query(Destination).get(dest_id)
    if dest:
        # Merge reviews into the response
        reviews_data = load_reviews()
        # Use destination name as key
        dest_reviews = reviews_data.get(dest.name, [])
        
        response = dest.to_dict()
        response['reviews_data'] = dest_reviews
        return jsonify(response)
    return jsonify({"error": "Destination not found"}), 404

@app.route('/destinations/<int:dest_id>/reviews', methods=['POST'])
def add_review(dest_id):
    data = request.json
    if not data or 'name' not in data or 'rating' not in data or 'text' not in data:
        return jsonify({"error": "Invalid review data"}), 400
    
    dest = db_session.query(Destination).get(dest_id)
    if not dest:
        return jsonify({"error": "Destination not found"}), 404

    reviews_data = load_reviews()
    dest_key = dest.name
    
    if dest_key not in reviews_data:
        reviews_data[dest_key] = []
        
    reviews_data[dest_key].insert(0, data) # Add to beginning
    save_reviews(reviews_data)
    
    return jsonify({"message": "Review added successfully", "review": data}), 201

@app.route('/packages', methods=['GET'])
def get_packages():
    return jsonify(packages_data)

@app.route('/packages/<int:package_id>', methods=['GET'])
def get_package_detail(package_id):
    package = next((p for p in packages_data if p['id'] == package_id), None)
    if package:
        return jsonify(package)
    return jsonify({"error": "Package not found"}), 404

@app.route('/blogs', methods=['GET'])
def get_blogs():
    return jsonify(blogs_data)

@app.route('/blogs/<int:blog_id>', methods=['GET'])
def get_blog_detail(blog_id):
    blog = next((b for b in blogs_data if b['id'] == blog_id), None)
    if blog:
        return jsonify(blog)
    return jsonify({"error": "Blog not found"}), 404

@app.route('/features', methods=['GET'])
def get_features():
    return jsonify(features_data)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
