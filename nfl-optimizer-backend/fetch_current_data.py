import http.client
import json
from env_keys import RAPID_API
from datetime import datetime
import logging
from nfl_week_helper import get_upcoming_nfl_week, game_dates
import os
from spreads import create_spreads_proto

SEASON = 2025

def write_json_file(week: int, json_data: json, file_name: str):
    os.makedirs(f'data/{SEASON}/week{week}', exist_ok=True)
    with open(f'data/{SEASON}/week{week}/{file_name}.json', 'w', encoding='utf-8') as f:
        json.dump(json_data, f, indent=2, ensure_ascii=False)

def write_binarypb_file(week: int, serialized_data: str, file_name: str):
    os.makedirs(f'data/{SEASON}/week{week}', exist_ok=True)
    # Write to binary protobuf file
    with open(f'data/{SEASON}/week{week}/{file_name}.binarypb', 'wb') as f:
        f.write(serialized_data)


# Basic configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Create a logger
logger = logging.getLogger(__name__)

# Ensure running in right directory
if not os.path.exists('data'):
    print('PLEASE RUN IN nfl-optimizer-backend directory')
    exit(1)

# Get current date and format as "YYYYMMDD"
current_date = datetime.now().strftime("%Y%m%d")
week = get_upcoming_nfl_week()
if week is None:
    exit(1)
date_of_sunday_games = game_dates(week)[0]

# Create connection for API.
conn = http.client.HTTPSConnection(
    "tank01-nfl-live-in-game-real-time-statistics-nfl.p.rapidapi.com")
headers = {
    'x-rapidapi-key': RAPID_API,
    'x-rapidapi-host': "tank01-nfl-live-in-game-real-time-statistics-nfl.p.rapidapi.com"
}

# Grab DFS salaries
conn.request("GET", f"/getNFLDFS?date={current_date}", headers=headers)
res = conn.getresponse()
data = res.read()
dfs_data = json.loads(data.decode("utf-8"))
if dfs_data['statusCode'] != 200:
    logger.error(f'Non 200 response from {dfs_data}. Response:\n{dfs_data}')
    exit(1)
write_json_file(week=week, json_data=dfs_data, file_name='dfs_salaries')

# Grab Projections
conn.request("GET", f"/getNFLProjections?week={week}&twoPointConversions=2&passYards=.04&passAttempts=-.5&passTD=4&passCompletions=1&passInterceptions=-2&pointsPerReception=1&carries=.2&rushYards=.1&rushTD=6&fumbles=-2&receivingYards=.1&receivingTD=6&targets=.1&fgMade=3&fgMissed=-1&xpMade=1&xpMissed=-1", headers=headers)
res = conn.getresponse()
data = res.read()
ff_projections = json.loads(data.decode("utf-8"))
if ff_projections['statusCode'] != 200:
    logger.error(
        f'Non 200 response from /getNFLProjections week {week}. Response:\n{ff_projections}')
    exit(1)
write_json_file(week=week, json_data=ff_projections, file_name='ff_projections')

# Grab NFL Games
seasonType = 'reg' if week <= 18 else 'post'
if not os.path.isfile(f'data/{SEASON}/week{week}/matchups.json'):
    conn.request("GET", f"/getNFLGamesForWeek?week={week}&seasonType={seasonType}", headers=headers)
    res = conn.getresponse()
    data = res.read()
    nfl_games = json.loads(data.decode("utf-8"))
    if nfl_games['statusCode'] != 200:
        logger.error(f'Non 200 response from /getNFLGamesForWeek week {week}. Response:\n{nfl_games}')
    write_json_file(week=week, json_data=nfl_games, file_name='matchups')
else:
    logging.info(f'Skipping /getNFLGames call for week {week}')

# Grab Vegas Odds
conn.request("GET", f"/getNFLBettingOdds?gameDate={date_of_sunday_games}&itemFormat=map&impliedTotals=true&playerProps=false", headers=headers)
res = conn.getresponse()
data = res.read()
vegas_odds = json.loads(data.decode("utf-8"))
if vegas_odds['statusCode'] != 200:
    logging.error(f'Failed /getNFLBettingOdds. Response\n{vegas_odds}')
    exit(1)
write_json_file(week=week, json_data=vegas_odds, file_name='vegas_odds')

# Write Matchups binarypb
matchups = create_spreads_proto(json_data=vegas_odds)
binary_data = matchups.SerializeToString()
write_binarypb_file(week=week, serialized_data=binary_data, file_name='week_matchups')