from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from database import db_session, init_db
from models import Country
from dotenv import load_dotenv
import os
from datetime import timedelta

# Load env vars
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path)

app = Flask(__name__)

# Enable CORS
CORS(app, resources={r"/*": {"origins": "*"}})

# JWT Config
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev-secret-change-in-production')
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=7)
jwt = JWTManager(app)

# Register Blueprints
from routes.auth import auth_bp
from routes.trips import trips_bp
from routes.ai import ai_bp
from routes.destinations import destinations_bp
from routes.content import content_bp
from routes.admin import admin_bp
from routes.affiliates import affiliates_bp
from routes.subscribe import subscribe_bp

app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(trips_bp) # No prefix to keep existing /api/save-trip etc
app.register_blueprint(ai_bp)    # No prefix for /recommend-destinations etc
app.register_blueprint(destinations_bp) # No prefix for /countries etc
app.register_blueprint(content_bp) # No prefix for /blogs etc
app.register_blueprint(admin_bp) # No prefix for /api/admin keys
app.register_blueprint(affiliates_bp) # No prefix for /affiliates etc
app.register_blueprint(subscribe_bp) # Newsletter subscription

# Database Teardown
@app.teardown_appcontext
def shutdown_session(exception=None):
    db_session.remove()

# Startup Hook: Seeding
with app.app_context():
    init_db()
    if db_session.query(Country).count() == 0:
        print("⚡ DB Empty! Running initial seed (Migrate V1)...")
        from migrate_v1_init import migrate
        try:
            migrate()
            print("✅ Seeding Complete.")
        except Exception as e:
            print(f"❌ Seeding Failed: {e}")

# Catch-All Route for SPA
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    from flask import send_from_directory, jsonify
    DIST_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'dist')
    
    if path != "" and os.path.exists(os.path.join(DIST_DIR, path)):
        return send_from_directory(DIST_DIR, path)
    
    index_path = os.path.join(DIST_DIR, 'index.html')
    if os.path.exists(index_path):
        return send_from_directory(DIST_DIR, 'index.html')
    
    return jsonify({"error": "Not Found (Backend - no dist build found)"}), 404

if __name__ == '__main__':
    app.run(debug=True, port=5000)
