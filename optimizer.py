from player_pb2 import Player, PlayerPool
from optimizer_api_pb2 import OptimizerRequest, OptimizerResponse
import pandas as pd
import numpy as np
from team import Team
import pulp
from functools import partial

SALARY_CAP = 50000

def randomize_points(random_factor: float, initial_projection: float) -> float:
    if initial_projection <= 0:
        return 0
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
    
    def _calculate_stack_bonus(self, lineup_players: pd.DataFrame, player_vars: dict[str, int]) -> float:
        bonus = 0.0
        
        # QB + WR from same team bonus
        qbs = lineup_players[lineup_players['position'] == 'QB']
        wrs = lineup_players[lineup_players['position'] == 'WR']

        stack = False
        for _, qb in qbs.iterrows():
            if player_vars[qb['id']] != 1:
                continue
            same_team_wrs = wrs[wrs['team'] == qb['team']]
            for _, wr in same_team_wrs.iterrows():
                if player_vars[wr['id']] == 1:
                    stack = True
        if stack:
            bonus = 5.0
        
        return bonus
    
    def generate_optimal_lineup(self, player_pool: pd.DataFrame, request: OptimizerRequest):
        # 1. Define the problem
        prob = pulp.LpProblem("DraftKings Lineup Optimizer", pulp.LpMaximize)

        # 2. Decision Variables
        # Create a dictionary of binary variables, one for each player
        # Key: player_id
        # Value: LpBinary variable
        player_vars = pulp.LpVariable.dicts("Player", [p["id"] for _, p in player_pool.iterrows()], 0, 1, pulp.LpBinary)

        # 3. Objective Function: Maximize total projected points
        prob += pulp.lpSum([player_pool.loc[player_pool['id'] == p_id, 'points'].iloc[0] * player_vars[p_id] for p_id in player_vars]) + self._calculate_stack_bonus(player_pool, player_vars), "Total Projected Points"

        # 4. Constraints
        # Constraint 1: Salary Cap
        prob += pulp.lpSum([player_pool.loc[player_pool['id'] == p_id, 'salary'].iloc[0] * player_vars[p_id] for p_id in player_vars]) <= SALARY_CAP, "Salary Cap"

        # Constraint 2: Positional Requirements
        # Group players by their primary position for constraints
        total_player_count = 0
        for pos, count in self.team_requirements.items():
            players_in_current_position = player_pool[player_pool['position'].str.contains(f'^({pos})')]
            prob += pulp.lpSum([player_vars[p["id"]] for _, p in players_in_current_position.iterrows()]) >= count, f"{pos}_MinCount_{count}"
            total_player_count += count
        # Total players constraint (sum of all roster spots must be filled)
        prob += pulp.lpSum([player_vars[p_id] for p_id in player_vars]) == total_player_count, "Total Players Selected"

        # Constraint 3: Passed in requirements
        for lock in request.player_name_locks:
            prob +=  pulp.lpSum([player_vars[lock]]) == 1, f'{lock} player lock'
        if request.stack:
            qbs = player_pool[player_pool['position'].str.contains('^(QB)')]
            for _, qb in qbs.iterrows():
                qb_team = qb['team']
                qb_id = qb['id']
                
                # Find all WRs and TEs on the same team as this QB
                stack_eligible = player_pool[
                    (player_pool['team'] == qb_team) & 
                    (player_pool['position'].str.contains('^(WR|TE)'))
                ]
                
                if len(stack_eligible) > 0:  # Only add constraint if there are stackable players
                    # If QB is selected (left side = 1), then at least 1 WR/TE from same team must be selected
                    prob += (
                        pulp.lpSum([player_vars[p["id"]] for _, p in stack_eligible.iterrows()]) >= 
                        player_vars[qb_id]
                    ), f"QB_Stack_{qb_team}_{qb_id}"
        
        # Constraint 4: DST doesn't conflict with players
        # TODO(need to add this info)

        # 4. Solve the problem
        # You can specify different solvers here. PuLP uses CBC by default (open-source).
        # For better performance on larger problems, consider Gurobi, CPLEX (commercial), or GLPK (open-source).
        prob.solve()

        # No optimal solution.
        if prob.status != pulp.LpStatusOptimal:
            return None
        # Optimal solution found!
        final_team = Team(self.team_requirements, SALARY_CAP)
        for _, p in player_pool.iterrows():
            if player_vars[p["id"]].varValue == 1:
                final_team.add_player(p.to_dict())
        return final_team


    def optimize(self, request: OptimizerRequest) -> OptimizerResponse:
        unique_teams = set([])
        iterations = 1
        randomness = request.randomness
        request.num_lineups = max(request.num_lineups, 1)
        while len(unique_teams) < request.num_lineups and iterations <= 100:
            player_pool = self._add_randomness_to_player_pool(randomness)
            player_pool = player_pool[player_pool['simulated_projection'] > .5]
            iterations += 1
            potential_team = self.generate_optimal_lineup(player_pool, request)
            if potential_team is None or potential_team in unique_teams:
                randomness += .05
                continue
            unique_teams.add(potential_team)
        response = OptimizerResponse()
        for team in unique_teams:
            response.lineups.append(team.to_lineup())
        return response
        