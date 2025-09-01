import pandas as pd
from team_matchup_pb2 import TeamMatchup, WeekMatchups

# def add_randomness_to_player_pool(player_pool: pd.DataFrame, randomness: float, matchups: WeekMatchups):
import pandas as pd
import numpy as np
from typing import Dict, Tuple
import random


def simulate_projections_with_vegas_lines(
    player_pool: pd.DataFrame,
    week_matchups: WeekMatchups,
    randomness: float = 0.5
) -> pd.DataFrame:
    """
    Simulates player projections based on sampled game outcomes from Vegas lines.
    
    Args:
        player_pool: DataFrame with columns [id, name, position, salary, points, team, opposing_team, simulated_projection]
        week_matchups: WeekMatchups protobuf message containing game data
        randomness: Float 0.0-1.0 controlling variance in sampling (0.0 = no variance, 1.0 = max variance)
    
    Returns:
        DataFrame with simulated_projection column populated
    """
    
    # Create a copy to avoid modifying the original
    df = player_pool.copy()
    
    # Build matchup lookup dict from protobuf
    matchup_data = {}
    for matchup in week_matchups.matchups:
        matchup_data[matchup.team] = {
            'opposing_team': matchup.opposing_team,
            'is_home': matchup.is_home,
            'projected_team_total': matchup.projected_team_total,
            'projected_opposing_team_total': matchup.projected_opposing_team_total,
            'over_under': matchup.over_under,
            'spread': matchup.spread,
        }
    
    # Sample game outcomes for each unique matchup
    sampled_outcomes = {}
    processed_games = set()
    
    for matchup in week_matchups.matchups:
        # Avoid processing the same game twice (both team perspectives)
        game_key = tuple(sorted([matchup.team, matchup.opposing_team]))
        if game_key in processed_games:
            continue
            
        processed_games.add(game_key)
        
        # Sample this game's outcome
        team_a = matchup.team
        team_b = matchup.opposing_team
        total = matchup.over_under
        spread = -1.0 * matchup.spread  # Positive if team_a favored
        
        # Sample with randomness control
        team_a_score, team_b_score = sample_single_game_outcome(
            total, spread, randomness
        )
        
        # Store outcomes for both teams
        sampled_outcomes[team_a] = {
            'team_score': team_a_score,
            'opponent_score': team_b_score,
            'original_total': total,
            'original_spread': spread,
        }
        sampled_outcomes[team_b] = {
            'team_score': team_b_score,
            'opponent_score': team_a_score,
            'original_total': total,
            'original_spread': -spread  # Flip spread for team_b perspective
        }
    
    # print(sampled_outcomes)
    # Apply adjustments to each player
    for idx, row in df.iterrows():
        team = row['team']
        position = row['position']
        base_projection = row['points']  # Use original points as base
        
        # If base projection is low, don't bump it up
        if team not in sampled_outcomes or base_projection < .25:
            # If no matchup data, use base projection
            df.loc[idx, 'simulated_projection'] = base_projection
            continue
        
        outcome = sampled_outcomes[team]
        
        # Calculate adjustment multiplier
        adjustment_multiplier = calculate_game_script_multiplier(
            position=position,
            team_score=outcome['team_score'],
            opponent_score=outcome['opponent_score'],
            original_total=outcome['original_total'],
            original_spread=outcome['original_spread']
        )
        
        # Apply adjustment
        simulated_projection = base_projection * adjustment_multiplier
        df.loc[idx, 'simulated_projection'] = round(simulated_projection, 2)
    
    return df


def sample_single_game_outcome(total: float, spread: float, randomness: float) -> Tuple[float, float]:
    """
    Sample a single game outcome with controlled randomness.
    
    Args:
        total: Over/under total
        spread: Point spread (positive if team_a favored)
        randomness: 0.0-1.0 variance control
    
    Returns:
        (team_a_score, team_b_score)
    """
    # Scale variance based on randomness parameter
    total_std = 14.0 * randomness  # Max std dev of 14 points for total
    spread_std = 14.0 * randomness  # Max std dev of 14 points for spread
    
    # Sample with controlled variance
    if randomness == 0.0:
        # No variance - use exact Vegas lines
        actual_total = total
        actual_differential = spread
    else:
        actual_total = np.random.normal(total, total_std)
        actual_differential = np.random.normal(spread, spread_std)
    
    # Ensure realistic minimums
    actual_total = max(actual_total, 20)
    
    # Calculate individual team scores
    team_a_score = (actual_total + actual_differential) / 2
    team_b_score = (actual_total - actual_differential) / 2
    
    # Ensure non-negative scores
    team_a_score = max(team_a_score, 0)
    team_b_score = max(team_b_score, 0)
    
    return team_a_score, team_b_score


def calculate_game_script_multiplier(
    position: str,
    team_score: float,
    opponent_score: float,
    original_total: float,
    original_spread: float
) -> float:
    """
    Calculate the projection multiplier based on game script.
    
    Args:
        position: Player position (QB, RB, WR, TE, DST, etc.)
        team_score: Sampled team score
        opponent_score: Sampled opponent score
        original_total: Original over/under
        original_spread: Original spread from team's perspective. Positive if they're favored.
    
    Returns:
        Multiplier to apply to base projection
    """
    original_team_total = (original_total + original_spread) / 2.0
    opposing_team_total = (original_total - original_spread) / 2.0
    team_differential = team_score - opponent_score
    
    # No adjustments needed
    if original_team_total == team_score:
        return 1.0
    
    # Game script categories
    won_game = team_differential > 0
    margin = abs(team_differential)
    is_blowout = margin >= 21
    
    # Position-specific multipliers
    if position == 'QB':
        return calculate_qb_multiplier(original_team_total=original_team_total, sampled_team_total=team_score, won_game=won_game, is_blowout=is_blowout)
    elif position == 'RB':
        return calculate_rb_multiplier(original_team_total=original_team_total, sampled_team_total=team_score, won_game=won_game, is_blowout=is_blowout)
    elif position in ['WR', 'TE']:
        return calculate_wr_multiplier(original_team_total=original_team_total, sampled_team_total=team_score, won_game=won_game, is_blowout=is_blowout)
    elif position == 'DST':
        return calculate_dst_multiplier(opposing_team_total=opposing_team_total, sampled_team_total=opponent_score, won_game=won_game, is_blowout=is_blowout)
    else:
        return 1.0


def calculate_qb_multiplier(original_team_total: float, sampled_team_total: float, won_game: bool, is_blowout: bool) -> float:
    """QB-specific game script multiplier"""
    multiplier = 1.0
    sample_diff = sampled_team_total - original_team_total
    multiplier += (sample_diff / original_team_total)
    if won_game:
        if is_blowout:
            multiplier -= 0.10  # Reduced due to backup risk
    else:
        if is_blowout:
            multiplier += 0.05  # Limited garbage time upside
        else:
            multiplier += 0.12  # Playing from behind
        
    return max(min(multiplier, 2.5), .5)


def calculate_rb_multiplier(original_team_total: float, sampled_team_total: float, won_game: bool, is_blowout: bool) -> float:
    """RB-specific game script multiplier"""
    multiplier = 1.0
    sample_diff = sampled_team_total - original_team_total
    multiplier += sample_diff / original_team_total
    if won_game:
        if is_blowout:
            multiplier += 0.3  # Clock control paradise
        else:
            multiplier += 0.2  # Positive game script
    else:
        if is_blowout:
            multiplier -= 0.3  # Scripted out completely
        else:
            multiplier -= 0.15  # Reduced but still some usage
        
    return max(min(multiplier, 2.5), .5)


def calculate_wr_multiplier(original_team_total: float, sampled_team_total: float, won_game: bool, is_blowout: bool) -> float:
    """WR-specific game script multiplier"""
    multiplier = 1.0
    sample_diff = sampled_team_total - original_team_total
    multiplier += sample_diff / original_team_total
    if won_game:
        if is_blowout:
            multiplier -= 0.05  # Reduced targets, backup QBs
        else:
            multiplier += 0.17  # Sustained drives, red zone looks
    else:
        if is_blowout:
            multiplier += 0.08  # Some garbage time
        else:
            multiplier += 0.2  # Playing from behind helps
        
    return max(min(multiplier, 2.5), .5)


def calculate_dst_multiplier(opposing_team_total: float, sampled_team_total: float, won_game: bool, is_blowout: bool) -> float:
    """Defense/Special Teams multiplier"""
    multiplier = 1.0
    sample_diff = sampled_team_total - opposing_team_total
    multiplier += (sample_diff / opposing_team_total) * -1.0
    
    if won_game:
        if is_blowout:
            multiplier += 0.40  # Sacks, picks, potential TDs
        else:
            multiplier += 0.25
    else:
        if is_blowout:
            multiplier -= 0.40  # On field too much, bad field position
        else:
            multiplier -= 0.15
        
    return max(min(multiplier, 2.5), 0)