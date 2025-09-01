from player_pb2 import Player, Players
import optimizer as op_lib
from optimizer_api_pb2 import OptimizerRequest
# from local_backend import get_player_pool, get_spreads
from online_backend import get_player_pool, get_spreads

player_pool = get_player_pool()
# print(len(player_pool.players))
# print(player_pool)
# exit()
# Initialize Optimizer
NFL_TEAM_REQUIREMENTS = {'QB': [1, 1], 'RB': [2,3], 'WR': [3,4], 'TE': [1,2], 'DST': [1,1]}
optimizer = op_lib.Optimizer(player_pool=player_pool, spreads=get_spreads(), team_requirements=NFL_TEAM_REQUIREMENTS, num_players=9)

# Run Optimizer
request = OptimizerRequest()
# request.player_id_locks.append('4426348')
# request.player_id_locks.append('NYG')
request.randomness = 0.0
request.num_lineups = 1
request.stack = True
request.no_opposing_defense = True

response = optimizer.optimize(request)

for lineup in response.lineups:
    print()
    for player in lineup.players:
        print(player.position, player.name, player.points, player.sim_points)