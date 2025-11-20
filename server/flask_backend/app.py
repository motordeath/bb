from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import os
from dotenv import load_dotenv
import urllib.parse

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB configuration with multiple connection options
def get_mongo_client():
    """
    Try to connect to MongoDB with fallback options
    """
    # Get credentials
    username = "motordeath05_db_user"
    password = "yXUzipiLDxSqPQcRj"
    
    # Encode credentials for URL
    encoded_username = urllib.parse.quote_plus(username)
    encoded_password = urllib.parse.quote_plus(password)
    
    # Try different connection methods
    connection_strings = [
        # Method 1: Direct connection to shard nodes
        f"mongodb://{encoded_username}:{encoded_password}@cluster0-shard-00-00.aqkaejb.mongodb.net:27017,cluster0-shard-00-01.aqkaejb.mongodb.net:27017,cluster0-shard-00-02.aqkaejb.mongodb.net:27017/studentProjects?ssl=true&replicaSet=atlas-nrrxfx-shard-0&authSource=admin&retryWrites=true&w=majority",
        # Method 2: Original SRV connection (if DNS is working)
        f"mongodb+srv://{encoded_username}:{encoded_password}@cluster0.aqkaejb.mongodb.net/studentProjects?retryWrites=true&w=majority",
    ]
    
    for i, conn_str in enumerate(connection_strings, 1):
        try:
            print(f"\nAttempting connection method {i}...")
            client = MongoClient(
                conn_str,
                serverSelectionTimeoutMS=10000,
                connectTimeoutMS=10000,
                socketTimeoutMS=10000
            )
            # Test the connection
            client.admin.command('ping')
            print(f"✓ Successfully connected using method {i}")
            return client
        except Exception as e:
            print(f"✗ Method {i} failed: {str(e)}")
            if i < len(connection_strings):
                print(f"  Trying next method...")
            else:
                print(f"\n✗ All connection methods failed")
                raise ConnectionFailure("Could not connect to MongoDB with any method")
    
    return None

# Initialize MongoDB connection
try:
    print("\n" + "="*50)
    print("Starting Flask Backend Server")
    print("="*50)
    client = get_mongo_client()
    db = client.studentProjects
    users_collection = db.users
    projects_collection = db.projects
    print("\n✓ Database initialized successfully")
    print(f"✓ Connected to database: {db.name}")
    print("="*50 + "\n")
except Exception as e:
    print(f"\n✗ Failed to initialize database: {str(e)}")
    print("="*50 + "\n")
    db = None

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'message': 'Flask Backend API is running',
        'status': 'active',
        'database': 'connected' if db else 'disconnected'
    }), 200

@app.route('/api/auth/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
    
    if not db:
        return jsonify({'error': 'Database connection not available'}), 503
    
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['email', 'password']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Check if user already exists
        if users_collection.find_one({'email': data['email']}):
            return jsonify({'error': 'User already exists'}), 400
        
        # Create new user
        new_user = {
            'name': data.get('name', ''),
            'email': data['email'],
            'password': generate_password_hash(data['password']),
            'phone': data.get('phone', ''),
            'createdAt': datetime.utcnow(),
            'updatedAt': datetime.utcnow()
        }
        
        result = users_collection.insert_one(new_user)
        
        return jsonify({
            'message': 'User registered successfully',
            'userId': str(result.inserted_id)
        }), 201
        
    except Exception as e:
        print(f"Registration error: {str(e)}")
        return jsonify({'error': 'Registration failed', 'details': str(e)}), 500

@app.route('/api/auth/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
    
    if not db:
        return jsonify({'error': 'Database connection not available'}), 503
    
    try:
        data = request.json
        
        # Validate required fields
        if 'email' not in data or 'password' not in data:
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Find user
        user = users_collection.find_one({'email': data['email']})
        
        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Check password
        if not check_password_hash(user['password'], data['password']):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        return jsonify({
            'message': 'Login successful',
            'userId': str(user['_id']),
            'name': user.get('name', ''),
            'email': user['email']
        }), 200
        
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({'error': 'Login failed', 'details': str(e)}), 500

@app.route('/api/projects', methods=['GET', 'POST', 'OPTIONS'])
def projects():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
    
    if not db:
        return jsonify({'error': 'Database connection not available'}), 503
    
    if request.method == 'GET':
        try:
            all_projects = list(projects_collection.find())
            # Convert ObjectId to string
            for project in all_projects:
                project['_id'] = str(project['_id'])
            return jsonify(all_projects), 200
        except Exception as e:
            print(f"Get projects error: {str(e)}")
            return jsonify({'error': 'Failed to fetch projects'}), 500
    
    elif request.method == 'POST':
        try:
            data = request.json
            new_project = {
                'title': data.get('title', ''),
                'description': data.get('description', ''),
                'userId': data.get('userId', ''),
                'createdAt': datetime.utcnow(),
                'updatedAt': datetime.utcnow()
            }
            result = projects_collection.insert_one(new_project)
            return jsonify({
                'message': 'Project created successfully',
                'projectId': str(result.inserted_id)
            }), 201
        except Exception as e:
            print(f"Create project error: {str(e)}")
            return jsonify({'error': 'Failed to create project'}), 500

@app.route('/health', methods=['GET'])
def health():
    health_status = {
        'status': 'healthy',
        'database': 'connected',
        'timestamp': datetime.utcnow().isoformat()
    }
    
    if not db:
        health_status['status'] = 'unhealthy'
        health_status['database'] = 'disconnected'
        return jsonify(health_status), 503
    
    try:
        # Test database connection
        client.admin.command('ping')
        return jsonify(health_status), 200
    except Exception as e:
        health_status['status'] = 'unhealthy'
        health_status['database'] = 'disconnected'
        health_status['error'] = str(e)
        return jsonify(health_status), 503

if __name__ == '__main__':
    print("\n" + "="*50)
    print("Flask Server Starting on http://0.0.0.0:5000")
    print("="*50 + "\n")
    app.run(host='0.0.0.0', port=5000, debug=True)
