import os
import sys
from dotenv import load_dotenv

sys.path.append('d:/AltairLabs/backend')
load_dotenv('d:/AltairLabs/backend/.env')

from services.gemini_service import MODELS_TO_TRY, _generate_content_http, _extract_json_from_text
from services.schemas import TripPlan
import json

schema = TripPlan.model_json_schema()
prompt = "Create a 1 day trip to Jaipur starting from Mumbai."

try:
    print("Calling Gemini...")
    text_resp = _generate_content_http(prompt, MODELS_TO_TRY[0], schema)
    print("\n--- RAW TEXT ---")
    print(text_resp)
    
    text_resp = _extract_json_from_text(text_resp)
    print("\n--- EXTRACTED JSON ---")
    print(text_resp)
    
    data = TripPlan.model_validate_json(text_resp)
    print("\n--- PYDANTIC VALIDATED ---")
    print(data.model_dump_json(indent=2))
except Exception as e:
    print(f"Error: {e}")
