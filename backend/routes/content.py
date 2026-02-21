from flask import Blueprint, jsonify
from data.blogs import blogs_data
from data.packages import packages_data
from data.features import features_data

content_bp = Blueprint('content', __name__)

@content_bp.route('/packages', methods=['GET'])
def get_packages():
    return jsonify(packages_data)

@content_bp.route('/packages/<int:package_id>', methods=['GET'])
def get_package_detail(package_id):
    package = next((p for p in packages_data if p['id'] == package_id), None)
    if package:
        return jsonify(package)
    return jsonify({"error": "Package not found"}), 404

@content_bp.route('/blogs', methods=['GET'])
def get_blogs():
    return jsonify(blogs_data)

@content_bp.route('/blogs/<int:blog_id>', methods=['GET'])
def get_blog_detail(blog_id):
    blog = next((b for b in blogs_data if b['id'] == blog_id), None)
    if blog:
        return jsonify(blog)
    return jsonify({"error": "Blog not found"}), 404

@content_bp.route('/features', methods=['GET'])
def get_features():
    return jsonify(features_data)
