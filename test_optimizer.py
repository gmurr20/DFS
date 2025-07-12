import csv
from player_pb2 import Player, PlayerPool
from optimizer import Optimizer
from optimizer_api_pb2 import OptimizerRequest, OptimizerResponse
import pandas as pd

player_pool = PlayerPool()
with open("player_pool.csv") as pool:
    csv_reader = csv.reader(pool, delimiter=",")
    for row in csv_reader:
        player = Player()
        player.name = row[0]
        player.team = row[1]
        player.position = row[2]
        player.salary = int(row[3])
        player.points = float(row[4])
        player_pool.players.append(player)


nba_team_requirements = {'pg': 1, 'sg': 1, 'sf': 1, 'pf': 1, 'c': 1, 'pg|sg': 1, 'sf|pf': 1, 'pg|sg|sf|pf|c': 1}
optimizer = Optimizer(player_pool, nba_team_requirements)

request = OptimizerRequest()
request.randomness = 0.1
request.num_lineups = 10
response = optimizer.optimize(request)
print(response)