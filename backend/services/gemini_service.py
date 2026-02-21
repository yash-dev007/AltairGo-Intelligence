import os
import json
import requests
import re
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini Client
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    print("⚠️ WARNING: GEMINI_API_KEY not found in .env")

GEMINI_TEMPERATURE = float(os.getenv("GEMINI_TEMPERATURE", "0.3"))

import time

# Prioritized list of models — verified available via ListModels on this API key
MODELS_TO_TRY = [
    'gemini-2.0-flash-lite',   # Fastest, try first
    'gemini-2.0-flash',        # More capable
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


def _generate_content_http(prompt: str, model_name: str) -> str:
    """
    Call Gemini API via HTTP. Includes temperature config and retry logic.
    """
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={API_KEY}"
    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }],
        "generationConfig": {
            "temperature": GEMINI_TEMPERATURE,
            "maxOutputTokens": 8192,
            "responseMimeType": "application/json"
        }
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
                    print(f"GeminiHTTP: 400 on {model_name} — retrying without JSON mode...")
                    fallback_payload = dict(payload)
                    fallback_payload['generationConfig'] = {
                        k: v for k, v in payload['generationConfig'].items()
                        if k != 'responseMimeType'
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

    last_error = None

    for model_name in MODELS_TO_TRY:
        try:
            print(f"TripAI: Trying Model {model_name} (temp={GEMINI_TEMPERATURE})...")
            text_resp = _generate_content_http(prompt, model_name)

            # Strip possible markdown fences
            clean_text = re.sub(r'^```json\s*', '', text_resp.strip())
            clean_text = re.sub(r'\s*```$', '', clean_text.strip())

            try:
                data = json.loads(clean_text)
                print(f"TripAI: ✅ Success with {model_name}!")
                return data
            except json.JSONDecodeError as je:
                print(f"TripAI: JSON Decode Error on {model_name}: {je}")
                # Try to extract JSON from response if wrapped in extra text
                json_match = re.search(r'\{.*\}', clean_text, re.DOTALL)
                if json_match:
                    try:
                        data = json.loads(json_match.group())
                        print(f"TripAI: ✅ Extracted JSON from {model_name}!")
                        return data
                    except json.JSONDecodeError:
                        pass
                continue

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
1. Use ONLY real, specific place names. Never "local market" or "city center".
2. Total cost must be within ₹{budget} ± 5%. Show a cost_breakdown.
3. Max 4 major activities per day.
4. Include how_to_reach for every activity (mode + time + cost).
5. Group geographically nearby spots on the same day.
6. For {style} style: budget costs × 0.7, standard × 1.0, luxury × 1.5.

OUTPUT: Respond with ONLY valid JSON matching this schema:
{{
  "trip_title": "Creative specific name",
  "total_cost": {int(budget * 0.9)},
  "cost_breakdown": {{"transport": 0, "accommodation": 0, "food": 0, "activities": 0, "miscellaneous": 0}},
  "budget_status": "within_budget",
  "smart_insights": ["Insight 1", "Insight 2"],
  "itinerary": [
    {{
      "day": 1,
      "date": null,
      "location": "City Name",
      "theme": "Day Theme",
      "activities": [
        {{
          "time": "Morning",
          "time_range": "9:00 AM - 12:00 PM",
          "activity": "Specific Place Name",
          "description": "What to do",
          "cost": 500,
          "duration": "3 hours",
          "how_to_reach": "Uber - ₹300, 25 min",
          "tips": "Practical tip",
          "booking_required": false,
          "crowd_level": "medium"
        }}
      ],
      "accommodation": {{
        "name": "Hotel Name",
        "type": "Budget/Standard/Luxury",
        "cost_per_night": 2500,
        "location": "Central area",
        "why_this": "Reason",
        "booking_tip": "Booking advice"
      }},
      "day_total": 5000,
      "transport_within_city": 500,
      "notes": "Day notes"
    }}
  ],
  "travel_between_cities": [],
  "packing_tips": ["Tip 1"],
  "important_tips": ["Tip 1"],
  "money_saving_hacks": ["Hack 1"],
  "image_keyword": "Main landmark name"
}}
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
                print(f"ChatAI: ✅ Success with {model_name}")
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

Respond with ONLY valid JSON:
{{
    "name": "Official Name",
    "location": "City, Country",
    "type": "Category (Beach/Temple/etc)",
    "description": "Engaging description",
    "best_time": "Best months to visit",
    "crowd_level": "Low/Moderate/High",
    "rating": 4.8,
    "estimated_cost_per_day": 5000,
    "highlights": ["Highlight 1", "Highlight 2"],
    "image_keyword": "Best search term for image",
    "tags": ["Tag1", "Tag2"]
}}
"""

    for model_name in MODELS_TO_TRY:
        try:
            text_resp = _generate_content_http(prompt, model_name)
            clean_text = re.sub(r'^```json\s*', '', text_resp.strip())
            clean_text = re.sub(r'\s*```$', '', clean_text.strip())
            return json.loads(clean_text)
        except Exception as e:
            print(f"DestAI: {model_name} failed: {e}")
            continue

    return {"error": "Failed to generate destination details."}
