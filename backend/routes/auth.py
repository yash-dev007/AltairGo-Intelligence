from flask import Blueprint, request, jsonify
from database import db_session
from models import User
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    if db_session.query(User).filter_by(email=email).first():
        return jsonify({"error": "User already exists"}), 400

    hashed_pw = generate_password_hash(password)
    new_user = User(email=email, password_hash=hashed_pw, name=name)
    
    db_session.add(new_user)
    db_session.commit()

    return jsonify({"message": "User created successfully"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    user = db_session.query(User).filter_by(email=email).first()

    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid credentials"}), 401

    # Convert identity to string for Flask-JWT-Extended compatibility
    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        "token": access_token,
        "user": user.to_dict()
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = int(get_jwt_identity())  # Convert string back to int
    user = db_session.query(User).filter_by(id=user_id).first()
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user.to_dict()), 200
