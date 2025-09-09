import http.client
import json
from env_keys import RAPID_API
from datetime import datetime
import logging
from nfl_week_helper import get_upcoming_nfl_week, game_dates, SEASON
import os
from json_to_proto import create_spreads_proto, create_player_pool
from s3_client import S3Client
import pandas as pd

def write_json_file(week: int, json_data: json, file_name: str):
    os.makedirs(f'data/{SEASON}/week{week}', exist_ok=True)
    with open(f'data/{SEASON}/week{week}/{file_name}.json', 'w', encoding='utf-8') as f:
        json.dump(json_data, f, indent=2, ensure_ascii=False)

def write_binarypb_file(week: int, serialized_data: str, file_name: str):
    os.makedirs(f'data/{SEASON}/week{week}', exist_ok=True)
    # Write to binary protobuf file
    with open(f'data/{SEASON}/week{week}/{file_name}.binarypb', 'wb') as f:
        f.write(serialized_data)

def main(use_local: bool, upload: bool, week: int):
    # Basic configuration
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

    # Create a logger
    logger = logging.getLogger(__name__)

    logger.info(f'use_local={use_local}, upload={upload}, week={week}')

    # Ensure running in right directory
    if not os.path.exists('data'):
        print('PLEASE RUN IN nfl-optimizer-backend directory')
        exit(1)

    # Get current date and format as "YYYYMMDD"
    current_date = datetime.now().strftime("%Y%m%d")
    if week == 0 or week is None:
        week = get_upcoming_nfl_week()
    if week is None:
        logger.info(f'Outside the NFL season {current_date}')
        exit(1)
    date_of_sunday_games = game_dates(week)[0]

    s3_client = S3Client()

    # Create connection for API.
    conn = http.client.HTTPSConnection(
        "tank01-nfl-live-in-game-real-time-statistics-nfl.p.rapidapi.com")
    headers = {
        'x-rapidapi-key': RAPID_API,
        'x-rapidapi-host': "tank01-nfl-live-in-game-real-time-statistics-nfl.p.rapidapi.com"
    }

    # Grab DFS salaries
    dfs_data = None
    if not use_local:
        conn.request("GET", f"/getNFLDFS?date={current_date}", headers=headers)
        res = conn.getresponse()
        data = res.read()
        dfs_data = json.loads(data.decode("utf-8"))
        if dfs_data['statusCode'] != 200:
            logger.error(f'Non 200 response from {dfs_data}. Response:\n{dfs_data}')
            exit(1)
        write_json_file(week=week, json_data=dfs_data, file_name='dfs_salaries')
        if upload and not s3_client.upload_file(season=SEASON, week=week, filename='dfs_salaries.json'):
            logging.error('Failed to upload dfs_salaries.json to S3')
    else:
        logging.info('Skipping /getNFLDFS call')
        with open(f'data/{SEASON}/week{week}/dfs_salaries.json', 'r') as file:
            dfs_data = json.load(file)

    # Grab Projections
    ff_projections = None
    if not use_local:
        conn.request("GET", f"/getNFLProjections?week={week}&fantasyPoints=true&twoPointConversions=2&passYards=.04&passAttempts=0&passTD=4&passCompletions=0&passInterceptions=-1&pointsPerReception=1&carries=0&rushYards=.1&rushTD=6&fumbles=-1&receivingYards=.1&receivingTD=6&targets=0&defTD=6&xpMade=1&xpMissed=-1&fgMade=3&fgMissed=-1", headers=headers)
        res = conn.getresponse()
        data = res.read()
        ff_projections = json.loads(data.decode("utf-8"))
        if ff_projections['statusCode'] != 200:
            logger.error(
                f'Non 200 response from /getNFLProjections week {week}. Response:\n{ff_projections}')
            exit(1)
        write_json_file(week=week, json_data=ff_projections, file_name='ff_projections')
        if upload and not s3_client.upload_file(season=SEASON, week=week, filename='ff_projections.json'):
            logging.error('Failed to upload ff_projections.json to S3')
    else:
        with open(f'data/{SEASON}/week{week}/ff_projections.json', 'r') as file:
            ff_projections = json.load(file)

    # Grab NFL Games
    seasonType = 'reg' if week <= 18 else 'post'
    matchups_json = None
    if not use_local and not os.path.isfile(f'data/{SEASON}/week{week}/matchups.json'):
        conn.request("GET", f"/getNFLGamesForWeek?week={week}&seasonType={seasonType}", headers=headers)
        res = conn.getresponse()
        data = res.read()
        matchups_json = json.loads(data.decode("utf-8"))
        if matchups_json['statusCode'] != 200:
            logger.error(f'Non 200 response from /getNFLGamesForWeek week {week}. Response:\n{matchups_json}')
        write_json_file(week=week, json_data=matchups_json, file_name='matchups')
        if upload and not s3_client.upload_file(season=SEASON, week=week, filename='matchups.json'):
            logging.error('Failed to upload matchups.json to S3')
    else:
        logging.info(f'Skipping /getNFLGames call for week {week}')
        with open(f'data/{SEASON}/week{week}/matchups.json', 'r') as file:
            matchups_json = json.load(file)

    # Grab Vegas Odds
    vegas_odds = None
    if not use_local:
        conn.request("GET", f"/getNFLBettingOdds?gameDate={date_of_sunday_games}&itemFormat=map&impliedTotals=true&playerProps=false", headers=headers)
        res = conn.getresponse()
        data = res.read()
        vegas_odds = json.loads(data.decode("utf-8"))
        if vegas_odds['statusCode'] != 200:
            logging.error(f'Failed /getNFLBettingOdds. Response\n{vegas_odds}')
            exit(1)
        write_json_file(week=week, json_data=vegas_odds, file_name='vegas_odds')
        if upload and not s3_client.upload_file(season=SEASON, week=week, filename='vegas_odds.json'):
            logging.error('Failed to upload vegas_odds.json to S3')
    else:
        with open(f'data/{SEASON}/week{week}/vegas_odds.json', 'r') as file:
            vegas_odds = json.load(file)

    # Write Matchups binarypb
    matchups = create_spreads_proto(json_data=vegas_odds)
    binary_data = matchups.SerializeToString()
    write_binarypb_file(week=week, serialized_data=binary_data, file_name='week_matchups')
    if upload and not s3_client.upload_file(season=SEASON, week=week, filename='week_matchups.binarypb'):
        logging.error('Failed to upload week_matchups.binarypb to S3')

    dk_df = None
    if os.path.exists(f'data/{SEASON}/week{week}/DKSalaries.csv'):
        dk_df = pd.read_csv(f'data/{SEASON}/week{week}/DKSalaries.csv')

    # Write player pool binarypb
    players = create_player_pool(matchups=matchups_json, ff_projections=ff_projections, salaries_json=dfs_data, dk_df=dk_df)
    binary_data = players.SerializeToString()
    write_binarypb_file(week=week, serialized_data=binary_data, file_name='player_pool')
    if upload and not s3_client.upload_file(season=SEASON, week=week, filename='player_pool.binarypb'):
        logging.error('Failed to upload player_pool.binarypb to S3')
    exit(0)


if __name__ == "__main__":
    week = get_upcoming_nfl_week()
    main(use_local=False, upload=True, week=week)