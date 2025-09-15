from typing import List
from player_pb2 import Players, Player
from team_matchup_pb2 import WeekMatchups
from google.protobuf import text_format
from optimizer_api_pb2 import OptimizerRequest, OptimizerResponse
import pandas as pd
import numpy as np
import pulp
from team import Team
from adjust_projection_for_game_script import simulate_projections_with_vegas_lines
import json
from pulp import PULP_CBC_CMD

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
    def __init__(self, player_pool: Players, spreads: WeekMatchups, team_requirements: dict[str, List], num_players: int):
        self.player_pool = self._convert_player_pool_to_dataframe(player_pool)
        self.team_requirements = team_requirements
        self.num_players = num_players
        self.matchups = spreads
    
    def _convert_player_pool_to_dataframe(self, player_pool_proto: Players) -> pd.DataFrame:
        player_data = []
        for player in player_pool_proto.players:
            row = {
                'id': player.id,
                'name': player.name,
                'position': player.position,
                'salary': player.salary,
                'points': player.points,
                'team': player.team,
                'opposing_team': player.opposing_team,
                'injury_status': player.injury_status
            }
            player_data.append(row)
        df = pd.DataFrame(player_data)
        return df
    
    def generate_optimal_lineup(self, player_pool: pd.DataFrame, request: OptimizerRequest):
        # 1. Define the problem
        prob = pulp.LpProblem("DraftKings Lineup Optimizer", pulp.LpMaximize)

        # 2. Decision Variables
        # Create a dictionary of binary variables, one for each player
        # Key: player_id
        # Value: LpBinary variable
        player_vars = pulp.LpVariable.dicts("Player", [p["id"] for _, p in player_pool.iterrows()], 0, 1, pulp.LpBinary)

        # 3. Objective Function: Maximize total projected points
        prob += pulp.lpSum([player_pool.loc[player_pool['id'] == p_id, 'simulated_projection'].iloc[0] * player_vars[p_id] for p_id in player_vars]), "Total Projected Points"

        # 4. Constraints
        # Constraint 1: Salary Cap
        prob += pulp.lpSum([player_pool.loc[player_pool['id'] == p_id, 'salary'].iloc[0] * player_vars[p_id] for p_id in player_vars]) <= SALARY_CAP, "Salary Cap"

        # Constraint 2: Positional Requirements
        # Group players by their primary position for constraints
        for pos, select_range in self.team_requirements.items():
            min_count = select_range[0]
            max_count = select_range[1]
            players_in_current_position = player_pool[player_pool['position'].str.contains(f'^{pos}')]
            prob += pulp.lpSum([player_vars[p["id"]] for _, p in players_in_current_position.iterrows()]) >= min_count, f"{pos}_MinCount_{min_count}"
            prob += pulp.lpSum([player_vars[p["id"]] for _, p in players_in_current_position.iterrows()]) <= max_count, f"{pos}_MaxCount_{max_count}"
        # Total players constraint (sum of all roster spots must be filled)
        prob += pulp.lpSum([player_vars[p_id] for p_id in player_vars]) == self.num_players, "Total Players Selected"

        # Constraint 3: Passed in requirements
        for team in request.teams_to_exclude:
            players_on_team = player_pool[player_pool['team'] == team]
            prob += pulp.lpSum([player_vars[player['id']] for _, player in players_on_team.iterrows()]) == 0, f'Exclude {team}'
        for lock in request.player_id_locks:
            prob += player_vars[lock] == 1, f'{player_vars[lock]} player lock'
        for exclude in request.player_id_excludes:
            prob +=  player_vars[exclude] == 0, f'{player_vars[exclude]} player exclude'
        if request.stack:
            # Get all QBs
            all_qbs = player_pool[player_pool['position'] == 'QB']
            
            for _, qb in all_qbs.iterrows():
                qb_team = qb['team']
                qb_id = qb['id']
                
                # Get all WR/TE from the same team
                same_team_receivers = player_pool[
                    (player_pool['team'] == qb_team) & 
                    (player_pool['position'].isin(['WR', 'TE']))
                ]
                if len(same_team_receivers) > 0:
                    # If this QB is selected, at least one receiver from same team must be selected
                    # Using Big-M method: if QB selected (=1), then sum(receivers) >= 1
                    # This translates to: sum(receivers) >= player_vars[qb_id]
                    prob += (
                        pulp.lpSum([player_vars[rec['id']] for _, rec in same_team_receivers.iterrows()]) >= 
                        player_vars[qb_id]
                    ), f"Stack_QB_{qb['name'].replace(' ', '_')}"
            
                if request.run_back:
                    qb_opposing_team = qb['opposing_team']
                    # Get all opposing RB/WR/TE from the same team
                    opposing_team_flex = player_pool[
                        (player_pool['team'] == qb_opposing_team) & 
                        (player_pool['position'].isin(['RB', 'WR', 'TE']))
                    ]
                    if len(opposing_team_flex) > 0:
                        # If this QB is selected, at least one receiver from same team must be selected
                        # Using Big-M method: if QB selected (=1), then sum(receivers) >= 1
                        # This translates to: sum(receivers) >= player_vars[qb_id]
                        prob += (
                            pulp.lpSum([player_vars[rec['id']] for _, rec in opposing_team_flex.iterrows()]) >= 
                            player_vars[qb_id]
                        ), f"Runback_QB_{qb['name'].replace(' ', '_')}"


        if request.no_opposing_defense:
            defenses = player_pool[player_pool['position'] == 'DST'] 
            for _, defense in defenses.iterrows():
                defense_team = defense['team']
                defense_id = defense['id']
                
                # Find all non-defense players whose opposing_team matches the defense's team
                opposing_players = player_pool[(player_pool['opposing_team'] == defense_id)]
                opposing_players = opposing_players[opposing_players['position'] != 'DST']
                if len(opposing_players) > 0:
                    # Defense can't be selected if any opposing team player is selected
                    # This constraint: sum(opposing_players) <= (0 if defense selected otherwise 9)
                    prob += (
                        pulp.lpSum([player_vars[p["id"]] for _, p in opposing_players.iterrows()]) <= 9 * (1- player_vars[defense_id])
                    ), f"Defense_Opposition_{defense_team}_{defense_id}"

        # 4. Solve the problem
        # You can specify different solvers here. PuLP uses CBC by default (open-source).
        # For better performance on larger problems, consider Gurobi, CPLEX (commercial), or GLPK (open-source).
        prob.solve(PULP_CBC_CMD(msg=0))

        # No optimal solution.
        if prob.status != pulp.LpStatusOptimal:
            print('Could not find optimal solution')
            return None
        # Optimal solution found!
        final_team = Team(self.team_requirements, SALARY_CAP)
        players = 0
        for _, p in player_pool.iterrows():
            if player_vars[p["id"]].varValue == 1:
                final_team.add_player(p.to_dict())
                players += 1
        return final_team


    def optimize(self, request: OptimizerRequest) -> OptimizerResponse:
        response = OptimizerResponse()
        if self.player_pool.empty:
            return response
        unique_teams = set([])
        iterations = 1
        randomness = max(request.randomness, 0.0)
        request.num_lineups = max(request.num_lineups, 1)
        while len(unique_teams) < request.num_lineups and iterations <= 20:
            player_pool = simulate_projections_with_vegas_lines(player_pool=self.player_pool, week_matchups=self.matchups, randomness=randomness)
            iterations += 1
            potential_team = self.generate_optimal_lineup(player_pool, request)
            if potential_team is None:
                break
            if potential_team in unique_teams:
                randomness += .05
                continue
            unique_teams.add(potential_team)
            if randomness == 0.0:
                randomness += .05
        for team in unique_teams:
            response.lineups.append(team.to_lineup())
        response.lineups.sort(key=lambda l: sum(p.sim_points for p in l.players), reverse=True)
        return response
        