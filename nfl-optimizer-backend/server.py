from flask import Flask, jsonify, request
from flask_cors import CORS
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

@app.route('/')
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "message": "NFL Optimizer API is running",
        "timestamp": datetime.now().isoformat()
    })

@app.route('/getPlayers', methods=['GET'])
def get_players():
     return Response(
            response.SerializeToString(),
            content_type='application/x-protobuf'
        )
    return

@app.route('/optimize', methods=['POST'])
def optimize_lineup():