from flask import Blueprint, request, jsonify
from database import db_session
from models import Destination, State
import random

ai_bp = Blueprint('ai', __name__)

@ai_bp.route('/recommend-destinations', methods=['POST'])
def recommend_destinations():
    # Simple Rule-Based Recommendation (Random Shuffle for Variety in MVP)
    data = request.json
    try:
        # Get all destinations or filter by country if needed
        # For now, just return 4 random IDs to simulate "AI Selection"
        all_dests = db_session.query(Destination).all()
        if not all_dests:
            return jsonify({"recommendedIds": []})
            
        random.shuffle(all_dests)
        recommended = all_dests[:4]
        
        return jsonify({
            "recommendedIds": [d.id for d in recommended],
            "aiNames": [d.name for d in recommended]
        })
    except Exception as e:
        print(f"Recommend Error: {e}")
        return jsonify({"error": str(e)}), 500

@ai_bp.route('/recommend-regions', methods=['POST'])
def recommend_regions():
    data = request.json or {}
    country_id = data.get('countryId')

    try:
        query = db_session.query(State)
        if country_id:
            query = query.filter_by(country_id=country_id)
        regions = query.all()

        if not regions:
            return jsonify([])

        random.shuffle(regions)
        selected = regions[:3]  # Return up to 3

        return jsonify([
            {
                "name": r.name,
                "id": r.id,
                "reason": "Highly recommended for its scenery and culture."
            } for r in selected
        ])
    except Exception as e:
        print(f"Region Recommend Error: {e}")
        return jsonify({"error": str(e)}), 500

@ai_bp.route('/destination-details-ai', methods=['POST'])
def destination_details_ai():
    # Static Fallback for Details (No AI)
    return jsonify({
        "special": "A wonderful destination with rich history and culture.",
        "food": ["Local Delicacies", "Street Food", "Traditional Meals"],
        "hidden_gems": ["Old Town Market", "Sunset Viewpoint"],
        "culture": "Locals are very welcoming and the heritage is preserved.",
        "best_time_pace": "Early mornings are best for sightseeing.",
        "best_for": "Travelers seeking authentic experiences."
    })

@ai_bp.route('/calculate-budget', methods=['POST'])
def calculate_budget():
    data = request.json
    itinerary = data.get('itinerary', [])
    
    # 1. Prefer explicit costs (from AI activities)
    if itinerary and isinstance(itinerary[0], dict) and 'cost' in itinerary[0]:
         total_cost = sum(float(item.get('cost', 0) or 0) for item in itinerary)
         return jsonify({"totalCost": total_cost})

    # 2. Fallback to Destination-based Per-Day estimation
    total_cost = 0
    calculated_days = set()
    
    for item in itinerary:
        # Avoid double counting days if flattened (unlikely in this branch but good safety)
        day = item.get('day')
        if day and day in calculated_days:
             continue
        if day: calculated_days.add(day)

        dest_id = item.get('destId')
        if dest_id:
            dest = db_session.query(Destination).get(dest_id)
            if dest:
                total_cost += dest.estimated_cost_per_day or 3000
            else:
                total_cost += 3000
        else:
            # If no dest_id (e.g. purely AI item), add flat
            total_cost += 3000
            
    return jsonify({"totalCost": total_cost})

@ai_bp.route('/smart-insight', methods=['POST'])
def smart_insight():
    data = request.json
    itinerary = data.get('itinerary', [])
    
    # Get full destination objects for the itinerary items
    # Filter valid destinations
    selected_destinations = []
    for item in itinerary:
        dest_id = item.get('destId')
        if dest_id:
            dest = db_session.query(Destination).get(dest_id)
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

@ai_bp.route('/chat', methods=['POST'])
def chat_agent():
    data = request.json
    user_msg = data.get('message', '')
    
    # 1. Gather Context from Database
    # Fetch top 5 destinations to give AI some "knowledge"
    top_dests = db_session.query(Destination).order_by(Destination.rating.desc()).limit(5).all()
    dest_context = ", ".join([f"{d.name} ({d.location}, ₹{d.estimated_cost_per_day}/day)" for d in top_dests])
    
    context = {
        "top_destinations": dest_context,
        "database_status": "Connected"
    }

    # 2. Call Gemini Service
    try:
        from services.gemini_service import chat_with_data
        response_text = chat_with_data(user_msg, context)
        return jsonify({"reply": response_text}) # Corrected return format to JSON
    except Exception as e:
        print(f"Chat Error: {e}")
        return jsonify({"reply": "I'm having trouble connecting to my brain right now. Please try again in a moment."})

@ai_bp.route('/generate-destination', methods=['POST'])
def generate_destination():
    data = request.json
    prompt = data.get('prompt')
    if not prompt: return jsonify({"error": "Prompt required"}), 400
    
    # 1. Gemini
    from services.gemini_service import generate_destination_details
    dest_data = generate_destination_details(prompt)
    
    if "error" in dest_data: 
        return jsonify(dest_data), 500
    
    # 2. Pixabay (Image)
    from services.image_service import get_image_for_destination
    query = dest_data.get('image_keyword', dest_data.get('name'))
    
    image_url = get_image_for_destination(query, {})
    dest_data['image'] = image_url
    
    return jsonify(dest_data)
