from flask import Blueprint, request, jsonify
from database import db_session
from models import Destination, State, Country, DestinationRequest
from services.ai_destination_service import generate_destinations_for_region
from services.image_service import get_image_for_destination
from services.generation_service import generate_smart_destinations
import random
import os
import json

destinations_bp = Blueprint('destinations', __name__)

# Reviews File — absolute path so it works regardless of cwd
REVIEWS_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'reviews.json')

@destinations_bp.route('/api/destination-requests', methods=['POST'])
def submit_destination_request():
    data = request.json
    if not data or 'name' not in data:
        return jsonify({"error": "Name is required"}), 400
    
    try:
        new_req = DestinationRequest(
            name=data['name'],
            description=data.get('desc'),
            cost=data.get('cost'),
            tag=data.get('tag'),
            state_id=data.get('state_id'),
            status='pending'
        )
        db_session.add(new_req)
        db_session.commit()
        return jsonify(new_req.to_dict()), 201
    except Exception as e:
        db_session.rollback()
        return jsonify({"error": str(e)}), 500

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

@destinations_bp.route('/countries', methods=['GET'])
def get_countries():
    countries = db_session.query(Country).all()
    # Simple serialization
    return jsonify([{
        "id": c.id,
        "code": c.code,
        "name": c.name,
        "image": c.image
    } for c in countries])

@destinations_bp.route('/regions', methods=['GET'])
def get_regions():
    states = db_session.query(State).all()
    return jsonify([{
        "id": s.id,
        "name": s.name,
        "country": s.country.code if s.country else None,
        "image": s.image 
    } for s in states])

@destinations_bp.route('/regions/<int:region_id>/populate', methods=['POST'])
def populate_region_endpoint(region_id):
    try:
        # First check if we already have destinations for this region
        existing = db_session.query(Destination).filter_by(state_id=region_id).all()
        if existing and len(existing) >= 5:
            print(f"✅ Region {region_id} already has {len(existing)} destinations")
            return jsonify({"status": "success", "data": [d.to_dict() for d in existing]}), 200
        
        # Get region info for AI context
        state_obj = db_session.query(State).get(region_id)
        if not state_obj:
            return jsonify({"error": "Region not found"}), 404
        
        country_name = state_obj.country.name if state_obj.country else "Unknown"
        country_code = state_obj.country.code if state_obj.country else "IN"
        region_name = state_obj.name
        
        print(f"🌍 AI Generating destinations for {region_name}, {country_name}...")
        
        # Generate destinations using AI
        ai_destinations = generate_destinations_for_region(
            region_name=region_name,
            country_name=country_name,
            country_code=country_code,
            limit=15
        )
        
        if not ai_destinations:
            # Return existing if AI fails
            if existing:
                return jsonify({"status": "success", "data": [d.to_dict() for d in existing]}), 200
            return jsonify({"status": "no_data", "data": []}), 200
        
        new_destinations = []
        for dest_data in ai_destinations:
            # Check for duplicates
            name = dest_data.get('name', '')
            if not name:
                continue
            
            exists = db_session.query(Destination).filter_by(name=name, state_id=region_id).first()
            if exists:
                continue
            
            # Get image from Unsplash
            image_keyword = dest_data.get('image_keyword', f"{name} {region_name}")
            image_url = get_image_for_destination(image_keyword, {})
            
            new_dest = Destination(
                name=name,
                state_id=region_id,
                desc=dest_data.get('description', '')[:190] + "..." if dest_data.get('description') else "Discover this gem",
                description=dest_data.get('description', 'A beautiful destination waiting to be explored.'),
                image=image_url,
                location=region_name,
                price_str=f"₹{dest_data.get('estimated_cost', 0)}" if dest_data.get('estimated_cost', 0) > 0 else "Free",
                estimated_cost_per_day=dest_data.get('estimated_cost', 0) + 2000,
                rating=dest_data.get('rating', round(random.uniform(4.0, 4.9), 1)),
                reviews_count_str=f"{random.randint(50, 2000)}",
                best_time=dest_data.get('best_time', 'Year Round'),
                crowd_level=dest_data.get('crowd_level', 'Moderate'),
                tag=dest_data.get('type', 'Attraction'),
                highlights=dest_data.get('highlights', []),
                vibe_tags=[dest_data.get('type', 'Culture'), 'AI Recommended']
            )
            
            db_session.add(new_dest)
            new_destinations.append(new_dest)
        
        db_session.commit()
        print(f"✅ Added {len(new_destinations)} AI-generated destinations to {region_name}")
        
        # Return all destinations (existing + new)
        all_dests = db_session.query(Destination).filter_by(state_id=region_id).all()
        return jsonify({"status": "success", "data": [d.to_dict() for d in all_dests]}), 201
        
    except Exception as e:
        db_session.rollback()
        print(f"❌ AI Populate Error: {e}")
        return jsonify({"error": str(e)}), 500

@destinations_bp.route('/generate-destinations', methods=['POST'])
def generate_destinations_endpoint():
    data = request.json
    city_query = data.get('query')
    
    if not city_query:
        return jsonify({"error": "Missing 'query' parameter"}), 400
        
    try:
        result = generate_smart_destinations(city_query)
        if "error" in result:
             return jsonify(result), 404
             
        return jsonify(result)
    except Exception as e:
        print(f"Generation Error: {e}")
        return jsonify({"error": str(e)}), 500

@destinations_bp.route('/destinations', methods=['GET', 'POST'])
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

@destinations_bp.route('/destinations/<int:dest_id>', methods=['GET'])
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

@destinations_bp.route('/destinations/<int:dest_id>/reviews', methods=['POST'])
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
