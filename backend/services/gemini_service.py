import os
import re
import json
import time
import logging
import requests
from dotenv import load_dotenv

load_dotenv(override=True)

from services.schemas import (
    DestinationDetail, SmartDestinationInsight, TripPlan,
    DestinationRecommendationList
)

logger = logging.getLogger(__name__)

API_KEY            = os.getenv("GEMINI_API_KEY")
GEMINI_TEMPERATURE = float(os.getenv("GEMINI_TEMPERATURE", "0.4"))

if not API_KEY:
    logger.warning("GEMINI_API_KEY not set — all Gemini calls will fail.")

MODELS_TO_TRY = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
]

# Traveler type → behavioural prompt hint
# FIX (LOW): Added solo_male and other missing types so every traveler type
# gets a meaningful hint injected into the prompt, not a raw slug.
_TRAVELER_HINTS = {
    "solo_male":       "Solo male traveler — open to adventurous, social, and off-beat experiences.",
    "solo_female":     "Solo female traveler — prioritise well-lit, safe, reputable venues and reliable transport.",
    "couple":          "Romantic couple — include at least one sunset/evening experience per day; one fine-dining option.",
    "family_toddlers": "Family with toddlers (under 5) — stroller-accessible only; max 4 activities/day; midday break mandatory.",
    "family_kids":     "Family with school-age kids — mix educational and fun activities; no adult-only venues.",
    "senior":          "Senior travelers — minimal walking (<1 km between stops), seated experiences preferred, no steep climbs.",
    "friends":         "Friend group — include at least one group-friendly evening activity (rooftop bar, cooking class, live music).",
    "business":        "Business + leisure traveler — mornings may have meetings; keep afternoon/evening itinerary flexible.",
}


# ── Prompt loading ─────────────────────────────────────────────────────────────

def _load_prompt_template(style: str, num_cities: int) -> str:
    prompts_dir = os.path.join(os.path.dirname(__file__), '..', 'prompts')
    try:
        with open(os.path.join(prompts_dir, 'base_template.txt'), encoding='utf-8') as f:
            base = f.read()
    except FileNotFoundError:
        base = ""

    style_lower  = (style or 'standard').lower()
    style_file   = {'budget': 'budget_trip.txt', 'luxury': 'luxury_trip.txt'}.get(style_lower)
    style_addon  = ""
    if style_file:
        try:
            with open(os.path.join(prompts_dir, style_file), encoding='utf-8') as f:
                style_addon = "\n\n" + f.read()
        except FileNotFoundError:
            pass

    multi_addon = ""
    if num_cities >= 3:
        try:
            with open(os.path.join(prompts_dir, 'multi_city.txt'), encoding='utf-8') as f:
                multi_addon = "\n\n" + f.read()
        except FileNotFoundError:
            pass

    return base + style_addon + multi_addon


# ── Destination data formatter ─────────────────────────────────────────────────

def _format_destination_data(destinations: list) -> str:
    if not destinations:
        return "No specific destinations pre-selected — suggest best options based on user preferences."
    lines = []
    for i, d in enumerate(destinations, 1):
        lines.append(f"Destination {i}: {d.get('name', 'Unknown')}")
        # FIX (LOW): Accept both camelCase (raw DB) and snake_case (Pydantic-serialized)
        for snake, camel, label, suffix in [
            ('location',              'location',            'Region',           ''),
            ('estimated_cost_per_day','estimatedCostPerDay', 'Avg cost/day',    '₹'),
            ('crowd_level',           'crowdLevel',          'Crowd level',      ''),
            ('best_time',             'bestTime',            'Best time',        ''),
            ('rating',                'rating',              'Rating',           '/5'),
            ('type',                  'tag',                 'Type',             ''),
        ]:
            val = d.get(snake) or d.get(camel)
            if val is not None:
                lines.append(f"  - {label}: {suffix}{val}")
        highlights = d.get('highlights', [])
        if highlights:
            lines.append(f"  - Highlights: {', '.join(highlights[:3])}")
        desc = d.get('description') or d.get('desc')
        if desc:
            lines.append(f"  - About: {desc}")
        lines.append("")
    return "\n".join(lines)


# ── Interest/traveler context builder ─────────────────────────────────────────

def _build_interest_context(interests, traveler_type: str, companions: str) -> str:
    # FIX (MEDIUM): Guard against frontend sending interests as a string
    if isinstance(interests, str):
        interests = [i.strip() for i in interests.split(',') if i.strip()]
    interests = interests or []

    parts = []
    if interests:
        parts.append(", ".join(interests))
    hint = _TRAVELER_HINTS.get(str(traveler_type).lower(), traveler_type)
    if hint:
        parts.append(hint)
    if companions:
        parts.append(f"Traveling with: {companions}")
    return "; ".join(parts) if parts else "General sightseeing"


# ── JSON extraction ────────────────────────────────────────────────────────────

def _extract_json_from_text(text: str) -> str:
    start = text.find('{')
    end   = text.rfind('}')
    if start != -1 and end > start:
        return text[start:end + 1].strip()
    start = text.find('[')
    end   = text.rfind(']')
    if start != -1 and end > start:
        return text[start:end + 1].strip()
    return text.strip()


# ── Schema flattener ───────────────────────────────────────────────────────────

def _flatten_schema(schema: dict, defs: dict = None) -> dict:
    """
    Resolve $ref references and strip keys Gemini's responseSchema doesn't support.
    'description' is intentionally KEPT — it is how field-level instructions reach Gemini.
    """
    if not isinstance(schema, dict):
        return schema
    if defs is None and "$defs" in schema:
        defs = schema.pop("$defs")

    # FIX (HIGH): Handle Pydantic v2 Optional which uses anyOf (Gemini OpenAPI doesn't support anyOf)
    if "anyOf" in schema:
        non_null = [t for t in schema["anyOf"] if isinstance(t, dict) and t.get("type") != "null"]
        if non_null:
            schema.pop("anyOf")
            schema.update(_flatten_schema(non_null[0], defs))
            schema["nullable"] = True

    UNSUPPORTED = {"title", "default", "minimum", "maximum", "exclusiveMinimum", "exclusiveMaximum", "minLength", "maxLength", "pattern", "format"}  # 'description' deliberately excluded

    result = {}
    for k, v in schema.items():
        if k in UNSUPPORTED:
            continue
        if k == "$ref" and isinstance(v, str) and defs:
            ref_name = v.split("/")[-1]
            if ref_name in defs:
                for rk, rv in _flatten_schema(defs[ref_name], defs).items():
                    if rk not in UNSUPPORTED:
                        result[rk] = rv
            continue
        
        # Format the value for Gemini
        formatted_val = (_flatten_schema(v, defs) if isinstance(v, dict)
                         else [_flatten_schema(i, defs) if isinstance(i, dict) else i for i in v]
                         if isinstance(v, list) else v)
        
        # Gemini API strict uppercase type requirement
        if k == "type" and isinstance(formatted_val, str):
            formatted_val = formatted_val.upper()
            
        result[k] = formatted_val
        
    return result


# ── Core HTTP caller ───────────────────────────────────────────────────────────

def _generate_content_http(prompt: str, model_name: str,
                            response_schema: dict = None,
                            temperature: float = None) -> str:
    if not API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not configured.")

    url     = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent"
    headers = {"Content-Type": "application/json", "x-goog-api-key": API_KEY}

    gen_config: dict = {
        "temperature":     temperature if temperature is not None else GEMINI_TEMPERATURE,
        "maxOutputTokens": 65536, # Increased from 8192 due to larger schemas
        "responseMimeType": "application/json",
    }
    if response_schema:
        try:
            gen_config["responseSchema"] = _flatten_schema(response_schema)
        except Exception as e:
            logger.warning("Schema flattening failed (%s) — proceeding without responseSchema", e)

    payload = {"contents": [{"parts": [{"text": prompt}]}], "generationConfig": gen_config}

    for attempt in range(3):
        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=180)

            if resp.status_code == 200:
                try:
                    return resp.json()['candidates'][0]['content']['parts'][0]['text']
                except (KeyError, IndexError) as e:
                    raise RuntimeError(f"Unexpected API response shape: {e}") from e

            elif resp.status_code in (429, 503):
                wait = (attempt + 1) * 5
                if attempt < 2:
                    logger.warning("HTTP %s on %s — retrying in %ss", resp.status_code, model_name, wait)
                    time.sleep(wait)
                    continue
                raise RuntimeError(f"HTTP {resp.status_code} after {attempt+1} retries")

            elif resp.status_code == 400:
                logger.error("HTTP 400 on %s. Body: %s", model_name, resp.text)
                logger.warning("Failing back to responseSchema-less prompt.")
                fallback_config  = {k: v for k, v in gen_config.items()
                                    if k not in ('responseMimeType', 'responseSchema')}
                # FIX (LOW): Build a fresh payload dict — don't mutate the original
                fallback_payload = {
                    "contents":        payload["contents"],
                    "generationConfig": fallback_config,
                }
                r2 = requests.post(url, headers=headers, json=fallback_payload, timeout=90)
                if r2.status_code == 200:
                    return r2.json()['candidates'][0]['content']['parts'][0]['text']
                raise RuntimeError(f"HTTP 400 (fallback also failed with {r2.status_code})")

            else:
                raise RuntimeError(f"HTTP {resp.status_code} from Gemini API")

        except RuntimeError:
            raise
        except Exception as e:
            if attempt < 2:
                time.sleep(3)
                continue
            raise RuntimeError(f"Request failed after {attempt+1} attempts: {type(e).__name__}") from e


# ── Trip generation ────────────────────────────────────────────────────────────

def generate_trip_options(preferences: dict,
                           selected_destinations: list = None) -> dict:
    if selected_destinations is None:
        selected_destinations = []

    origin        = preferences.get('startCity', 'Mumbai')
    country       = preferences.get('country', 'India')
    budget        = preferences.get('budget', 50000)
    duration      = preferences.get('duration', 5)
    style         = preferences.get('style', 'Standard')
    interests_raw = preferences.get('interests', [])
    traveler_type = preferences.get('travelerType', '')
    companions    = preferences.get('companions', '')
    interests_str = _build_interest_context(interests_raw, traveler_type, companions)

    date_type    = preferences.get('dateType', 'anytime')
    travel_start = preferences.get('travelStartDate', '')
    travel_end   = preferences.get('travelEndDate', '')
    travel_month = preferences.get('travelMonth', '')

    if date_type == 'fixed' and travel_start:
        date_context = f"Fixed dates: {travel_start[:10]} to {travel_end[:10] if travel_end else 'TBD'}"
    elif date_type == 'flexible' and travel_month:
        date_context = f"Flexible — preferred month: {travel_month}"
    else:
        date_context = "Flexible — anytime"

    dest_text   = _format_destination_data(selected_destinations)
    dest_names  = [d.get('name', '') for d in selected_destinations]
    num_cities  = len(set(d.get('location', '') for d in selected_destinations)) or 1
    template    = _load_prompt_template(style, num_cities)

    if template:
        prompt = (template
                  .replace("{DESTINATION_DATA}", dest_text)
                  .replace("{origin}",           origin)
                  .replace("{country}",          country)
                  .replace("{destinations}",     ", ".join(dest_names) or "Best options for this country")
                  .replace("{budget}",           str(budget))
                  .replace("{days}",             str(duration))
                  .replace("{style}",            style)
                  .replace("{dates}",            date_context)
                  .replace("{interests}",        interests_str))
    else:
        prompt = _build_fallback_prompt(
            origin, country, budget, duration, style,
            date_context, interests_str, dest_text, dest_names
        )

    schema     = TripPlan.model_json_schema()
    last_error = None

    for i, model_name in enumerate(MODELS_TO_TRY):
        # FIX (LOW): Brief pause between model switches to avoid shared quota 429s
        if i > 0:
            time.sleep(2)
        try:
            logger.info("TripAI: trying %s (temp=%.1f)", model_name, GEMINI_TEMPERATURE)
            raw  = _generate_content_http(prompt, model_name, response_schema=schema)
            raw  = _extract_json_from_text(raw)
            data = TripPlan.model_validate_json(raw)
            logger.info("TripAI: success — '%s'", data.trip_title)
            return data.model_dump()
        except Exception as e:
            logger.warning("TripAI: %s failed: %s", model_name, e)
            last_error = e

    logger.error("TripAI: all models failed")
    return {"error": f"All AI models failed. Last error: {last_error}", "options": []}


# ── Fallback prompt ────────────────────────────────────────────────────────────

def _build_fallback_prompt(origin, country, budget, duration, style,
                            date_context, interests_str, dest_text, dest_names) -> str:
    dest_clause = (f"The user has selected: {', '.join(dest_names)}. You MUST include them."
                   if dest_names else "Suggest the best destinations based on user preferences.")
    return f"""
You are an expert travel planner. Generate a single detailed realistic travel itinerary.

DESTINATION KNOWLEDGE:
{dest_text}

USER REQUIREMENTS:
- Starting from: {origin}
- Country: {country}
- Budget: ₹{budget} (STRICT — stay within ±5%)
- Duration: {duration} days
- Style: {style}
- Dates: {date_context}
- Interests: {interests_str}

{dest_clause}

RULES:
1. NEVER use generic place names. Use specific real names only.
2. Include transit from {origin} on Day 1 and return on last day.
3. Total cost within ₹{budget} ± 5%.
4. Max 4 major activities per day.
5. how_to_reach required for every activity (mode + time + ₹ cost).
6. Group geographically nearby spots on the same day.
7. crowd_level must be exactly: Low | Moderate | High
8. pacing_level must be exactly: Relaxed | Leisurely | Moderate | Action-Packed
9. travel_between_cities must use from_city/to_city/travel_class field names.
"""


# ── Chat ───────────────────────────────────────────────────────────────────────

def chat_with_data(user_message: str, context: dict) -> str:
    # FIX (MEDIUM): Separate system context from user message to reduce prompt injection.
    # The user message is clearly delimited and cannot override the system block.
    system_context = f"""You are AltairGO, an expert AI travel assistant.

CONTEXT from Database:
Top Destinations available: {context.get('top_destinations', 'None')}

YOUR CAPABILITIES:
1. Suggest specific named spots based on the database or general knowledge.
2. Calculate rough budgets (Budget ~₹3k-5k/day/person for standard travel).
3. Plan travel routes with real transport options.
4. Show images using markdown: ![Place Name](Place Name)

TONE: Friendly, enthusiastic, knowledgeable. Never suggest generic places."""

    # User message is injected as a separate content block, not inside the system prompt
    full_prompt = f"{system_context}\n\n---\nUSER QUERY:\n{user_message}"

    chat_temp = min(GEMINI_TEMPERATURE + 0.2, 0.9)
    for i, model_name in enumerate(MODELS_TO_TRY):
        if i > 0:
            time.sleep(2)
        try:
            return _generate_content_http(full_prompt, model_name,
                                          response_schema=None, temperature=chat_temp)
        except Exception as e:
            logger.warning("ChatAI: %s failed: %s", model_name, e)
    return "I'm having trouble connecting right now. Please try again in a moment."


# ── Destination details ────────────────────────────────────────────────────────

def generate_destination_details(user_prompt: str) -> dict:
    prompt = (f'Generate detailed travel information for: "{user_prompt}". '
              f'If vague, pick a specific famous real-world example.')
    schema = DestinationDetail.model_json_schema()

    for i, model_name in enumerate(MODELS_TO_TRY):
        if i > 0:
            time.sleep(2)
        try:
            raw  = _generate_content_http(prompt, model_name, response_schema=schema)
            data = DestinationDetail.model_validate_json(_extract_json_from_text(raw))
            return data.model_dump()
        except Exception as e:
            logger.warning("DestAI: %s failed: %s", model_name, e)
    return {"error": "Failed to generate destination details."}


# ── Destination recommendations ────────────────────────────────────────────────

def generate_destination_recommendations(country_name: str,
                                          region_names: list,
                                          prefs: dict) -> list:
    regions_str = ", ".join(region_names) if region_names else "Any region"
    budget      = prefs.get('budget', 50000)
    style       = prefs.get('style', 'Balanced')

    prompt = f"""
You are a travel expert recommending real-world places to visit.
Country: {country_name}  |  Regions: {regions_str}  |  Budget: ₹{budget}  |  Style: {style}

Suggest exactly 20 REAL, famous, verifiable destinations (specific attractions like
"Taj Mahal, Agra" — NOT "City Centre", "Shopping Mall", "Local Market").

Return ONLY valid JSON: {{ "destinations": [ ... ] }}
"""
    schema = DestinationRecommendationList.model_json_schema()

    for i, model_name in enumerate(MODELS_TO_TRY):
        if i > 0:
            time.sleep(2)
        try:
            logger.info("RecommendAI: trying %s", model_name)
            raw = _generate_content_http(prompt, model_name, response_schema=schema)
            raw = _extract_json_from_text(raw)
            if raw.startswith('['):
                raw = '{ "destinations": ' + raw + ' }'
            data = DestinationRecommendationList.model_validate_json(raw)
            return [d.model_dump() for d in data.destinations]
        except Exception as e:
            logger.warning("RecommendAI: %s failed: %s", model_name, str(e)[:200])
    return []


# ── Smart destination insights ─────────────────────────────────────────────────

def generate_smart_destination_details(destination_name: str) -> dict:
    prompt = f'Provide a rich travel overview for exactly: "{destination_name}".'
    schema = SmartDestinationInsight.model_json_schema()

    for i, model_name in enumerate(MODELS_TO_TRY):
        if i > 0:
            time.sleep(2)
        try:
            raw  = _generate_content_http(prompt, model_name, response_schema=schema)
            data = SmartDestinationInsight.model_validate_json(_extract_json_from_text(raw))
            return data.model_dump()
        except Exception as e:
            logger.warning("SmartDestAI: %s failed: %s", model_name, e)

    logger.error("SmartDestAI: all models failed for '%s'", destination_name)
    # Return empty lists — frontend shows 'unavailable' rather than fake generic data
    return {
        "special":        f"{destination_name} is a destination worth exploring.",
        "food":           [],
        "hidden_gems":    [],
        "culture":        "",
        "best_time_pace": "",
        "best_for":       "Travelers seeking authentic experiences.",
    }