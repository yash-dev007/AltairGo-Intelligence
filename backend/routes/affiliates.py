import os
from flask import Blueprint, request, jsonify, redirect
from services.affiliate_service import url_builder, tracker, revenue_calc
from database import db_session
from models import BookingClick
from sqlalchemy import func

affiliates_bp = Blueprint('affiliates', __name__)

@affiliates_bp.route('/api/book/<link_type>', methods=['GET'])
def handle_booking_redirect(link_type):
    """
    Handles tracking an affiliate link click and redirecting the user.
    Example: /api/book/flight?destination=Goa&partner=makemytrip
    """
    destination = request.args.get('destination', 'Travel')
    partner = request.args.get('partner', 'makemytrip')
    
    # 1. Track the click in the database
    # In a real app, user_id would come from JWT middleware
    user_id = request.args.get('user_id') 
    
    # Log the click and get a unique tracking ID
    tracking_id = tracker.track_click(
        user_id=user_id,
        link_type=link_type,
        destination=destination,
        partner=partner,
        request=request
    )
    
    # 2. Build the final affiliate URL with UTMs and the tracking ID
    try:
        final_url = url_builder.build_url(
            partner_name=partner,
            link_type=link_type,
            destination=destination,
            tracking_id=tracking_id
        )
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
        
    # 3. Redirect the user
    return redirect(final_url, code=302)


@affiliates_bp.route('/api/admin/affiliate-stats', methods=['GET'])
def get_affiliate_stats():
    """
    Returns aggregated stats for the affiliate dashboard.
    """
    try:
        # Get total clicks
        total_clicks = db_session.query(func.count(BookingClick.id)).scalar()
        
        # Get clicks by category
        clicks_by_type = db_session.query(
            BookingClick.link_type, func.count(BookingClick.id)
        ).group_by(BookingClick.link_type).all()
        
        # Get total estimated revenue
        total_revenue = db_session.query(func.sum(BookingClick.estimated_revenue)).scalar() or 0.0
        
        # Format for frontend
        stats = {
            "total_clicks": total_clicks,
            "estimated_revenue": round(total_revenue, 2),
            "breakdown": {row[0]: row[1] for row in clicks_by_type}
        }
        
        return jsonify(stats)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
