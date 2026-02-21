
import sys
import os
sys.path.append(os.getcwd())

print("Testing imports...")
try:
    from backend.services.ai_destination_service import generate_destinations_for_region
    print("✅ Successfully imported ai_destination_service")
except Exception as e:
    print(f"❌ Failed to import: {e}")
    sys.exit(1)
