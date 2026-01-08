import http.client
import json
from datetime import datetime
import logging
from nfl_week_helper import get_upcoming_nfl_week, game_dates, SEASON
import os
from json_to_proto import create_spreads_proto, create_player_pool
from s3_client import S3Client
import pandas as pd
from config import Config
import pytz


def write_json_file(week: int, json_data: json, file_name: str):
    os.makedirs(f'data/{SEASON}/week{week}', exist_ok=True)
    with open(f'data/{SEASON}/week{week}/{file_name}.json', 'w', encoding='utf-8') as f:
        json.dump(json_data, f, indent=2, ensure_ascii=False)


def write_binarypb_file(week: int, serialized_data: str, file_name: str):
    os.makedirs(f'data/{SEASON}/week{week}', exist_ok=True)
    # Write to binary protobuf file
    with open(f'data/{SEASON}/week{week}/{file_name}.binarypb', 'wb') as f:
        f.write(serialized_data)


def main(read_local: bool, write_local: bool, upload: bool, week: int):
    # Basic configuration
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

    # Create a logger
    logger = logging.getLogger(__name__)

    logger.info(
        f'read_local={read_local}, write_local={write_local}, upload={upload}, week={week}')

    # Ensure running in right directory
    if not os.path.exists('data'):
        print('PLEASE RUN IN nfl-optimizer-backend directory')
        exit(1)

    # Get current date and format as "YYYYMMDD"
    central = pytz.timezone('US/Central')
    current_date = datetime.now(central).strftime("%Y%m%d")
    if week == 0 or week is None:
        week = get_upcoming_nfl_week()
    if week is None:
        logger.info(f'Outside the NFL season {current_date}')
        exit(1)
    # date_of_sunday_games = game_dates(week)[0]

    s3_client = S3Client()

    # Create connection for API.
    conn = http.client.HTTPSConnection(
        "tank01-nfl-live-in-game-real-time-statistics-nfl.p.rapidapi.com")
    headers = {
        'x-rapidapi-key': Config.get('RAPID_API'),
        'x-rapidapi-host': "tank01-nfl-live-in-game-real-time-statistics-nfl.p.rapidapi.com"
    }

    # Grab DFS salaries
    dfs_data = None
    if not read_local:
        conn.request("GET", f"/getNFLDFS?date={current_date}", headers=headers)
        res = conn.getresponse()
        data = res.read()
        dfs_data = json.loads(data.decode("utf-8"))
        if dfs_data['statusCode'] != 200 or 'error' in dfs_data:
            logger.error(
                f'Error response from {dfs_data}. Response:\n{dfs_data}')
            exit(1)
        if write_local:
            write_json_file(week=week, json_data=dfs_data,
                            file_name='dfs_salaries')
        if upload and not s3_client.upload_file(season=SEASON, week=week, filename='dfs_salaries.json', data=str(dfs_data)):
            logging.error('Failed to upload dfs_salaries.json to S3')
    else:
        logging.info('Skipping /getNFLDFS call')
        with open(f'data/{SEASON}/week{week}/dfs_salaries.json', 'r') as file:
            dfs_data = json.load(file)

    # Grab Projections
    ff_projections = None
    if not read_local:
        conn.request("GET", f"/getNFLProjections?week={week}&fantasyPoints=true&twoPointConversions=2&passYards=.04&passAttempts=0&passTD=4&passCompletions=0&passInterceptions=-1&pointsPerReception=1&carries=0&rushYards=.1&rushTD=6&fumbles=-1&receivingYards=.1&receivingTD=6&targets=0&defTD=6&xpMade=1&xpMissed=-1&fgMade=3&fgMissed=-1", headers=headers)
        res = conn.getresponse()
        data = res.read()
        ff_projections = json.loads(data.decode("utf-8"))
        if ff_projections['statusCode'] != 200 or 'error' in ff_projections:
            logger.error(
                f'Error response from /getNFLProjections week {week}. Response:\n{ff_projections}')
            exit(1)
        if write_local:
            write_json_file(week=week, json_data=ff_projections,
                            file_name='ff_projections')
        if upload and not s3_client.upload_file(season=SEASON, week=week, filename='ff_projections.json', data=str(ff_projections)):
            logging.error('Failed to upload ff_projections.json to S3')
    else:
        with open(f'data/{SEASON}/week{week}/ff_projections.json', 'r') as file:
            ff_projections = json.load(file)

    # Grab NFL Games
    seasonType = 'reg' if week <= 18 else 'post'
    matchups_json = None
    if not read_local and not os.path.isfile(f'data/{SEASON}/week{week}/matchups.json'):
        nflGamesWeek = week if week <= 18 else week - 18
        conn.request(
            "GET", f"/getNFLGamesForWeek?week={nflGamesWeek}&seasonType={seasonType}", headers=headers)
        res = conn.getresponse()
        data = res.read()
        matchups_json = json.loads(data.decode("utf-8"))
        if matchups_json['statusCode'] != 200 or 'error' in matchups_json:
            logger.error(
                f'Error response from /getNFLGamesForWeek week {nflGamesWeek}. Response:\n{matchups_json}')
        if write_local:
            write_json_file(week=week, json_data=matchups_json,
                            file_name='matchups')
        if upload and not s3_client.upload_file(season=SEASON, week=week, filename='matchups.json', data=str(matchups_json)):
            logging.error('Failed to upload matchups.json to S3')
    else:
        logging.info(f'Skipping /getNFLGames call for week {week}')
        with open(f'data/{SEASON}/week{week}/matchups.json', 'r') as file:
            matchups_json = json.load(file)
    
    unique_dates = set([])
    for matchup in matchups_json['body']:
        unique_dates.add(matchup['gameDate'])
    logging.info(f'Game dates for NFL week {week}: {unique_dates}')

    # Grab Vegas Odds
    vegas_odds = {}
    if not read_local:
        combined_body = {}
        for date in unique_dates:
            conn.request(
                "GET", f"/getNFLBettingOdds?gameDate={date}&itemFormat=map&impliedTotals=true&playerProps=false", headers=headers)
            res = conn.getresponse()
            data = res.read()
            single_date_vegas_odds = json.loads(data.decode("utf-8"))
            if single_date_vegas_odds['statusCode'] != 200 or 'error' in single_date_vegas_odds:
                logging.error(f'Failed /getNFLBettingOdds{date}. Response\n{single_date_vegas_odds}')
                exit(1)
            for key, val in single_date_vegas_odds['body'].items():
                combined_body[key] = val
        vegas_odds = {'statusCode' : 200, 'body': combined_body}
        if write_local:
            write_json_file(week=week, json_data=vegas_odds,
                            file_name='vegas_odds')
        if upload and not s3_client.upload_file(season=SEASON, week=week, filename='vegas_odds.json', data=str(vegas_odds)):
            logging.error('Failed to upload vegas_odds.json to S3')
    else:
        with open(f'data/{SEASON}/week{week}/vegas_odds.json', 'r') as file:
            vegas_odds = json.load(file)

    # Grab player information
    # This JSON is long so we don't store it in git or S3
    nfl_player_statuses = None
    if not read_local:
        conn.request("GET", f"/getNFLPlayerList", headers=headers)
        res = conn.getresponse()
        data = res.read()
        nfl_player_statuses = json.loads(data.decode("utf-8"))
        if nfl_player_statuses['statusCode'] != 200 or 'error' in nfl_player_statuses:
            logging.error(
                f'Failed /getNFLPlayerList. Response\n{nfl_player_statuses}')
            exit(1)

    logging.info('Fetched all data')
    # Write Matchups binarypb
    matchups = create_spreads_proto(json_data=vegas_odds, matchup_json=matchups_json)
    binary_data = matchups.SerializeToString()
    if write_local:
        write_binarypb_file(
            week=week, serialized_data=binary_data, file_name='week_matchups')
    if upload and not s3_client.upload_file(season=SEASON, week=week, filename='week_matchups.binarypb', data=binary_data):
        logging.error('Failed to upload week_matchups.binarypb to S3')
        exit(1)

    dk_df = None
    if os.path.exists(f'data/{SEASON}/week{week}/DKSalaries.csv'):
        dk_df = pd.read_csv(f'data/{SEASON}/week{week}/DKSalaries.csv')

    # Write player pool binarypb
    players = create_player_pool(matchups=matchups_json, ff_projections=ff_projections,
                                 salaries_json=dfs_data, player_status_json=nfl_player_statuses, dk_df=dk_df)
    binary_data = players.SerializeToString()
    if write_local:
        write_binarypb_file(
            week=week, serialized_data=binary_data, file_name='player_pool')
    if upload and not s3_client.upload_file(season=SEASON, week=week, filename='player_pool.binarypb', data=binary_data):
        logging.error('Failed to upload player_pool.binarypb to S3')
        exit(1)
    exit(0)


if __name__ == "__main__":
    week = get_upcoming_nfl_week()
    main(read_local=False, write_local=False, upload=True, week=week)