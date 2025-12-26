from flask import Flask, request, jsonify
from flask_cors import CORS
from data import destinations_data

app = Flask(__name__)
# Enable CORS for all routes, allowing requests from any origin
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/generate-itinerary', methods=['POST'])
def generate_itinerary():
    data = request.json
    selected_ids = data.get('selectedDestIds', [])
    
    selected_dests = [d for d in destinations_data if d['id'] in selected_ids]
    current_day = 1
    plan = []

    for dest in selected_dests:
        # Heuristic: limit days to 3 or description length
        days_to_spend = min(3, len(dest['itinerary']))
        
        for i in range(days_to_spend):
            activity = dest['itinerary'][i] if i < len(dest['itinerary']) else "Explore local culture"
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
        dest = next((d for d in destinations_data if d['id'] == dest_id), None)
        if dest:
            total_cost += dest.get('estimatedCostPerDay', 3000)
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
        dest = next((d for d in destinations_data if d['id'] == item.get('destId')), None)
        if dest:
            selected_destinations.append(dest)
            
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

if __name__ == '__main__':
    app.run(debug=True, port=5000)
