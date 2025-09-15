from flask import Flask, jsonify, request, Response
from flask_cors import CORS
from datetime import datetime, timedelta
import logging
import os
import jwt
import hashlib
import optimizer as op_lib
import nfl_week_helper

# import local_backend as backend_lib
import online_backend as backend_lib
from optimizer_api_pb2 import OptimizerRequest, GetPlayersResponse, GetMatchupsRequest, GetMatchupsResponse
from team_matchup_pb2 import WeekMatchups
from functools import wraps
# from env_keys import SECRET_KEY, ADMIN_PASSWORD
from config import Config

NFL_TEAM_REQUIREMENTS = {'QB': [1, 1], 'RB': [
    2, 3], 'WR': [3, 4], 'TE': [1, 2], 'DST': [1, 1]}

ADMIN_PASSWORD_HASH = hashlib.sha256(Config.get('ADMIN_PASSWORD').encode()).hexdigest()
TOKEN_EXPIRY_HOURS = 720


def hash_password(password):
    """Hash a password for storing."""
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(password, hashed):
    """Verify a password against its hash."""
    return hashlib.sha256(password.encode()).hexdigest() == hashed


def generate_token(payload):
    """Generate a JWT token."""
    payload['exp'] = datetime.utcnow() + timedelta(hours=TOKEN_EXPIRY_HOURS)
    return jwt.encode(payload, Config.get('SECRET_KEY'), algorithm='HS256')


def verify_token(token):
    """Verify and decode a JWT token."""
    try:
        payload = jwt.decode(token, Config.get('SECRET_KEY'), algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def token_required(f):
    """Decorator to require valid JWT token for protected routes."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')

        if not auth_header:
            return jsonify({'error': 'No authorization header provided'}), 401

        try:
            token = auth_header.split(' ')[1]  # Bearer <token>
        except IndexError:
            return jsonify({'error': 'Invalid authorization header format'}), 401

        payload = verify_token(token)
        if not payload:
            return jsonify({'error': 'Invalid or expired token'}), 401

        return f(*args, **kwargs)

    return decorated


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


@app.route('/login', methods=['POST'])
def login():
    """Authenticate user and return JWT token"""
    try:
        data = request.get_json()
        if not data or 'password' not in data:
            return jsonify({'error': 'Password is required'}), 400

        password = data['password']

        if not verify_password(password, ADMIN_PASSWORD_HASH):
            logger.warning(f"Failed login attempt from {request.remote_addr}")
            return jsonify({'error': 'Invalid password'}), 401

        # Generate JWT token
        token = generate_token(
            {'authenticated': True, 'timestamp': datetime.utcnow().isoformat()})

        logger.info(f"Successful login from {request.remote_addr}")
        return jsonify({
            'token': token,
            'expires_in': TOKEN_EXPIRY_HOURS * 3600  # seconds
        })

    except Exception as e:
        logger.error(f"Error in login: {e}")
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/verify-token', methods=['POST'])
def verify_token_endpoint():
    """Verify if a JWT token is still valid"""
    try:
        data = request.get_json()
        if not data or 'token' not in data:
            return jsonify({'error': 'Token is required'}), 400

        token = data['token']
        payload = verify_token(token)

        if payload:
            return jsonify({'valid': True, 'payload': payload})
        else:
            return jsonify({'valid': False}), 401

    except Exception as e:
        logger.error(f"Error in verify-token: {e}")
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/getPlayers', methods=['GET'])
@token_required
def get_players():
    try:
        week = nfl_week_helper.get_upcoming_nfl_week()
        player_pool = backend_lib.get_player_pool()
        if len(player_pool.players) == 0:
            logger.info(f"No players for week {week}")
        response = GetPlayersResponse(players=player_pool, week=str(week))
        return Response(response.SerializeToString(), content_type='application/x-protobuf')
    except Exception as e:
        logger.error(f"Error in getPlayers: {e}")
        return create_protobuf_error_response("Internal server error", 500)


@app.route('/optimize', methods=['POST'])
@token_required
def optimize_lineup():
    try:
        # Get request data
        request_data = request.get_data()
        # Parse request
        optimize_request, parse_error = parse_protobuf_request(
            request_data, OptimizerRequest)
        if parse_error:
            return create_protobuf_error_response(f"Invalid protobuf format: {parse_error}", 400)

        # Add constraints to request
        optimize_request.randomness = max(min(optimize_request.randomness, 1.0), 0.0)
        optimize_request.num_lineups = min(max(optimize_request.num_lineups, 1), 10)

        optimizer = op_lib.Optimizer(
            player_pool=backend_lib.get_player_pool(),
            spreads=backend_lib.get_spreads(),
            team_requirements=NFL_TEAM_REQUIREMENTS,
            num_players=9
        )
        response = optimizer.optimize(optimize_request)

        logger.info(f"Responding with OptimizeResponse {response}")
        return Response(
            response.SerializeToString(),
            mimetype='application/x-protobuf'
        )
    except Exception as e:
        logger.error(f"Error in optimize: {e}")
        return create_protobuf_error_response("Internal server error", 500)

@app.route('/getMatchups', methods=['GET'])
@token_required
def get_matchups():
    try:
        week = nfl_week_helper.get_upcoming_nfl_week()
        spreads = backend_lib.get_spreads()
        if len(spreads.matchups) == 0:
            logger.info(f"No matchups for week {week}")
        # Only 1 matchup should show up
        prune_response = WeekMatchups()
        team_set = set()
        for matchup in spreads.matchups:
            if matchup.team in team_set or matchup.opposing_team in team_set:
                continue
            team_set.add(matchup.team)
            team_set.add(matchup.opposing_team)
            prune_response.matchups.append(matchup)
        response = GetMatchupsResponse(matchups=prune_response, week=str(week))
        return Response(response.SerializeToString(), content_type='application/x-protobuf')
    except Exception as e:
        logger.error(f"Error in getMatchups: {e}")
        return create_protobuf_error_response("Internal server error", 500)

if __name__ == '__main__':
    logger.info(
        f"Starting Flask server on {app.config['HOST']}:{app.config['PORT']}")
    app.run(
        host=app.config['HOST'],
        port=app.config['PORT'],
        debug=app.config['DEBUG']
    )
