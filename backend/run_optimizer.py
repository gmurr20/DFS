import csv
from player_pb2 import Player, PlayerPool
from optimizer import Optimizer
from optimizer_api_pb2 import OptimizerRequest, OptimizerResponse
import pandas as pd
import json

# Load Data
with open('dfs_salaries.json', 'r') as file:
    salaries_json = json.load(file)
with open('ff_projections.json', 'r') as file:
    ff_projections = json.load(file)
with open('week1_matchups.json', 'r') as file:
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
player_pool = PlayerPool()
for _, player in player_dict.items():
    player_pool.players.append(player)

# Initialize Optimizer
NFL_TEAM_REQUIREMENTS = {'QB': [1, 1], 'RB': [2,3], 'WR': [3,4], 'TE': [1,2], 'DST': [1,1]}
optimizer = Optimizer(player_pool=player_pool, team_requirements=NFL_TEAM_REQUIREMENTS, num_players=9)

# Run Optimizer
request = OptimizerRequest()
request.randomness = 0.0
request.num_lineups = 10
request.stack = True

response = optimizer.optimize(request)

for lineup in response.lineups:
    print()
    for pos, players in lineup.position_to_players.items():
        for player in players.players:
            print(pos, player.name, player.points)