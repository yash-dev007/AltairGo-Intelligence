from flask import Flask, request, jsonify
from flask_cors import CORS
from database import db_session, init_db
from models import Country, State, Destination
from packages import packages_data

from blogs import blogs_data
from features import features_data
import json
import os
from dotenv import load_dotenv

load_dotenv() # Load environment variables from .env file

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
    user_preferences = data.get('preferences', {}) # { 'country': 'Japan', 'month': 'April' }
    
    # Check for API Key
    api_key = os.getenv('GEMINI_API_KEY')
    
    selected_dests = []
    if selected_ids:
        selected_dests = db_session.query(Destination).filter(Destination.id.in_(selected_ids)).all()
    
    dest_names = [d.name for d in selected_dests]
    
    # Heuristic Fallback (Only if NO key)
    if not api_key:
        print("⚠️ No GEMINI_API_KEY found.")
        if not selected_dests:
             return jsonify([]) # Cannot generate without data or AI
             
        current_day = 1
        plan = []
        for dest in [d.to_dict() for d in selected_dests]:
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

    # --- GEMINI AI GENERATION ---
    import google.generativeai as genai
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    # Dynamic Prompt Construction
    if not dest_names:
        # Case: User selected nothing (Surprise Me / Pure AI Plan)
        country_ctx = user_preferences.get('country', 'the destination')
        prompt = f"""
        Plan a complete {user_preferences.get('duration', 5)}-day travel itinerary for {country_ctx}.
        Select the best cities/places to visit automatically.
        
        RETURN ONLY RAW JSON (List of Objects). Schema:
        [
            {{
                "day": 1,
                "location": "City/Place Name",
                "activities": "Detailed morning/afternoon/evening plan...",
                "image": null, 
                "destId": null
            }}
        ]
        """
    else:
        # Case: User selected specific places
        prompt = f"""
        Create a detailed day-by-day travel itinerary including these destinations: {', '.join(dest_names)}.
        Optimize the order logically.
        
        RETURN ONLY RAW JSON. Schema:
        [
            {{
                "day": 1,
                "location": "Destination Name",
                "activities": "Detailed activities...",
                "image": "URL if available",
                "destId": 123
            }}
        ]
        
        Context Data:
        {json.dumps([{ 'id': d.id, 'name': d.name, 'image': d.image } for d in selected_dests])}
        """

    try:
        response = model.generate_content(prompt)
        text_response = response.text.replace('```json', '').replace('```', '').strip()
        generated_plan = json.loads(text_response)
        
        # Post-Processing: Try to fill back images/IDs if AI inferred them
        if not selected_dests and dest_names: 
             pass # Already has data
        elif not selected_dests:
            # Try to match names to DB for images? (Optional optimization)
            pass
            
        return jsonify(generated_plan)
        
    except Exception as e:
        print(f"❌ Gemini Itinerary Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/recommend-destinations', methods=['POST'])
def recommend_destinations():
    # AI-powered "Choose for Me"
    data = request.json
    country_id = data.get('countryId')
    region_ids = data.get('regionIds', [])
    
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        return jsonify({"error": "No API Key"}), 500
        
    import google.generativeai as genai
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    # Context gathering
    country = db_session.query(Country).filter_by(code=country_id).first()
    country_name = country.name if country else "the selected country"
    
    regions = []
    if region_ids:
        # region_ids might be names or IDs, handle carefully
        # For simplicity assume names if strings, or fetch names
        regions = region_ids 
        
    prompt = f"""
    Recommend 4 best specific travel destinations (cities or spots) in {country_name}.
    {f"Focus on these regions: {', '.join(map(str, regions))}." if regions else ""}
    
    Return ONLY a JSON list of strings. Example: ["Kyoto", "Osaka", "Nara", "Hakone"]
    """
    
    try:
        res = model.generate_content(prompt)
        text = res.text.replace('```json', '').replace('```', '').strip()
        names = json.loads(text)
        
        # Match with DB to get IDs if possible, or return names for frontend to match
        # We need IDs for the frontend selection toggle
        matched_ids = []
        all_dests = db_session.query(Destination).all()
        
        for name in names:
            # Fuzzy or exact match
            match = next((d for d in all_dests if name.lower() in d.name.lower()), None)
            if match:
                matched_ids.append(match.id)
                
        # If matches are low, maybe just return random top rated as fallback mixed in?
        # For now, return what we found
        return jsonify({"recommendedIds": matched_ids, "aiNames": names})
        
    except Exception as e:
        print(f"Recommend Error: {e}")
        return jsonify({"error": str(e)}), 500

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

# New Smart Generation Route
from services.generation_service import generate_smart_destinations

@app.route('/generate-destinations', methods=['POST'])
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

@app.route('/chat', methods=['POST'])
def chat_agent():
    data = request.json
    user_msg = data.get('message', '').lower()
    
    # Simple Rule-Based Travel Agent
    response_text = "I'm not sure about that. Try asking for 'suggestions' or 'budget' advice!"

    if "hello" in user_msg or "hi" in user_msg:
        response_text = "Hello! I'm your AltairGO travel assistant. I can help you find destinations, plan budgets, or give travel tips."

    elif "suggest" in user_msg or "place" in user_msg or "destination" in user_msg:
        # Fetch 3 random top rated places
        dests = db_session.query(Destination).order_by(Destination.rating.desc()).limit(3).all()
        names = ", ".join([d.name for d in dests])
        response_text = f"I recommend checking out these top-rated places: {names}. They are fantastic this time of year!"

    elif "budget" in user_msg or "cost" in user_msg:
        response_text = "For a comfortable trip, I suggest budgeting around ₹3,000 - ₹5,000 per person per day, including stay and travel. Local street food can save you a lot!"

    elif "thank" in user_msg:
        response_text = "You're welcome! Let me know if you need help planning your itinerary."

    elif "weather" in user_msg:
        response_text = "I don't have real-time weather data yet, but generally, October to March is the best time to explore most of India."
    
    elif "track" in user_msg or "task" in user_msg:
        response_text = "To track your tasks, we recommend using the 'Checklist' feature in the Trip Planner. It helps you stay organized!"

    elif "itinerary" in user_msg:
        response_text = "You can generate a smart itinerary by selecting your destinations in the Trip Planner and clicking 'Generate AI Plan'."
        
    else:
        # Fallback to generic advice
        response_text = "That's interesting! I can mostly help with suggesting destinations or planning your trip structure. Try asking 'Where should I go?'"

    return jsonify({"response": response_text})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
