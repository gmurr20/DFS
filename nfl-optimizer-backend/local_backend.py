from player_pb2 import Player, Players
import json
from team_matchup_pb2 import WeekMatchups
import nfl_week_helper
from json_to_proto import create_player_pool

def get_player_pool() -> Players:
    week = nfl_week_helper.get_upcoming_nfl_week()
    # # Load Data
    # with open(f'data/{nfl_week_helper.SEASON}/week{week}/dfs_salaries.json', 'r') as file:
    #     salaries_json = json.load(file)
    # with open(f'data/{nfl_week_helper.SEASON}/week{week}/ff_projections.json', 'r') as file:
    #     ff_projections = json.load(file)
    # with open(f'data/{nfl_week_helper.SEASON}/week{week}/matchups.json', 'r') as file:
    #     matchups = json.load(file)
    # return create_player_pool(matchups, ff_projections, salaries_json)
    players = Players()
    with open(f'data/{nfl_week_helper.SEASON}/week{week}/player_pool.binarypb', 'rb') as f:
        binary_data = f.read()
        players.ParseFromString(binary_data)
    return players
    

def get_spreads() -> WeekMatchups:
    week_matchups = WeekMatchups()
    week = nfl_week_helper.get_upcoming_nfl_week()
    with open(f'data/{nfl_week_helper.SEASON}/week{week}/week_matchups.binarypb', 'rb') as f:
        binary_data = f.read()
        week_matchups.ParseFromString(binary_data)
    return week_matchups