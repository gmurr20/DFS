from flask import Flask, jsonify, request, Response
from flask_cors import CORS
from datetime import datetime
import logging
import os
import optimizer as op_lib

from player_pb2 import Player, Players, Lineup
from optimizer_api_pb2 import OptimizerRequest, OptimizerResponse, GetPlayersRequest, GetPlayersResponse

NFL_TEAM_REQUIREMENTS = {'QB': [1, 1], 'RB': [2,3], 'WR': [3,4], 'TE': [1,2], 'DST': [1,1]}

def parse_protobuf_request(request_data, message_class):
    """Helper function to safely parse protobuf requests"""
    try:
        message = message_class()
        message.ParseFromString(request_data)
        return message, None
    except Exception as e:
        logger.error(f"Error parsing protobuf: {e}")
        return None, str(e)

def create_protobuf_error_response(error_message, status_code=400):
    """Create standardized error response"""
    return Response(
        f'{{"error": "{error_message}"}}'.encode('utf-8'),
        status=status_code,
        mimetype='application/json'
    )

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
app.config['DEBUG'] = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
app.config['HOST'] = os.getenv('FLASK_HOST', '0.0.0.0')
app.config['PORT'] = int(os.getenv('FLASK_PORT', 8888))

# Middleware for logging requests
@app.before_request
def log_request_info():
    logger.info(f"{request.method} {request.url} - {request.remote_addr}")

# Routes
@app.route('/', methods=['GET'])
def home():
    """Health check endpoint"""
    return jsonify({
        'message': 'Flask server is running!',
        'timestamp': datetime.utcnow().isoformat(),
        'status': 'healthy'
    })

@app.route('/health', methods=['GET'])
def health_check():
    """Detailed health check"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0',
        'environment': os.getenv('FLASK_ENV', 'development')
    })

@app.route('/getPlayers', methods=['GET'])
def get_players():
    try:
        player_pool = op_lib.get_player_pool()
        response = GetPlayersResponse(players=player_pool)
        return Response(response.SerializeToString(), content_type='application/x-protobuf')
    except Exception as e:
        logger.error(f"Error in getPlayers: {e}")
        return create_protobuf_error_response("Internal server error", 500)

@app.route('/optimize', methods=['POST'])
def optimize_lineup():
    try:
        # Get request data
        request_data = request.get_data()
        # Parse request
        optimize_request, parse_error = parse_protobuf_request(request_data, OptimizerRequest)
        if parse_error:
            return create_protobuf_error_response(f"Invalid protobuf format: {parse_error}", 400)
        
        optimizer = op_lib.Optimizer(player_pool=op_lib.get_player_pool(), team_requirements=NFL_TEAM_REQUIREMENTS, num_players=9)

        response = optimizer.optimize(optimize_request)

        logger.info(f"Responding with OptimizeResponse {response}")
        return Response(
            response.SerializeToString(),
            mimetype='application/x-protobuf'
        )
    except Exception as e:
        logger.error(f"Error in optimize: {e}")
        return create_protobuf_error_response("Internal server error", 500)

if __name__ == '__main__':
    logger.info(f"Starting Flask server on {app.config['HOST']}:{app.config['PORT']}")
    app.run(
        host=app.config['HOST'],
        port=app.config['PORT'],
        debug=app.config['DEBUG']
    )