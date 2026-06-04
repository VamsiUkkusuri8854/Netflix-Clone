from flask import Blueprint, jsonify, request
from config.db import get_db
from routes.auth import token_required, admin_required
import uuid

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/analytics', methods=['GET'])
@token_required
@admin_required
def get_analytics(current_user):
    db = get_db()
    
    total_users = db['users'].count_documents({})
    total_movies = db['movies'].count_documents({})
    total_watchlists = db['watchlist'].count_documents({})
    
    # Calculate total views
    pipeline = [{"$group": {"_id": None, "total_views": {"$sum": "$views"}}}]
    result = list(db['movies'].aggregate(pipeline))
    total_views = result[0]['total_views'] if result else 0
    
    return jsonify({
        'totalUsers': total_users,
        'totalMovies': total_movies,
        'totalWatchlists': total_watchlists,
        'totalViews': total_views
    }), 200

@admin_bp.route('/movies', methods=['POST'])
@token_required
@admin_required
def add_movie(current_user):
    data = request.json
    db = get_db()
    movies_col = db['movies']
    
    new_movie = {
        '_id': str(uuid.uuid4()),
        'title': data.get('title'),
        'category': data.get('category'),
        'description': data.get('description'),
        'poster': data.get('poster'),
        'banner': data.get('banner'),
        'videoUrl': data.get('videoUrl'),
        'year': data.get('year'),
        'rating': data.get('rating'),
        'duration': data.get('duration'),
        'views': 0
    }
    
    movies_col.insert_one(new_movie)
    return jsonify({'message': 'Movie added successfully', 'movie': new_movie}), 201

@admin_bp.route('/movies/<movie_id>', methods=['PUT'])
@token_required
@admin_required
def edit_movie(current_user, movie_id):
    data = request.json
    db = get_db()
    movies_col = db['movies']
    
    update_data = {k: v for k, v in data.items() if k != '_id'}
    
    result = movies_col.update_one({'_id': movie_id}, {'$set': update_data})
    
    if result.matched_count:
        return jsonify({'message': 'Movie updated successfully'}), 200
    return jsonify({'error': 'Movie not found'}), 404

@admin_bp.route('/movies/<movie_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_movie(current_user, movie_id):
    db = get_db()
    movies_col = db['movies']
    
    result = movies_col.delete_one({'_id': movie_id})
    if result.deleted_count:
        return jsonify({'message': 'Movie deleted successfully'}), 200
    return jsonify({'error': 'Movie not found'}), 404
