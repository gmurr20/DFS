from player_pb2 import Players
import logging
from team_matchup_pb2 import WeekMatchups
import nfl_week_helper
from s3_client import S3Client

S3_CLIENT = S3Client()

def get_player_pool() -> Players:
    week = nfl_week_helper.get_upcoming_nfl_week()
    if not S3_CLIENT.week_is_ready(season=nfl_week_helper.SEASON, week=week):
        return Players()
    player_pool_serialized = S3_CLIENT.download_file(season=nfl_week_helper.SEASON, week=week, filename='player_pool.binarypb')
    if player_pool_serialized is None:
        logging.error(f'Failed to get Player pool for week {week}')
        return None
    players = Players()
    players.ParseFromString(player_pool_serialized)
    return players
    

def get_spreads() -> WeekMatchups:
    week = nfl_week_helper.get_upcoming_nfl_week()
    if not S3_CLIENT.week_is_ready(season=nfl_week_helper.SEASON, week=week):
        return WeekMatchups()
    matchups_serialized = S3_CLIENT.download_file(season=nfl_week_helper.SEASON, week=week, filename='week_matchups.binarypb')
    if matchups_serialized is None:
        logging.error(f'Failed to get WeekMatchups for week {week}')
        return None
    week_matchups = WeekMatchups()
    week_matchups.ParseFromString(matchups_serialized)
    return week_matchups