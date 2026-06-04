from flask import Blueprint, jsonify, request
from config.db import get_db

movies_bp = Blueprint('movies', __name__)

@movies_bp.route('/movies', methods=['GET'])
def get_movies():
    db = get_db()
    movies_col = db['movies']
    
    query_filter = {}
    
    title = request.args.get('title')
    q = request.args.get('q', '')
    if title:
        query_filter['title'] = {'$regex': title, '$options': 'i'}
    elif q:
        query_filter['title'] = {'$regex': q, '$options': 'i'}
        
    category = request.args.get('category')
    if category:
        query_filter['category'] = {'$regex': f"^{category}$", '$options': 'i'}
        
    year = request.args.get('year')
    if year:
        try:
            query_filter['year'] = int(year)
        except ValueError:
            query_filter['year'] = year
            
    sort_by = request.args.get('sort')
    
    cursor = movies_col.find(query_filter)
    
    if sort_by == 'trending':
        cursor = cursor.sort('views', -1).limit(10)
        
    movies = list(cursor)
    
    # Convert ObjectIds if needed, but we might store IDs as integers since old data had integer IDs.
    # We will just return them as is, but ensure _id is string or int properly.
    for m in movies:
        m['_id'] = str(m['_id'])
        # Also map 'id' for frontend compatibility if needed
        if 'id' not in m:
            m['id'] = m['_id']
            
    return jsonify(movies), 200

@movies_bp.route('/movies/<movie_id>', methods=['GET'])
def get_movie(movie_id):
    db = get_db()
    movies_col = db['movies']
    
    # Try integer ID first (from old JSON), then string
    movie = None
    try:
        movie = movies_col.find_one({'_id': int(movie_id)})
    except ValueError:
        pass
        
    if not movie:
        movie = movies_col.find_one({'_id': movie_id})
        
    # Also check if it's stored with field 'id'
    if not movie:
        try:
            movie = movies_col.find_one({'id': int(movie_id)})
        except ValueError:
            movie = movies_col.find_one({'id': movie_id})
            
    if movie:
        # increment view count
        movies_col.update_one({'_id': movie['_id']}, {'$inc': {'views': 1}})
        movie['_id'] = str(movie['_id'])
        return jsonify(movie), 200
        
    return jsonify({'error': 'Movie not found'}), 404
