from player_pb2 import Player, Players
import json
from team_matchup_pb2 import WeekMatchups
import nfl_week_helper

def get_player_pool() -> Players:
    week = nfl_week_helper.get_upcoming_nfl_week()
    # Load Data
    with open(f'data/{nfl_week_helper.SEASON}/week{week}/dfs_salaries.json', 'r') as file:
        salaries_json = json.load(file)
    with open(f'data/{nfl_week_helper.SEASON}/week{week}/ff_projections.json', 'r') as file:
        ff_projections = json.load(file)
    with open(f'data/{nfl_week_helper.SEASON}/week{week}/matchups.json', 'r') as file:
        matchups = json.load(file)

    team_to_opposing_team = {}
    for matchup in matchups["body"]:
        team_to_opposing_team[matchup["away"]] = matchup["home"]
        team_to_opposing_team[matchup["home"]] = matchup["away"]

    # Grab player pool and salaries
    player_dict = {}
    for player in salaries_json["body"]["draftkings"]:
        player_proto = Player()
        player_proto.id = player["playerID"] if "playerID" in player else player["team"]
        player_proto.name = player["longName"]
        player_proto.team = player["team"]
        player_proto.position = player["pos"]
        player_proto.salary = int(player["salary"])
        player_proto.opposing_team = team_to_opposing_team[player["team"]]
        player_dict[player_proto.id] = player_proto

    # Grab fantasy projections
    for id, player in ff_projections["body"]["playerProjections"].items():
        if id not in player_dict:
            # print(f"Can't find '{player["longName"]}'")
            continue
        player_dict[id].points = float(player["fantasyPointsDefault"]["PPR"])
    for id, dst in ff_projections["body"]["teamDefenseProjections"].items():
        team_id = dst["teamAbv"]
        if team_id not in player_dict:
            # print(f"Can't find DST {team_id}")
            continue
        player_dict[team_id].points = float(dst["fantasyPointsDefault"])

    # Clean data to player pool
    player_pool = Players()
    for _, player in player_dict.items():
        player_pool.players.append(player)
    
    return player_pool

def get_spreads() -> WeekMatchups:
    week_matchups = WeekMatchups()
    with open('data/example/week_matchups.binarypb', 'rb') as f:
        binary_data = f.read()
        week_matchups.ParseFromString(binary_data)
    return week_matchups