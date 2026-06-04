import os
from pymongo import MongoClient

def get_db():
    uri = os.environ.get("MONGO_URI", "mongodb://localhost:27017/")
    client = MongoClient(uri)
    db = client['netflix_clone']
    return db
