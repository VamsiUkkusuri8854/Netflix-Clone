from flask import Flask
from flask_cors import CORS
from routes.auth import auth_bp
from routes.movies import movies_bp
from routes.user import user_bp
from routes.admin import admin_bp
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(movies_bp, url_prefix='/api')
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(admin_bp, url_prefix='/api/admin')

if __name__ == '__main__':
    app.run(debug=True, port=5000)
