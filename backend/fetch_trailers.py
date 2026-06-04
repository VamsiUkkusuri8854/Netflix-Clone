import os
import re
import urllib.request
import urllib.parse
from pymongo import MongoClient

def search_youtube_trailer(title):
    query = urllib.parse.quote(f"{title} official trailer")
    url = f"https://www.youtube.com/results?search_query={query}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as response:
            html = response.read().decode('utf-8')
            # Look for the videoId in the ytInitialData JSON object
            match = re.search(r'"videoId":"([a-zA-Z0-9_-]{11})"', html)
            if match:
                return match.group(1)
    except Exception as e:
        print(f"Failed to fetch trailer for {title}: {e}")
    return None

from dotenv import load_dotenv

def update_database():
    load_dotenv()
    uri = os.environ.get("MONGO_URI", "mongodb://localhost:27017/")
    client = MongoClient(uri)
    # The URI already contains the DB name if provided, but let's be explicit
    db = client.get_database() if client.get_database().name else client['netflix_clone']
    movies_col = db['movies']
    
    movies = list(movies_col.find({}))
    print(f"Found {len(movies)} movies to update...")
    
    updated = 0
    for movie in movies:
        title = movie.get('title')
        print(f"Searching trailer for {title}...")
        video_id = search_youtube_trailer(title)
        if video_id:
            # We store just the ID in videoUrl, or the full embed URL
            # The frontend will use the ID for the IFrame API
            movies_col.update_one({'_id': movie['_id']}, {'$set': {'videoUrl': video_id}})
            print(f" -> Found: {video_id}")
            updated += 1
        else:
            # Fallback to some generic Indian movie trailer or keep it
            print(f" -> No trailer found, using fallback.")
            movies_col.update_one({'_id': movie['_id']}, {'$set': {'videoUrl': 'hXzvdSyIgwc'}}) # Fallback
            
    print(f"Successfully updated {updated} movies with YouTube trailers!")

if __name__ == "__main__":
    update_database()
