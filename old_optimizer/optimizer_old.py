from player_pb2 import Player, PlayerPool
from optimizer_api_pb2 import OptimizerRequest, OptimizerResponse
import pandas as pd
import numpy as np
from old_optimizer.team import Team
from copy import deepcopy
import heapq
from functools import partial

def randomize_points(random_factor: float, initial_projection: float) -> float:
    if random_factor < 0:
        random_factor = 0.0
    if random_factor > 1.0:
        random_factor = 1.0
    std_dev = random_factor * initial_projection
    new_projection = np.random.normal(loc=initial_projection, scale=std_dev, size=None)
    if new_projection < 0:
        new_projection = 0
    print(initial_projection, new_projection)
    return new_projection

class Optimizer:

    def __init__(self, player_pool: PlayerPool, team_requirements: dict[str, int]):
        self.player_pool = self._convert_player_pool_to_dataframe(player_pool)
        self.team_requirements = team_requirements
    
    def _convert_player_pool_to_dataframe(self, player_pool_proto: PlayerPool) -> pd.DataFrame:
        player_data = []
        for player in player_pool_proto.players:
            row = {
                'id': player.name + "_" + player.position,
                'name': player.name,
                'position': player.position,
                'salary': player.salary,
                'points': player.points,
                'team': player.team
            }
            player_data.append(row)
        df = pd.DataFrame(player_data)
        return df
    
    def _add_randomness_to_player_pool(self, randomness: float):
        randomized_pool = self.player_pool.copy(deep=True)
        my_func = partial(randomize_points, randomness)
        randomized_pool['simulated_projection'] = randomized_pool['points'].apply(my_func)
        return randomized_pool

    def find_optimal_teams(self, curr_team, player_pool, memoized_results):
        if not curr_team.is_valid():
            return None
        team_key = str(curr_team)
        if team_key in memoized_results:
            return memoized_results[team_key]
        needs = curr_team.needs
        best_option = None
        for pos in needs:
            potential_players = player_pool[player_pool['position'].str.contains(f'^({pos})')]
            for _, player in potential_players.iterrows():
                new_team = deepcopy(curr_team)
                if not new_team.add_player(pos, player.to_dict()):
                    continue
                self.find_optimal_teams(new_team, player_pool, memoized_results)

    def optimize(self, request: OptimizerRequest) -> OptimizerResponse:
        player_pool = self._add_randomness_to_player_pool(request.randomness)

        # DFS through all possible team combos
        stack = []
        positions = list(self.team_requirements.keys())
        all_players_in_pos = player_pool[player_pool['position'].str.contains(f'^({positions[0]})')]
        for _, row_series in all_players_in_pos.iterrows():
            stack.append(Team(self.team_requirements, row_series.to_dict(), positions[0]))
        top_teams = []
        visited = set([])

        # team_needs str -> salary -> Team
        memoized = {}
        i = 0
        while len(stack) != 0:
            if i % 10 == 0:
                print(len(stack))
                print(top_teams)
            curr_team = stack.pop()
            team_as_str = str(curr_team)
            if team_as_str in memoized and curr_team.salary_left() in memoized[team_as_str]:
                team = memoized[team_as_str][curr_team.salary_left()]
                if team == None:
                    continue
                curr_team.merge_team(team)
                assert(curr_team.team_finalized())
                heapq.heappush(top_teams, curr_team)
                if len(top_teams) > 10:
                    heapq.heappop(top_teams)
                continue
            needs = curr_team.needs
            for pos in needs:
                potential_players = player_pool[player_pool['position'].str.contains(f'^({pos})')]
                for _, player in potential_players.iterrows():
                    new_team = deepcopy(curr_team)
                    if not new_team.add_player(pos, player.to_dict()):
                        continue
                    new_team_str = str(new_team)
                    if new_team_str not in memoized:
                        memoized[new_team_str] = {}
                    if not new_team.is_valid():
                        memoized[new_team_str][new_team.salary_left()] = None
                        continue
                    if new_team.team_finalized():
                        heapq.heappush(top_teams, new_team)
                        if len(top_teams) > 10:
                            heapq.heappop(top_teams)
                    else:
                        stack.append(new_team)
            i+=1
        print(top_teams)
        return OptimizerResponse()
    


    memoized = [[(-1, Team(self.team_requirements))] * (5000 + 1) for _ in range(len(positions) + 1)]
        for salary in range(5000 + 1):
            memoized[0][salary] = (0, Team(self.team_requirements))
        for pos_idx in range(1, len(positions) + 1):
            print(pos_idx)
            position = positions[pos_idx - 1]
            # Iterate through all possible salary amounts up to the cap
            for salary in range(1, 5000 + 1):
                # Iterate through each player in the current position
                players_in_current_position = player_pool[player_pool['position'].str.contains(f'^({position})')]
                players_in_current_position = players_in_current_position[players_in_current_position['salary'] < (salary * 100)]
                for _, player in players_in_current_position.iterrows():
                    player_cost = int(player["salary"] / 100)
                    player_points = player["points"]
                    # Player is too expensive.
                    if salary < player_cost or memoized[pos_idx - 1][salary - player_cost][1].contains_player(position, player):
                        continue
                    if memoized[pos_idx - 1][salary - player_cost][0] == -1:
                        continue
                    current_total_points = memoized[pos_idx - 1][salary - player_cost][0] + player_points
                    # If this player yields more points replace it.
                    if current_total_points > memoized[pos_idx][salary][0]:
                        current_team = deepcopy(memoized[pos_idx - 1][salary - player_cost][1])
                        # Might be duplicate player so don't add
                        if not current_team.add_player(position, player):
                            continue
                        memoized[pos_idx][salary] = (current_total_points, current_team)
        best_team = None
        max_total_points = 0
        for salary in range(5000 + 1):
            if memoized[len(positions)][salary][0] > max_total_points and memoized[len(positions)][salary][1].team_finalized():
                max_total_points = memoized[len(positions)][salary][0]
                best_team = memoized[len(positions)][salary][1]
        print(best_team)
        return OptimizerResponse()