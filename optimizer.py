from player_pb2 import Player, PlayerPool
from optimizer_api_pb2 import OptimizerRequest, OptimizerResponse
import pandas as pd
import numpy as np
from team import Team

def randomize_points(initial_projection: float, random_factor: float) -> float:
    if random_factor < 0:
        random_factor = 0.0
    if random_factor > 1.0:
        random_factor = 1.0
    std_dev = random_factor * initial_projection
    new_projection = np.random.normal(loc=initial_projection, scale=std_dev, size=None)
    if new_projection < 0:
        new_projection = 0
    return new_projection

class Optimizer:

    def __init__(self, player_pool: PlayerPool, team_requirements: dict[str, int]):
        self.player_pool = self._convert_player_pool_to_dataframe(player_pool)
        self.team_requirements = {'pg': 1, 'sg': 1, 'sf': 1, 'pf': 1, 'c': 1, 'pg|sg': 1, 'sf|pf': 1, 'pg|sg|sf|pf|c': 1}
    
    def _convert_player_pool_to_dataframe(player_pool_proto: PlayerPool) -> pd.DataFrame:
        player_data = []
        for player in player_pool_proto.players:
            row = {
                'id': player.name + "_" + player.position,
                'name': player.name,
                'position': player.position,
                'salary': player.salary,
                'points': player.points,
                'team': player.team if player.HasField('team') else None
            }
            player_data.append(row)
        df = pd.DataFrame(player_data)
        return df
    
    def _add_randomness_to_player_pool(self, randomness: float):
        randomized_pool = self.player_pool.copy(deep=True)
        randomized_pool['simulated_projection'] = randomized_pool['points'].apply(randomize_points)
        return randomize_points

    def optimize(self, request: OptimizerRequest) -> OptimizerResponse:
        player_pool = self._add_randomness_to_player_pool(request.randomness)

        stack = []
        first_pos = self.team_requirements.keys[0]
        all_players_in_pos = player_pool['position'].str.contains(f'^({first_pos})')
        for row in all_players_in_pos.itertuples():
            stack.append(Team(self.team_requirements, row, first_pos))

        return OptimizerResponse()