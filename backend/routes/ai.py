from flask import Blueprint, request, jsonify
from database import db_session
from models import Destination, State
import random
import uuid
from services.gemini_service import generate_destination_recommendations, generate_smart_destination_details
from services.image_service import get_image_for_destination

ai_bp = Blueprint('ai', __name__)

@ai_bp.route('/recommend-destinations', methods=['POST'])
def recommend_destinations():
    data = request.json or {}
    country_name = data.get('countryName', 'India')
    region_names = data.get('regionNames', [])
    prefs = data.get('prefs', {})

    try:
        ai_spots = generate_destination_recommendations(country_name, region_names, prefs)
        print(f"🔍 AI returned {len(ai_spots)} spots for {region_names}")
        cards = []
        for spot in ai_spots:
            name = spot.get("name", "Unknown Spot")
            location_str = f"{spot.get('location', country_name)}, {region_names[0] if region_names else country_name}"

            # ── Persist to DB (deduplicate by name) ──
            existing = db_session.query(Destination).filter_by(name=name).first()
            if existing:
                db_dest = existing
            else:
                img_url = get_image_for_destination(
                    name=name,
                    location_context={"city": spot.get('location', country_name), "country": country_name}
                )
                db_dest = Destination(
                    name=name,
                    desc=(spot.get("description") or "")[:190] or "AI-recommended destination.",
                    description=spot.get("description", "A beautiful destination waiting to be explored."),
                    image=img_url,
                    location=location_str,
                    estimated_cost_per_day=int(spot.get("estimated_cost_per_day", 3000)),
                    price_str=f"₹{int(spot.get('estimated_cost_per_day', 3000)):,}",
                    rating=float(spot.get("rating", 4.5)),
                    reviews_count_str=f"{random.randint(50, 1200)}",
                    best_time=spot.get("best_time", "Anytime"),
                    crowd_level=spot.get("crowd_level", "Moderate"),
                    tag=spot.get("type", "Attraction"),
                    highlights=spot.get("highlights", []),
                    vibe_tags=[spot.get("type", "Culture"), "AI Recommended"],
                )
                db_session.add(db_dest)
                db_session.flush()  # get the auto-incremented id before commit

            cards.append({
                "id": db_dest.id,  # real DB id — frontend can now route to /destinations/:id
                "name": name,
                "location": location_str,
                "state_id": region_names[0] if region_names else None,
                "tag": spot.get("type", "Attraction"),
                "desc": spot.get("description", "")[:190] or "AI-recommended destination.",
                "bestTime": spot.get("best_time", "Anytime"),
                "crowdLevel": spot.get("crowd_level", "Moderate"),
                "rating": float(spot.get("rating", 4.5)),
                "estimatedCostPerDay": int(spot.get("estimated_cost_per_day", 3000)),
                "highlights": spot.get("highlights", []),
                "image": db_dest.image,
                "image_keyword": spot.get("image_keyword", name),
                "isAiGenerated": True
            })

        # ── DB Fallback: If AI returned nothing, serve existing DB destinations ──
        if not cards and region_names:
            print(f"⚠️ AI returned 0 destinations — falling back to DB for regions: {region_names}")
            db_fallback = []
            for rn in region_names:
                state_obj = db_session.query(State).filter(State.name.ilike(f"%{rn}%")).first()
                if state_obj:
                    dests = db_session.query(Destination).filter_by(state_id=state_obj.id).limit(10).all()
                    db_fallback.extend(dests)
                else:
                    # Try matching by location field
                    dests = db_session.query(Destination).filter(
                        Destination.location.ilike(f"%{rn}%")
                    ).limit(10).all()
                    db_fallback.extend(dests)

            for d in db_fallback:
                dd = d.to_dict()
                cards.append({
                    "id": dd.get("id"),
                    "name": dd.get("name", "Unknown"),
                    "location": dd.get("location", country_name),
                    "state_id": dd.get("state_id"),
                    "tag": dd.get("tag", "Attraction"),
                    "desc": dd.get("desc", "A beautiful destination."),
                    "bestTime": dd.get("best_time", "Anytime"),
                    "crowdLevel": dd.get("crowd_level", "Moderate"),
                    "rating": float(dd.get("rating", 4.5)),
                    "estimatedCostPerDay": int(dd.get("estimated_cost_per_day", 3000)),
                    "highlights": dd.get("highlights", []),
                    "image": dd.get("image"),
                    "image_keyword": dd.get("name", "travel"),
                    "isAiGenerated": False
                })

        db_session.commit()
        return jsonify({"destinations": cards})

    except Exception as e:
        db_session.rollback()
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
    data = request.json or {}
    dest_name = data.get('destinationName', '')
    if not dest_name:
        return jsonify({"error": "No destination provided"}), 400
        
    try:
        details = generate_smart_destination_details(dest_name)
        return jsonify(details)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

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
