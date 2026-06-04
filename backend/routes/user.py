from flask import Blueprint, jsonify, request
from config.db import get_db
import uuid
from routes.auth import token_required

user_bp = Blueprint('user', __name__)

@user_bp.route('/profile/<user_id>', methods=['GET', 'PUT'])
@token_required
def profile(current_user, user_id):
    db = get_db()
    users = db['users']
    
    if request.method == 'GET':
        user = users.find_one({'_id': user_id})
        if user:
            return jsonify({
                '_id': user['_id'],
                'name': user['name'],
                'email': user['email'],
                'role': user.get('role', 'user'),
                'avatar': user.get('avatar', 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png'),
                'createdAt': user.get('createdAt', '')
            }), 200
        return jsonify({'error': 'User not found'}), 404
        
    elif request.method == 'PUT':
        data = request.json
        update_data = {}
        if 'name' in data:
            update_data['name'] = data['name']
        if 'avatar' in data:
            update_data['avatar'] = data['avatar']
            
        if update_data:
            users.update_one({'_id': user_id}, {'$set': update_data})
            
        user = users.find_one({'_id': user_id})
        return jsonify({
            'message': 'Profile updated',
            'user': {
                '_id': user['_id'],
                'name': user['name'],
                'email': user['email'],
                'role': user.get('role', 'user'),
                'avatar': user.get('avatar', 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png'),
                'createdAt': user.get('createdAt', '')
            }
        }), 200


@user_bp.route('/watchlist', methods=['GET', 'POST'])
@token_required
def watchlist(current_user):
    db = get_db()
    watchlist_col = db['watchlist']
    
    if request.method == 'GET':
        user_id = request.args.get('userId')
        if not user_id:
            return jsonify({'error': 'userId required'}), 400
            
        items = list(watchlist_col.find({'userId': user_id}))
        for item in items:
            item['_id'] = str(item['_id'])
        return jsonify(items), 200
        
    elif request.method == 'POST':
        data = request.json
        user_id = data.get('userId')
        movie_id = data.get('movieId')
        
        if not user_id or not movie_id:
            return jsonify({'error': 'userId and movieId required'}), 400
            
        # Check if already exists
        existing = watchlist_col.find_one({'userId': user_id, 'movieId': movie_id})
        if existing:
            return jsonify({'message': 'Already in watchlist'}), 200
            
        new_item = {
            '_id': str(uuid.uuid4()),
            'userId': user_id,
            'movieId': movie_id
        }
        watchlist_col.insert_one(new_item)
        return jsonify(new_item), 201

@user_bp.route('/watchlist/<item_id>', methods=['DELETE'])
@token_required
def remove_watchlist(current_user, item_id):
    db = get_db()
    watchlist_col = db['watchlist']
    # Delete by the watchlist item ID, or if frontend sends movieId, we could delete by userId and movieId
    # Let's support deleting by movieId and userId from query params just in case
    user_id = request.args.get('userId')
    if user_id:
        result = watchlist_col.delete_one({'userId': user_id, 'movieId': item_id})
    else:
        result = watchlist_col.delete_one({'_id': item_id})
        
    if result.deleted_count > 0:
        return jsonify({'message': 'Removed from watchlist'}), 200
    return jsonify({'error': 'Item not found'}), 404

@user_bp.route('/history', methods=['GET', 'POST'])
@token_required
def history(current_user):
    db = get_db()
    history_col = db['watch_history']
    
    if request.method == 'GET':
        user_id = request.args.get('userId')
        if not user_id:
            return jsonify({'error': 'userId required'}), 400
            
        items = list(history_col.find({'userId': user_id}).sort('lastWatched', -1).limit(10))
        for item in items:
            item['_id'] = str(item['_id'])
        return jsonify(items), 200
        
    elif request.method == 'POST':
        data = request.json
        user_id = data.get('userId')
        movie_id = data.get('movieId')
        progress = data.get('progress', 0)
        
        import time
        last_watched = int(time.time())
        
        if not user_id or not movie_id:
            return jsonify({'error': 'userId and movieId required'}), 400
            
        # Update or insert
        result = history_col.update_one(
            {'userId': user_id, 'movieId': movie_id},
            {'$set': {'progress': progress, 'lastWatched': last_watched}},
            upsert=True
        )
        
        return jsonify({'message': 'Progress saved'}), 200
