import json
import urllib.request
import urllib.parse
import os
import uuid

# Define the movies and categories
movies_data = [
    # Trending in India
    ("Kalki 2898 AD", "Trending in India"),
    ("Animal", "Trending in India"),
    ("Jawan", "Trending in India"),
    ("Devara", "Trending in India"),
    ("Lucky Baskhar", "Trending in India"),
    
    # Telugu Blockbusters
    ("RRR", "Telugu Blockbusters"),
    ("Pushpa: The Rise", "Telugu Blockbusters"),
    ("Pushpa 2", "Telugu Blockbusters"),
    ("Baahubali: The Beginning", "Telugu Blockbusters"),
    ("Baahubali 2: The Conclusion", "Telugu Blockbusters"),
    
    # South Indian Action
    ("K.G.F: Chapter 1", "South Indian Action"),
    ("K.G.F: Chapter 2", "South Indian Action"),
    ("Salaar", "South Indian Action"),
    ("Master", "South Indian Action"),
    ("Vikram", "South Indian Action"),
    
    # Bollywood Hits
    ("Pathaan", "Bollywood Hits"),
    ("Dangal", "Bollywood Hits"),
    ("3 Idiots", "Bollywood Hits"),
    ("Shershaah", "Bollywood Hits"),
    ("Chhava", "Bollywood Hits"),
    
    # Comedy Movies
    ("Bhool Bhulaiyaa", "Comedy Movies"),
    ("Premalu", "Comedy Movies"),
    ("Hera Pheri", "Comedy Movies"),
    ("Munna Bhai M.B.B.S.", "Comedy Movies"),
    ("Welcome", "Comedy Movies"),
    
    # Thriller Movies
    ("Drishyam", "Thriller Movies"),
    ("Drishyam 2", "Thriller Movies"),
    ("Raid", "Thriller Movies"),
    ("Kannur Squad", "Thriller Movies"),
    ("Ratsasan", "Thriller Movies"),
    
    # Recently Added
    ("Leo", "Recently Added"),
    ("Kaithi", "Recently Added"),
    ("Jailer", "Recently Added"),
    ("Mersal", "Recently Added"),
    ("Manjummel Boys", "Recently Added"),
    
    # Recommended For You
    ("Jersey", "Recommended For You"),
    ("Eega", "Recommended For You"),
    ("Rangasthalam", "Recommended For You"),
    ("Sita Ramam", "Recommended For You"),
    ("Hi Nanna", "Recommended For You"),
]

def fetch_movie_info(title, category):
    # Free OMDB API keys used in tutorials
    api_key = "b6003d8a" 
    url = f"http://www.omdbapi.com/?t={urllib.parse.quote(title)}&apikey={api_key}"
    
    movie_obj = {
        "id": str(uuid.uuid4()),
        "title": title,
        "category": category,
        "year": 2023,
        "rating": 8.5,
        "duration": "2h 30m",
        "description": f"Experience the epic journey in {title}. A cinematic masterpiece.",
        "poster": f"https://placehold.co/300x450/141414/e50914?text={urllib.parse.quote(title)}",
        "banner": f"https://placehold.co/1200x600/141414/e50914?text={urllib.parse.quote(title)}",
        "videoUrl": "https://www.w3schools.com/html/mov_bbb.mp4"
    }
    
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode())
            if data.get("Response") == "True":
                movie_obj["year"] = int(data.get("Year", "2023")[:4]) if data.get("Year", "2023")[:4].isdigit() else 2023
                rating_str = data.get("imdbRating", "8.5")
                movie_obj["rating"] = float(rating_str) if rating_str != "N/A" else 8.5
                movie_obj["duration"] = data.get("Runtime", "2h 30m").replace(" min", "m")
                movie_obj["description"] = data.get("Plot", movie_obj["description"])
                
                poster = data.get("Poster", "N/A")
                if poster != "N/A" and poster.startswith("http"):
                    movie_obj["poster"] = poster
                    # Use a darkened high quality banner if possible, else placeholder
                    movie_obj["banner"] = poster
            else:
                print(f"OMDB not found for: {title}")
    except Exception as e:
        print(f"Error fetching {title}: {e}")
        
    return movie_obj

print("Fetching movie data... This will take a moment.")
final_movies = []
for title, category in movies_data:
    final_movies.append(fetch_movie_info(title, category))

out_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'data', 'movies.json')
os.makedirs(os.path.dirname(out_path), exist_ok=True)

with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(final_movies, f, indent=4)

print(f"Successfully generated {len(final_movies)} Indian movies in movies.json!")
