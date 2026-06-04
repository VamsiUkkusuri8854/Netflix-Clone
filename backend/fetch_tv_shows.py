import os
import re
import uuid
import urllib.request
import urllib.parse
from pymongo import MongoClient
from dotenv import load_dotenv

tv_shows_data = [
    ("The Family Man", "Trending in India"),
    ("Mirzapur", "Trending in India"),
    ("Farzi", "Trending in India"),
    ("Sacred Games", "Trending in India"),
    ("Scam 1992", "Trending in India"),
    ("Asur", "Thriller Shows"),
    ("Pataal Lok", "Thriller Shows"),
    ("Delhi Crime", "Thriller Shows"),
    ("Kota Factory", "Comedy Shows"),
    ("Panchayat", "Comedy Shows"),
    ("Gullak", "Comedy Shows"),
    ("Rocket Boys", "Recently Added"),
    ("Made in Heaven", "Recently Added"),
    ("Suzhal: The Vortex", "South Indian Thrillers"),
    ("Breathe", "Thriller Shows")
]

def search_youtube_trailer(title):
    query = urllib.parse.quote(f"{title} official trailer")
    url = f"https://www.youtube.com/results?search_query={query}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as response:
            html = response.read().decode('utf-8')
            match = re.search(r'"videoId":"([a-zA-Z0-9_-]{11})"', html)
            if match:
                return match.group(1)
    except:
        pass
    return "hXzvdSyIgwc" # Fallback

def fetch_tv_info(title, category):
    import json
    api_key = "b6003d8a" 
    url = f"http://www.omdbapi.com/?t={urllib.parse.quote(title)}&type=series&apikey={api_key}"
    
    show_obj = {
        "_id": str(uuid.uuid4()),
        "title": title,
        "category": category,
        "type": "tv",
        "year": 2023,
        "rating": 8.5,
        "duration": "1 Season",
        "description": f"Experience the incredible story of {title}.",
        "poster": f"https://placehold.co/300x450/141414/e50914?text={urllib.parse.quote(title)}",
        "banner": f"https://placehold.co/1200x600/141414/e50914?text={urllib.parse.quote(title)}",
        "videoUrl": search_youtube_trailer(title),
        "views": 0
    }
    
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode())
            if data.get("Response") == "True":
                show_obj["year"] = int(data.get("Year", "2023")[:4]) if data.get("Year", "2023")[:4].isdigit() else 2023
                rating_str = data.get("imdbRating", "8.5")
                show_obj["rating"] = float(rating_str) if rating_str != "N/A" else 8.5
                show_obj["duration"] = f"{data.get('totalSeasons', '1')} Seasons"
                show_obj["description"] = data.get("Plot", show_obj["description"])
                poster = data.get("Poster", "N/A")
                if poster != "N/A" and poster.startswith("http"):
                    show_obj["poster"] = poster
                    show_obj["banner"] = poster
    except Exception as e:
        print(f"Error fetching {title}: {e}")
        
    return show_obj

def seed_tv_shows():
    load_dotenv()
    uri = os.environ.get("MONGO_URI", "mongodb://localhost:27017/")
    client = MongoClient(uri)
    db = client.get_database() if client.get_database().name else client['netflix_clone']
    movies_col = db['movies']
    
    # Update existing movies to have type='movie'
    movies_col.update_many({'type': {'$exists': False}}, {'$set': {'type': 'movie'}})
    
    # Check if we already added TV shows
    tv_count = movies_col.count_documents({'type': 'tv'})
    if tv_count > 0:
        movies_col.delete_many({'type': 'tv'})
        print("Cleared old TV shows.")
        
    final_shows = []
    print("Fetching TV Shows...")
    for title, category in tv_shows_data:
        print(f"Fetching {title}...")
        final_shows.append(fetch_tv_info(title, category))
        
    movies_col.insert_many(final_shows)
    print(f"Successfully added {len(final_shows)} TV Shows!")

if __name__ == "__main__":
    seed_tv_shows()
