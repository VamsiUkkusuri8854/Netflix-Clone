import json
import os
from pymongo import MongoClient
from werkzeug.security import generate_password_hash
import uuid
from dotenv import load_dotenv

def seed_database():
    load_dotenv()
    uri = os.environ.get("MONGO_URI", "mongodb://localhost:27017/")
    client = MongoClient(uri)
    db = client['netflix_clone']
    
    # Wipe old movies first
    db['movies'].delete_many({})
    
    # Load and insert new movies
    data_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'data', 'movies.json')
    try:
        with open(data_path, 'r', encoding='utf-8') as f:
            movies_data = json.load(f)
            
        if movies_data:
            for m in movies_data:
                if 'id' in m:
                    m['_id'] = str(m.pop('id'))
                if 'videoUrl' not in m:
                    m['videoUrl'] = 'https://www.w3schools.com/html/mov_bbb.mp4'
                m['views'] = 0
                
            result = db['movies'].insert_many(movies_data)
            print(f"Successfully seeded {len(result.inserted_ids)} Indian movies into database!")
        else:
            print("movies.json is empty")
    except Exception as e:
        print(f"Failed to seed movies: {e}")
            
    users_col = db['users']
    if not users_col.find_one({'email': 'admin@netflix.com'}):
        admin_user = {
            '_id': str(uuid.uuid4()),
            'name': 'Admin User',
            'email': 'admin@netflix.com',
            'password': generate_password_hash('admin123'),
            'role': 'admin'
        }
        users_col.insert_one(admin_user)
        print("Created default admin user: admin@netflix.com / admin123")



if __name__ == '__main__':
    seed_database()
