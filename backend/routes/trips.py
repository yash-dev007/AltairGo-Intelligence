from flask import Blueprint, request, jsonify
from database import db_session
from models import Trip, Destination, AnalyticsEvent
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
import uuid
from datetime import datetime
from services.gemini_service import generate_trip_options
from services.image_service import get_image_for_destination
from validation import validate_itinerary

trips_bp = Blueprint('trips', __name__)


def _log_event(event_type: str, event_data: dict, user_id=None):
    """Helper — write an analytics event to the DB, fail silently."""
    try:
        event = AnalyticsEvent(
            event_type=event_type,
            event_data=event_data,
            user_id=user_id
        )
        db_session.add(event)
        db_session.commit()
    except Exception as e:
        print(f"Analytics log failed (non-critical): {e}")
        db_session.rollback()


def _get_optional_user_id():
    """Return user_id from JWT if present, else None."""
    try:
        verify_jwt_in_request(optional=True)
        identity = get_jwt_identity()
        return int(identity) if identity else None
    except Exception:
        return None


# ─────────────────────────────── Trip CRUD ───────────────────────────────────

@trips_bp.route('/api/user/trips', methods=['GET'])
@jwt_required()
def get_user_trips():
    try:
        user_id = int(get_jwt_identity())
        trips = db_session.query(Trip).filter_by(user_id=user_id).all()
        return jsonify([t.to_dict() for t in trips]), 200
    except ValueError:
        return jsonify({"error": "Invalid user ID in token"}), 400


@trips_bp.route('/api/save-trip', methods=['POST'])
@jwt_required()
def save_trip():
    user_id = int(get_jwt_identity())
    data = request.json

    travel_start = None
    travel_end = None
    if data.get('travelStartDate'):
        try:
            travel_start = datetime.fromisoformat(data['travelStartDate'].replace('Z', '+00:00'))
        except Exception:
            pass
    if data.get('travelEndDate'):
        try:
            travel_end = datetime.fromisoformat(data['travelEndDate'].replace('Z', '+00:00'))
        except Exception:
            pass

    new_trip = Trip(
        id=str(uuid.uuid4()),
        user_id=user_id,
        title=data.get('title', 'My Trip'),
        destination_country=data.get('country'),
        start_city=data.get('startCity'),
        budget=data.get('budget'),
        duration=data.get('duration'),
        travelers=data.get('travelers', 1),
        style=data.get('style'),
        date_type=data.get('dateType'),
        travel_start_date=travel_start,
        travel_end_date=travel_end,
        travel_month=data.get('travelMonth'),
        itinerary_json=data.get('itinerary'),
        total_cost=data.get('totalCost')
    )

    db_session.add(new_trip)
    db_session.commit()

    return jsonify({"message": "Trip saved", "tripId": new_trip.id}), 201


@trips_bp.route('/get-trip/<trip_id>', methods=['GET'])
def get_trip(trip_id):
    trip = db_session.query(Trip).filter_by(id=trip_id).first()
    if not trip:
        return jsonify({"error": "Trip not found"}), 404
    return jsonify(trip.to_dict()), 200


# ────────────────────── Itinerary Generation ─────────────────────────────────

@trips_bp.route('/generate-itinerary', methods=['POST'])
def generate_itinerary():
    print("AI Agent: Generating itinerary...")
    data = request.json
    selected_ids = data.get('selectedDestIds', [])
    user_preferences = data.get('preferences', {})
    user_id = _get_optional_user_id()

    # 1. Fetch selected destination records (for data injection)
    selected_dests = []
    if selected_ids:
        selected_dests_objs = db_session.query(Destination).filter(
            Destination.id.in_(selected_ids)
        ).all()
        selected_dests = [d.to_dict() for d in selected_dests_objs]

    # 2. Call Gemini Service
    ai_result = generate_trip_options(user_preferences, selected_dests)

    # 3. Check for hard errors
    if "error" in ai_result:
        print(f"AI Error: {ai_result['error']}")
        _log_event('ai_failed', {
            "error": ai_result['error'],
            "preferences": user_preferences,
            "selected_dest_count": len(selected_ids)
        }, user_id)
        return jsonify(ai_result), 500

    # 4. Validate & auto-correct the itinerary
    validation_result = validate_itinerary(ai_result, user_preferences)
    ai_result = validation_result['data']  # Use adjusted data

    validation_warnings = validation_result.get('warnings', [])
    validation_errors = validation_result.get('errors', [])

    if validation_errors:
        _log_event('validation_failed', {
            "errors": validation_errors,
            "warnings": validation_warnings,
            "preferences": user_preferences
        }, user_id)

    # Attach warnings to response so frontend can display them
    if validation_warnings:
        ai_result['validation_warnings'] = validation_warnings
    if validation_result.get('adjusted'):
        ai_result['budget_adjusted'] = True

    # 5. Enrich with real images
    print("Enriching itinerary with images...")
    if ai_result.get("image_keyword"):
        ai_result["image"] = get_image_for_destination(ai_result["image_keyword"], {})
    elif not ai_result.get("image"):
        ai_result["image"] = "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1"

    if "itinerary" in ai_result and isinstance(ai_result["itinerary"], list):
        for day in ai_result["itinerary"]:
            if isinstance(day, dict) and day.get("image_keyword"):
                day["image"] = get_image_for_destination(day["image_keyword"], {})

    # 6. Log success event
    _log_event('itinerary_generated', {
        "trip_title": ai_result.get('trip_title', 'Unknown'),
        "total_cost": ai_result.get('total_cost', 0),
        "budget": user_preferences.get('budget', 0),
        "duration": user_preferences.get('duration', 0),
        "style": user_preferences.get('style', 'Standard'),
        "country": user_preferences.get('country', ''),
        "validation_warnings_count": len(validation_warnings),
        "was_adjusted": validation_result.get('adjusted', False)
    }, user_id)

    return jsonify(ai_result)


# ─────────────────────────────── Feedback ────────────────────────────────────

@trips_bp.route('/api/feedback', methods=['POST'])
def submit_feedback():
    """
    Accepts user feedback about itinerary quality.
    Body: { trip_id, issue_type, description }
    Auth: Optional JWT
    """
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400

    issue_type = data.get('issue_type', 'general')
    description = data.get('description', '')
    trip_id = data.get('trip_id', None)
    user_id = _get_optional_user_id()

    if not description and not issue_type:
        return jsonify({"error": "Please provide an issue type or description"}), 400

    _log_event('user_feedback', {
        "trip_id": trip_id,
        "issue_type": issue_type,
        "description": description
    }, user_id)

    return jsonify({"message": "Thank you for your feedback! We use it to improve our AI."}), 201
