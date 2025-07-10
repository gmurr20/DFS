from player_pb2 import Player, PlayerPool
from optimizer_api_pb2 import OptimizerRequest, OptimizerResponse
import pandas as pd
import numpy as np
from team import Team
from copy import deepcopy
import heapq

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

        # DFS through all possible team combos
        stack = []
        positions = self.team_requirements.keys
        all_players_in_pos = player_pool['position'].str.contains(f'^({positions[0]})')
        for row in all_players_in_pos.itertuples():
            stack.append(Team(self.team_requirements, row, positions[0]))
        top_teams = []
        visited = set([])
        while len(stack) != 0:
            curr_team = stack.pop()
            if curr_team in visited:
                continue
            visited.add(curr_team)
            needs = curr_team.needs()
            for pos in needs:
                potential_players = player_pool['position'].str.contains(f'^({pos})')
                for player in potential_players:
                    new_team = deepcopy(curr_team)
                    new_team.add(player, pos)
                    if not new_team.is_valid():
                        continue
                    if new_team.team_finalized():
                        heapq.heappush(top_teams, new_team)
                        if len(heapq) > 10:
                            heapq.heappop(top_teams)
                    else:
                        stack.append(new_team)
        return OptimizerResponse()