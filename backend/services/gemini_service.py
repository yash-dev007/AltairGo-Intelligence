import os
import json
import requests
import re
from dotenv import load_dotenv
from services.schemas import DestinationDetail, SmartDestinationInsight, TripPlan, DestinationRecommendationList

# Configure Gemini Client
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    print("WARNING: GEMINI_API_KEY not found in .env")

GEMINI_TEMPERATURE = float(os.getenv("GEMINI_TEMPERATURE", "0.3"))

import time

# Prioritized list of models — verified available via ListModels on this API key
MODELS_TO_TRY = [
    'gemini-2.5-flash',        # Latest, highest quality
    'gemini-flash-latest',     # Alias that always points to latest stable flash
]


def _load_prompt_template(style: str, num_cities: int) -> str:
    """Load the appropriate prompt addendum based on style and trip type."""
    prompts_dir = os.path.join(os.path.dirname(__file__), '..', 'prompts')

    # Always load base template
    base_path = os.path.join(prompts_dir, 'base_template.txt')
    try:
        with open(base_path, 'r', encoding='utf-8') as f:
            base = f.read()
    except FileNotFoundError:
        base = ""  # Graceful fallback

    # Load style-specific addendum
    style_lower = (style or 'standard').lower()
    if style_lower == 'budget':
        style_file = 'budget_trip.txt'
    elif style_lower == 'luxury':
        style_file = 'luxury_trip.txt'
    else:
        style_file = None  # Standard has no extra rules

    style_addon = ""
    if style_file:
        style_path = os.path.join(prompts_dir, style_file)
        try:
            with open(style_path, 'r', encoding='utf-8') as f:
                style_addon = "\n\n" + f.read()
        except FileNotFoundError:
            pass

    # Load multi-city addendum if applicable
    multi_city_addon = ""
    if num_cities >= 3:
        mc_path = os.path.join(prompts_dir, 'multi_city.txt')
        try:
            with open(mc_path, 'r', encoding='utf-8') as f:
                multi_city_addon = "\n\n" + f.read()
        except FileNotFoundError:
            pass

    return base + style_addon + multi_city_addon


def _format_destination_data(selected_destinations: list) -> str:
    """Format destination DB records into a readable context block for the AI."""
    if not selected_destinations:
        return "No specific destinations pre-selected — suggest the best options based on user preferences."

    lines = []
    for i, d in enumerate(selected_destinations, 1):
        lines.append(f"Destination {i}: {d.get('name', 'Unknown')}")
        if d.get('location'):
            lines.append(f"  - Region: {d['location']}")
        if d.get('estimatedCostPerDay'):
            lines.append(f"  - Avg cost/day: ₹{d['estimatedCostPerDay']}")
        if d.get('crowdLevel'):
            lines.append(f"  - Crowd level: {d['crowdLevel']}")
        if d.get('bestTime'):
            lines.append(f"  - Best time to visit: {d['bestTime']}")
        if d.get('rating'):
            lines.append(f"  - Rating: {d['rating']}/5")
        if d.get('tag'):
            lines.append(f"  - Type: {d['tag']}")
        if d.get('highlights') and isinstance(d['highlights'], list):
            lines.append(f"  - Highlights: {', '.join(d['highlights'][:3])}")
        if d.get('desc'):
            lines.append(f"  - About: {d['desc']}")
        lines.append("")  # Blank line between destinations

    return "\n".join(lines)


def _extract_json_from_text(text_resp: str) -> str:
    """Helper to safely rip JSON out of markdown or conversational filler."""
    start_idx = text_resp.find('{')
    end_idx = text_resp.rfind('}')
    
    if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
        return text_resp[start_idx : end_idx + 1].strip()
        
    start_idx_arr = text_resp.find('[')
    end_idx_arr = text_resp.rfind(']')
    if start_idx_arr != -1 and end_idx_arr != -1 and end_idx_arr > start_idx_arr:
        return text_resp[start_idx_arr : end_idx_arr + 1].strip()
        
    return text_resp.strip()


def _generate_content_http(prompt: str, model_name: str, response_schema: dict = None) -> str:
    """
    Call Gemini API via HTTP. Includes temperature config, retry logic, and strict output typing via schema.
    """
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={API_KEY}"
    headers = {"Content-Type": "application/json"}
    
    generation_config = {
        "temperature": GEMINI_TEMPERATURE,
        "maxOutputTokens": 8192,
    }
    
    def _flatten_schema(schema, defs=None):
        if not isinstance(schema, dict):
            return schema
            
        if defs is None and "$defs" in schema:
            defs = schema.pop("$defs")
            
        result = {}
        for k, v in schema.items():
            # Skip unsupported OpenAPI schema keys for Gemini
            if k in ["title", "default", "description"]:
                continue
                
            if k == "$ref" and isinstance(v, str) and defs:
                ref_name = v.split("/")[-1]
                if ref_name in defs:
                    resolved = _flatten_schema(defs[ref_name], defs)
                    # Merge resolved fields directly into the current level
                    for rk, rv in resolved.items():
                        if rk not in ["title", "default", "description"]:
                            result[rk] = rv
                continue
                
            if isinstance(v, dict):
                result[k] = _flatten_schema(v, defs)
            elif isinstance(v, list):
                result[k] = [_flatten_schema(item, defs) for item in v]
            else:
                result[k] = v
                
        return result

    if response_schema:
        generation_config["responseMimeType"] = "application/json"
        try:
            # Gemini Schema constraints: no $defs, no references, no title/default
            cleaned = _flatten_schema(response_schema)
            generation_config["responseSchema"] = cleaned
        except Exception as e:
            print(f"Failed to clean schema: {e}")
            pass
    else:
        # Some calls might manually request JSON without a strict typed schema
        generation_config["responseMimeType"] = "application/json"

    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }],
        "generationConfig": generation_config
    }

    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=90)

            if response.status_code == 200:
                data = response.json()
                try:
                    return data['candidates'][0]['content']['parts'][0]['text']
                except (KeyError, IndexError):
                    print(f"GeminiHTTP: Unexpected format from {model_name}: {data}")
                    raise Exception("Invalid API Response Format")

            elif response.status_code == 429:
                # Rate limited — wait longer before retry, then give up so next model can try
                if attempt < max_retries - 1:
                    wait_time = (attempt + 1) * 5  # 5s, 10s
                    print(f"GeminiHTTP: 429 on {model_name}. Retrying in {wait_time}s...")
                    time.sleep(wait_time)
                    continue
                else:
                    raise Exception(f"429 Quota/Service Error after {max_retries} retries")

            elif response.status_code == 503:
                if attempt < max_retries - 1:
                    wait_time = (attempt + 1) * 3
                    print(f"GeminiHTTP: 503 on {model_name}. Retrying in {wait_time}s...")
                    time.sleep(wait_time)
                    continue
                else:
                    raise Exception(f"503 Service Unavailable after retries")

            elif response.status_code == 400:
                # responseMimeType not supported — retry without JSON mode
                if 'responseMimeType' in payload.get('generationConfig', {}):
                    print(f"GeminiHTTP: 400 on {model_name} — retrying without structured JSON mode...")
                    fallback_payload = dict(payload)
                    fallback_payload['generationConfig'] = {
                        k: v for k, v in payload['generationConfig'].items()
                        if k not in ('responseMimeType', 'responseSchema')
                    }
                    resp2 = requests.post(url, headers=headers, json=fallback_payload, timeout=90)
                    if resp2.status_code == 200:
                        return resp2.json()['candidates'][0]['content']['parts'][0]['text']
                raise Exception(f"HTTP 400: {response.text[:200]}")

            else:
                raise Exception(f"HTTP {response.status_code}: {response.text[:200]}")

        except Exception as e:
            if attempt < max_retries - 1 and ("429" in str(e) or "503" in str(e)):
                time.sleep(3)
                continue
            raise e


def generate_trip_options(preferences: dict, selected_destinations: list = []) -> dict:
    """
    Generates a single, high-quality trip itinerary based on user preferences
    and real destination data from the database.
    """
    origin = preferences.get('startCity', 'Mumbai')
    country = preferences.get('country', 'India')
    budget = preferences.get('budget', 50000)
    duration = preferences.get('duration', 5)
    style = preferences.get('style', 'Standard')
    interests = preferences.get('interests', [])

    # Travel date context
    date_type = preferences.get('dateType', 'anytime')
    travel_month = preferences.get('travelMonth', '')
    travel_start = preferences.get('travelStartDate', '')
    travel_end = preferences.get('travelEndDate', '')

    if date_type == 'fixed' and travel_start:
        date_context = f"Fixed dates: {travel_start[:10]} to {travel_end[:10] if travel_end else 'TBD'}"
    elif date_type == 'flexible' and travel_month:
        date_context = f"Flexible — preferred month: {travel_month}"
    else:
        date_context = "Flexible — anytime"

    # Format destination data for injection
    dest_data_text = _format_destination_data(selected_destinations)
    dest_names = [d.get('name', '') for d in selected_destinations]
    num_unique_cities = len(set(d.get('location', '') for d in selected_destinations)) if selected_destinations else 1

    # Load template (picks the right addendum based on style/multi-city)
    template = _load_prompt_template(style, num_unique_cities)

    # Fill in template placeholders or use a self-contained prompt if template missing
    if template:
        prompt = template
        prompt = prompt.replace("{DESTINATION_DATA}", dest_data_text)
        prompt = prompt.replace("{origin}", origin)
        prompt = prompt.replace("{country}", country)
        prompt = prompt.replace("{destinations}", ", ".join(dest_names) if dest_names else "Best options for this country")
        prompt = prompt.replace("{budget}", str(budget))
        prompt = prompt.replace("{days}", str(duration))
        prompt = prompt.replace("{style}", style)
        prompt = prompt.replace("{dates}", date_context)
        prompt = prompt.replace("{interests}", ", ".join(interests) if interests else "General sightseeing")
    else:
        # Fallback self-contained prompt if template files not found
        prompt = _build_fallback_prompt(
            origin, country, budget, duration, style, date_context,
            interests, dest_data_text, dest_names
        )

    # Pydantic Schema injection
    schema = TripPlan.model_json_schema()

    last_error = None

    for model_name in MODELS_TO_TRY:
        try:
            print(f"TripAI: Trying Model {model_name} (temp={GEMINI_TEMPERATURE})...")
            text_resp = _generate_content_http(prompt, model_name, response_schema=schema)
            text_resp = _extract_json_from_text(text_resp)

            data = TripPlan.model_validate_json(text_resp)
            print(f"TripAI: ✅ Success with {model_name}!")
            return data.model_dump()

        except Exception as e:
            print(f"TripAI: ❌ Failed {model_name}: {e}")
            last_error = e
            continue

    # All models failed
    print("TripAI: ALL MODELS FAILED.")
    return {
        "error": f"All AI models failed. Last error: {str(last_error)}",
        "options": []
    }


def _build_fallback_prompt(origin, country, budget, duration, style, date_context,
                           interests, dest_data_text, dest_names) -> str:
    """Fallback self-contained prompt if template files are missing."""
    dest_clause = (
        f"The user has selected these specific destinations: {', '.join(dest_names)}. You MUST include them."
        if dest_names
        else "Suggest the best destinations based on the user's preferences."
    )

    return f"""
You are an expert travel planner. Generate a single, detailed, realistic travel itinerary.

DESTINATION KNOWLEDGE:
{dest_data_text}

USER REQUIREMENTS:
- Starting from: {origin}
- Country: {country}
- Budget: ₹{budget} (STRICT — stay within ±5%)
- Duration: {duration} days
- Style: {style}
- Dates: {date_context}
- Interests: {', '.join(interests) if interests else 'General sightseeing'}

{dest_clause}

RULES:
1. Use ONLY real, specific place names. NEVER use generic names like "local market", "city center", "mall", "beach", "hotel", or "restaurant". Be explicit (e.g., "Colaba Causeway", "Marina Beach").
2. The user is starting their trip from {origin} to the destination. YOU MUST include the travel/transit details from {origin} to the destination on Day 1, and back to {origin} on the last day, as part of the itinerary.
3. Total cost must be within ₹{budget} ± 5%.
4. Max 4 major activities per day to keep the schedule realistic.
5. Include how_to_reach for every activity (mode + time + cost).
6. Group geographically nearby spots on the same day.
7. For {style} style: budget costs × 0.7, standard × 1.0, luxury × 1.5.
"""


def chat_with_data(user_message: str, context: dict) -> str:
    """Chat with the AI using database context."""
    system_instruction = f"""
You are AltairGO, an expert AI travel assistant.

CONTEXT from Database:
Top Destinations available: {context.get('top_destinations', 'None')}

YOUR CAPABILITIES:
1. Suggest spots based on the database or general knowledge.
2. Calculate rough budgets (Budget ~3k-5k INR/day/person for standard).
3. Plan travel routes.
4. Use images in your response when suggesting places.

IMAGE FORMAT:
To show an image, use markdown: ![Location Name](Location Name)
The frontend will automatically fetch a real photo for "Location Name".

TONE: Friendly, enthusiastic, and knowledgeable.

USER QUERY: {user_message}
"""

    for model_name in MODELS_TO_TRY:
        try:
            print(f"ChatAI: Attempting {model_name}...")
            # Chat doesn't need JSON mode — use plain generation
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={API_KEY}"
            payload = {
                "contents": [{"parts": [{"text": system_instruction}]}],
                "generationConfig": {
                    "temperature": 0.7,  # Chat can be more creative
                    "maxOutputTokens": 2048
                }
            }
            resp = requests.post(url, headers={"Content-Type": "application/json"}, json=payload, timeout=60)
            if resp.status_code == 200:
                text = resp.json()['candidates'][0]['content']['parts'][0]['text']
                print(f"ChatAI: Success with {model_name}")
                return text
        except Exception as e:
            print(f"ChatAI: Failed {model_name}: {e}")
            continue

    return "I'm having trouble connecting right now. Please try again in a moment."


def generate_destination_details(user_prompt: str) -> dict:
    """Generates detailed information for a specific destination based on user prompt."""
    prompt = f"""
You are a travel expert. Generate detailed travel information for: "{user_prompt}".
If vague (e.g. "beach"), pick a specific famous one.
"""
    # Pydantic schema for strict typing
    schema = DestinationDetail.model_json_schema()

    for model_name in MODELS_TO_TRY:
        try:
            text_resp = _generate_content_http(prompt, model_name, response_schema=schema)
            text_resp = _extract_json_from_text(text_resp)
            data = DestinationDetail.model_validate_json(text_resp)
            return data.model_dump()
        except Exception as e:
            print(f"DestAI: {model_name} failed: {e}")
            continue

    return {"error": "Failed to generate destination details."}

def generate_destination_recommendations(country_name: str, region_names: list, prefs: dict) -> list:
    """Uses Gemini to generate real, famous destinations based on preferences."""
    regions_str = ", ".join(region_names) if region_names else "Any region"
    budget = prefs.get('budget', 50000)
    style = prefs.get('style', 'Balanced')
    
    schema = {
        "type": "object",
        "properties": {
            "destinations": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "name": {"type": "string"},
                        "location": {"type": "string"},
                        "description": {"type": "string"},
                        "image": {"type": "string"},
                        "estimatedCostPerDay": {"type": "number"},
                        "rating": {"type": "number"},
                        "tag": {"type": "string"},
                        "crowdLevel": {"type": "string"},
                        "bestTime": {"type": "string"},
                        "highlights": {
                            "type": "array",
                            "items": {"type": "string"}
                        }
                    },
                    "required": ["name", "description"] # Less strict to prevent Pydantic errors
                }
            }
        },
        "required": ["destinations"]
    }
    
    prompt = f"""
You are a travel expert recommending excellent real-world places to visit.
The user is planning a trip to:
Country: {country_name}
Regions/States: {regions_str}
Budget: ₹{budget}
Style: {style}

Suggest exactly 20 REAL, famous, and verifiable specific destinations/spots (not just general cities, but specific attractions, parks, or iconic areas like "Taj Mahal, Agra" or "Calangute Beach, Goa").
DO NOT suggest generic places like "City Centre", "Shopping Mall", "Local Market", or "Main Beach". You MUST provide specific, real names.

OUTPUT INSTRUCTIONS:
Return ONLY a valid JSON object. 
Do NOT write "Here are 20 destinations:". Do NOT wrap the response in ```json ```.
Just output the raw JSON dictionary starting with {{ "destinations": [ ... ] }}.

Example format:
{{
  "destinations": [
    {{
      "name": "Taj Mahal",
      "location": "Agra, Uttar Pradesh",
      "description": "An iconic monument of love...",
      "tag": "Historical",
      "rating": 4.9,
      "estimatedCostPerDay": 2000
    }}
  ]
}}
"""

    for model_name in MODELS_TO_TRY:
        try:
            print(f"RecommendAI: Attempting {model_name}...")
            text_resp = _generate_content_http(prompt, model_name)
            text_resp = _extract_json_from_text(text_resp)
            
            # If Gemini returned a raw array, wrap it
            if text_resp.startswith('['):
                text_resp = '{ "destinations": ' + text_resp + ' }'
                
            data = DestinationRecommendationList.model_validate_json(text_resp)
            return [d.model_dump() for d in data.destinations]
        except Exception as e:
            print(f"RecommendAI {model_name} failed: {str(e)[:300]}")
            continue

    return []

def generate_smart_destination_details(destination_name: str) -> dict:
    """Generates specific AI insights for a destination to replace the static fallback."""
    prompt = f"""
Provide a rich travel overview for exactly this destination: "{destination_name}".
"""
    schema = SmartDestinationInsight.model_json_schema()

    for model_name in MODELS_TO_TRY:
        try:
            text_resp = _generate_content_http(prompt, model_name, response_schema=schema)
            text_resp = _extract_json_from_text(text_resp)
            data = SmartDestinationInsight.model_validate_json(text_resp)
            return data.model_dump()
        except Exception as e:
            continue
            
    # Fallback to static if AI fails
    return {
        "special": f"A wonderful destination known as {destination_name}.",
        "food": ["Local Delicacies", "Street Food", "Traditional Meals"],
        "hidden_gems": ["Local Markets", "Scenic Viewpoints"],
        "culture": "Locals are very welcoming and the heritage is preserved.",
        "best_time_pace": "Early mornings are best for sightseeing.",
        "best_for": "Travelers seeking authentic experiences."
    }
