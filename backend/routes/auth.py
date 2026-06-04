import os
import uuid
from functools import wraps
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from config.db import get_db

auth_bp = Blueprint('auth', __name__)
JWT_SECRET = os.environ.get("JWT_SECRET", "super-secret-netflix-key")

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(" ")[1]
        
        if not token:
            return jsonify({'error': 'Token is missing!'}), 401
            
        try:
            data = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            current_user = get_db()['users'].find_one({'_id': data['user_id']})
            if not current_user:
                return jsonify({'error': 'Invalid token!'}), 401
        except Exception as e:
            return jsonify({'error': 'Token is invalid or expired!'}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if current_user.get('role') != 'admin':
            return jsonify({'error': 'Admin privilege required!'}), 403
        return f(current_user, *args, **kwargs)
    return decorated

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    if not data or not data.get('email') or not data.get('password') or not data.get('name'):
        return jsonify({'error': 'Missing required fields'}), 400

    db = get_db()
    users = db['users']

    if users.find_one({'email': data['email']}):
        return jsonify({'error': 'Email already exists'}), 400

    hashed_password = generate_password_hash(data['password'])
    
    new_user = {
        '_id': str(uuid.uuid4()),
        'name': data['name'],
        'email': data['email'],
        'password': hashed_password,
        'role': 'user',
        'avatar': 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png',
        'createdAt': datetime.datetime.utcnow().isoformat()
    }
    
    users.insert_one(new_user)
    
    return jsonify({
        'message': 'Registration successful'
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing required fields'}), 400

    db = get_db()
    users = db['users']

    user = users.find_one({'email': data['email']})
    
    if user and check_password_hash(user['password'], data['password']):
        token = jwt.encode({
            'user_id': user['_id'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, JWT_SECRET, algorithm="HS256")
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': {
                '_id': user['_id'],
                'name': user['name'],
                'email': user['email'],
                'role': user.get('role', 'user'),
                'avatar': user.get('avatar', 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png'),
                'createdAt': user.get('createdAt', datetime.datetime.utcnow().isoformat())
            }
        }), 200
        
    return jsonify({'error': 'Invalid email or password'}), 401
