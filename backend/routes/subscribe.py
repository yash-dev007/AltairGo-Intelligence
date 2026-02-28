from flask import Blueprint, request, jsonify
from database import db_session
from models import Subscriber
import re

subscribe_bp = Blueprint('subscribe', __name__)

@subscribe_bp.route('/api/subscribe', methods=['POST'])
def subscribe():
    data = request.get_json()
    email = data.get('email', '').strip().lower() if data else ''

    # Validate email
    if not email or not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
        return jsonify({"error": "Please enter a valid email address."}), 400

    # Check for existing subscriber
    existing = db_session.query(Subscriber).filter_by(email=email).first()
    if existing:
        if existing.is_active:
            return jsonify({"message": "You're already subscribed! ✨"}), 200
        else:
            # Re-activate
            existing.is_active = True
            db_session.commit()
            return jsonify({"message": "Welcome back! You've been re-subscribed. 🎉"}), 200

    try:
        subscriber = Subscriber(email=email)
        db_session.add(subscriber)
        db_session.commit()
        return jsonify({"message": "Successfully subscribed! Welcome aboard. 🌍"}), 201
    except Exception as e:
        db_session.rollback()
        return jsonify({"error": "Something went wrong. Please try again."}), 500
