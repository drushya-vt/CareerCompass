import json
from typing import Dict

# File to store user data
USERS_FILE = 'users.json'

# In-memory user storage
fake_users_db: Dict = {}
logged_in_users: Dict = {}

def load_users():
    try:
        with open(USERS_FILE, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        # Return default user database if file doesn't exist
        return {"testuser": {"password": "password123", "email": "test@example.com"}}

def save_users(users):
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=4)

# Initialize user database
fake_users_db.update(load_users())
