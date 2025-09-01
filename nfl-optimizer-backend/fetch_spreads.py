import http.client
import json
from env_keys import RAPID_API
import logging
from team_matchup_pb2 import TeamMatchup, WeekMatchups
from google.protobuf import text_format

def get_projected_total(over_under: float, spread: float):
    return (over_under - spread) / 2.0

# Basic configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Create a logger
logger = logging.getLogger(__name__)

conn = http.client.HTTPSConnection("tank01-nfl-live-in-game-real-time-statistics-nfl.p.rapidapi.com")
headers = {
    'x-rapidapi-key': RAPID_API,
    'x-rapidapi-host': "tank01-nfl-live-in-game-real-time-statistics-nfl.p.rapidapi.com"
}
api_call = "/getNFLBettingOdds?gameDate=20250907&itemFormat=map&impliedTotals=true&playerProps=false"
conn.request("GET", api_call, headers=headers)
res = conn.getresponse()
data = res.read()
json_data = json.loads(data.decode("utf-8"))

# with open('data/week1_spreads.json', 'r') as file:
#     json_data = json.load(file)

if 'statusCode' not in json_data:
    logger.error(f'No status code in response from {api_call}. Response:\n{json_data}')
    exit()
if json_data['statusCode'] != 200:
    logger.error(f'Fetching {api_call} failed with status_code {json_data['status_code']}. Response:\n{json_data}')
    exit()
if 'body' not in json_data:
    logger.error(f'No body in response from {api_call}. Response:\n{json_data}')
    exit()

books = ['ballybet', 'bet365', 'betmgm', 'betrivers', 'caesars_sportsbook', 'draftkings', 'espnbet', 'fanatics', 'fanduel']
week_matchups = WeekMatchups()
for game, spread_map in json_data['body'].items():
    teams = game[len('20250907_'):].split('@')
    away = teams[0]
    home = teams[1]
    over_under_sum = 0.0
    home_team_spread_sum = 0.0
    book_count = 0
    for book in books:
        if book not in spread_map:
            continue
        over_under_sum += float(spread_map[book]['totalOver'])
        home_team_spread_sum += float(spread_map[book]['homeTeamSpread']) if spread_map[book]['homeTeamSpread'] != 'PK' else 0
        book_count += 1
    over_under = over_under_sum / book_count
    home_team_spread = home_team_spread_sum / book_count
    home_team = TeamMatchup()
    home_team.team = home
    home_team.opposing_team = away
    home_team.is_home = True
    home_team.projected_team_total = get_projected_total(over_under, home_team_spread)
    home_team.projected_opposing_team_total = get_projected_total(over_under, -1 * home_team_spread)
    home_team.over_under = over_under
    home_team.spread = home_team_spread
    away_team = TeamMatchup()
    away_team.team = away
    away_team.opposing_team = home
    away_team.is_home = False
    away_team.projected_team_total = get_projected_total(over_under, -1 * home_team_spread)
    away_team.projected_opposing_team_total = get_projected_total(over_under, home_team_spread)
    away_team.over_under = over_under
    away_team.spread = -1.0 * home_team_spread
    week_matchups.matchups.append(home_team)
    week_matchups.matchups.append(away_team)

with open('data/week1_spreads.textproto', 'w') as f:
    f.write(text_format.MessageToString(week_matchups))
    
