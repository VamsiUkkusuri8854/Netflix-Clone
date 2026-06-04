# Netflix-Clone
Developed a production-ready Netflix-inspired streaming platform featuring user authentication, movie catalog management, watchlists, watch history, recommendations, admin dashboard, analytics, and MongoDB Atlas integration. Implemented secure JWT-based authentication and deployed using Render and Netlify.

# Full-Stack Netflix Clone

A production-ready Netflix Clone application featuring a dynamic movie catalog, JWT authentication, user watchlists, watch history with "Continue Watching" capabilities, and an Admin dashboard for movie and analytics management.

## Features
- **User Authentication**: Secure registration and login using JWT tokens and password hashing.
- **Dynamic Catalog**: Movies loaded from a MongoDB backend via REST APIs.
- **Video Player**: HTML5 video playback with automatic progress saving to history.
- **Trending & Recommendations**: Dynamic category sorting based on user views and history.
- **Admin Panel**: Role-based access control to manage movies (Add/Edit/Delete) and view site analytics.
- **Responsive Design**: Polished UI with skeleton loaders, dark mode, and seamless mobile support.

## Technologies Used
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Python, Flask, PyJWT, Werkzeug
- **Database**: MongoDB (Atlas)
- **Deployment Ready**: Gunicorn, Netlify, Render

## Installation & Setup

### 1. Prerequisites
- Python 3.10+
- MongoDB (Local or Atlas)

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # (On Windows: venv\Scripts\activate)
pip install -r requirements.txt
```

Set up your environment variables by creating a `.env` file in the `backend` directory (see `.env.example`).

### 3. Database Seeding
To populate the database with initial movies and the default admin user:
```bash
python seed.py
```
*Default Admin Credentials:* `admin@netflix.com` / `admin123`

### 4. Running Locally
Start the Flask backend:
```bash
python app.py
```

Serve the frontend via HTTP:
```bash
cd ../frontend
python -m http.server 8000
```
Open your browser to `http://localhost:8000`.

## API Endpoints

### Authentication (Public)
- `POST /api/register`
- `POST /api/login`

### Movies (Public)
- `GET /api/movies` (Query params: `?title=`, `?category=`, `?year=`, `?sort=trending`)
- `GET /api/movies/:id`

### User (Protected)
- `GET/PUT /api/profile/:id`
- `GET/POST/DELETE /api/watchlist`
- `GET/POST /api/history`

### Admin (Role Protected)
- `GET /api/admin/analytics`
- `POST /api/admin/movies`
- `PUT/DELETE /api/admin/movies/:id`

## Deployment

**Backend (Render):**
The project includes a `render.yaml` for automatic deployment of the Flask backend to Render using Gunicorn. Ensure you set the `MONGO_URI` and `JWT_SECRET` environment variables.

**Frontend (Netlify):**
Deploy the `frontend/` directory to Netlify. Update the `API_BASE` variable in `frontend/js/script.js` and `frontend/js/admin.js` to point to your live Render backend URL.
