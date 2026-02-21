from flask import Blueprint, request, jsonify
from database import db_session
from models import Destination, State, Country, User, Trip, DestinationRequest, AnalyticsEvent
from data.blogs import blogs_data
from data.packages import packages_data
import os
import hashlib
import time
import random
from datetime import datetime, timedelta
from collections import defaultdict
from functools import wraps

admin_bp = Blueprint('admin', __name__)

# ── Admin Auth ──
ADMIN_ACCESS_KEY = os.getenv('ADMIN_ACCESS_KEY', 'altair-admin-2026')
_admin_tokens = set()

def _generate_admin_token():
    raw = f"admin-{ADMIN_ACCESS_KEY}-{time.time()}"
    return hashlib.sha256(raw.encode()).hexdigest()

def _require_admin(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        token = auth_header.replace('Bearer ', '') if auth_header.startswith('Bearer ') else ''
        if token not in _admin_tokens:
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return decorated

@admin_bp.route('/api/admin/verify-key', methods=['POST'])
def admin_verify_key():
    data = request.json or {}
    key = data.get('accessKey', '')
    if key == ADMIN_ACCESS_KEY:
        token = _generate_admin_token()
        _admin_tokens.add(token)
        return jsonify({"token": token, "message": "Access granted"}), 200
    return jsonify({"error": "Invalid access key"}), 401

@admin_bp.route('/api/admin/stats', methods=['GET'])
@_require_admin
def admin_stats():
    stats = {
        "destinations": db_session.query(Destination).count(),
        "regions": db_session.query(State).count(),
        "countries": db_session.query(Country).count(),
        "users": db_session.query(User).count(),
        "trips": db_session.query(Trip).count(),
        "blogs": len(blogs_data),
        "packages": len(packages_data),
    }
    return jsonify(stats), 200

@admin_bp.route('/api/admin/destinations', methods=['GET'])
@_require_admin
def admin_destinations():
    search = request.args.get('search', '').strip()
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 20))

    query = db_session.query(Destination)
    if search:
        query = query.filter(Destination.name.ilike(f'%{search}%'))
    
    total = query.count()
    items = query.order_by(Destination.id.desc()).offset((page - 1) * per_page).limit(per_page).all()

    return jsonify({
        "items": [d.to_dict() for d in items],
        "total": total,
        "page": page,
        "pages": (total + per_page - 1) // per_page
    }), 200

@admin_bp.route('/api/admin/destinations/<int:dest_id>', methods=['PUT'])
@_require_admin
def admin_update_destination(dest_id):
    dest = db_session.query(Destination).filter_by(id=dest_id).first()
    if not dest:
        return jsonify({"error": "Destination not found"}), 404
    
    data = request.json or {}
    for field in ['name', 'desc', 'description', 'image', 'location', 'tag', 'best_time', 'crowd_level']:
        if field in data:
            setattr(dest, field, data[field])
    if 'price' in data:
        dest.price_str = data['price']
    if 'rating' in data:
        dest.rating = float(data['rating'])
    if 'highlights' in data:
        dest.highlights = data['highlights']
    
    db_session.commit()
    return jsonify({"message": "Updated", "destination": dest.to_dict()}), 200

@admin_bp.route('/api/admin/destinations/<int:dest_id>', methods=['DELETE'])
@_require_admin
def admin_delete_destination(dest_id):
    dest = db_session.query(Destination).filter_by(id=dest_id).first()
    if not dest:
        return jsonify({"error": "Destination not found"}), 404
    db_session.delete(dest)
    db_session.commit()
    return jsonify({"message": "Deleted"}), 200

@admin_bp.route('/api/admin/blogs', methods=['GET'])
@_require_admin
def admin_blogs():
    return jsonify(blogs_data), 200

@admin_bp.route('/api/admin/packages', methods=['GET'])
@_require_admin
def admin_packages():
    return jsonify(packages_data), 200

@admin_bp.route('/api/admin/users', methods=['GET'])
@_require_admin
def admin_users():
    users = db_session.query(User).all()
    result = []
    for u in users:
        trip_count = db_session.query(Trip).filter_by(user_id=u.id).count()
        result.append({
            **u.to_dict(),
            "tripCount": trip_count,
            "created_at": u.created_at.isoformat() if u.created_at else None
        })
    return jsonify(result), 200

@admin_bp.route('/api/admin/trips', methods=['GET'])
@_require_admin
def admin_trips():
    trips = db_session.query(Trip).order_by(Trip.created_at.desc()).limit(50).all()
    return jsonify([t.to_dict() for t in trips]), 200

@admin_bp.route('/api/admin/blogs/<int:blog_id>', methods=['PUT'])
@_require_admin
def admin_update_blog(blog_id):
    blog = next((b for b in blogs_data if b['id'] == blog_id), None)
    if not blog:
        return jsonify({"error": "Blog not found"}), 404
    data = request.json or {}
    for field in ['title', 'category', 'date', 'readTime', 'image', 'excerpt', 'content']:
        if field in data:
            blog[field] = data[field]
    return jsonify({"message": "Updated", "blog": blog}), 200

@admin_bp.route('/api/admin/packages/<int:pkg_id>', methods=['PUT'])
@_require_admin
def admin_update_package(pkg_id):
    pkg = next((p for p in packages_data if p['id'] == pkg_id), None)
    if not pkg:
        return jsonify({"error": "Package not found"}), 404
    data = request.json or {}
    for field in ['title', 'description', 'image', 'price', 'duration', 'difficulty']:
        if field in data:
            pkg[field] = data[field]
    if 'inclusions' in data:
        pkg['inclusions'] = data['inclusions']
    return jsonify({"message": "Updated", "package": pkg}), 200

@admin_bp.route('/api/admin/destination-requests', methods=['GET'])
@_require_admin
def admin_get_requests():
    reqs = db_session.query(DestinationRequest).filter_by(status='pending').order_by(DestinationRequest.created_at.desc()).all()
    return jsonify([r.to_dict() for r in reqs]), 200

@admin_bp.route('/api/admin/destination-requests/<int:req_id>/approve', methods=['POST'])
@_require_admin
def admin_approve_request(req_id):
    req = db_session.query(DestinationRequest).get(req_id)
    if not req:
        return jsonify({"error": "Request not found"}), 404
    
    try:
        new_dest = Destination(
            name=req.name,
            state_id=req.state_id if req.state_id else 1,
            desc=req.description[:100] if req.description else "User suggested",
            description=req.description or "User suggested destination.",
            price_str=f"₹{req.cost}" if req.cost else "Free",
            estimated_cost_per_day=req.cost or 2000,
            tag=req.tag or "User Pick",
            rating=4.5,
            reviews_count_str="New",
            image="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800"
        )
        
        req.status = 'approved'
        db_session.add(new_dest)
        db_session.commit()
        return jsonify({"message": "Approved", "destination": new_dest.to_dict()}), 200
    except Exception as e:
        db_session.rollback()
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/api/admin/destination-requests/<int:req_id>/reject', methods=['POST'])
@_require_admin
def admin_reject_request(req_id):
    req = db_session.query(DestinationRequest).get(req_id)
    if not req:
        return jsonify({"error": "Request not found"}), 404
    
    req.status = 'rejected'
    db_session.commit()
    return jsonify({"message": "Rejected"}), 200

# ── Real Request Tracker ──
_request_counts = defaultdict(int)
_active_sessions = {}

@admin_bp.before_app_request
def _track_visitor():
    path = request.path
    if path.startswith('/api/admin/visitors') or path.startswith('/assets'):
        return
    now = datetime.now()
    hour_key = now.strftime('%Y-%m-%d-%H')
    _request_counts[hour_key] += 1
    ip = request.remote_addr or 'unknown'
    _active_sessions[ip] = now

@admin_bp.route('/api/admin/visitors', methods=['GET'])
@_require_admin
def admin_visitors():
    now = datetime.now()
    cutoff = now - timedelta(minutes=5)
    current_online = sum(1 for ts in _active_sessions.values() if ts > cutoff)

    hours = []
    for i in range(24, 0, -1):
        t = now - timedelta(hours=i)
        key = t.strftime('%Y-%m-%d-%H')
        hours.append({"time": t.strftime('%H:%M'), "visitors": _request_counts.get(key, 0)})
    
    current_key = now.strftime('%Y-%m-%d-%H')
    hours.append({"time": now.strftime('%H:%M'), "visitors": _request_counts.get(current_key, 0)})

    total_today = sum(
        count for key, count in _request_counts.items()
        if key.startswith(now.strftime('%Y-%m-%d'))
    )

    return jsonify({
        "current": max(current_online, 1),
        "totalToday": total_today,
        "hourly": hours
    }), 200

# ── Analytics Events Log ──

@admin_bp.route('/api/admin/analytics/events', methods=['GET'])
@_require_admin
def admin_analytics_events():
    """Return the most recent analytics events for admin review."""
    event_type = request.args.get('type')  # Optional filter
    limit = min(int(request.args.get('limit', 50)), 200)

    query = db_session.query(AnalyticsEvent).order_by(AnalyticsEvent.created_at.desc())
    if event_type:
        query = query.filter(AnalyticsEvent.event_type == event_type)

    events = query.limit(limit).all()
    return jsonify([e.to_dict() for e in events]), 200


@admin_bp.route('/api/admin/analytics/summary', methods=['GET'])
@_require_admin
def admin_analytics_summary():
    """Return event counts grouped by type."""
    from sqlalchemy import func as sql_func
    rows = db_session.query(
        AnalyticsEvent.event_type,
        sql_func.count(AnalyticsEvent.id).label('count')
    ).group_by(AnalyticsEvent.event_type).all()

    return jsonify({row[0]: row[1] for row in rows}), 200
