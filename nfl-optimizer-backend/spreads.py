import json
from team_matchup_pb2 import TeamMatchup, WeekMatchups

def get_projected_total(over_under: float, spread: float):
    return (over_under - spread) / 2.0

def create_spreads_proto(json_data: json):
    books = ['ballybet', 'bet365', 'betmgm', 'betrivers', 'caesars_sportsbook', 'draftkings', 'espnbet', 'fanatics', 'fanduel']
    week_matchups = WeekMatchups()
    for game, spread_map in json_data['body'].items():
        teams = game[len('20250907_'):].split('@')
        away = teams[0]
        home = teams[1]
        over_under_sum = 0.0
        home_team_spread_sum = 0.0
        book_count = 0
        for book in books:
            if book not in spread_map:
                continue
            over_under_sum += float(spread_map[book]['totalOver'])
            home_team_spread_sum += float(spread_map[book]['homeTeamSpread']) if spread_map[book]['homeTeamSpread'] != 'PK' else 0
            book_count += 1
        over_under = over_under_sum / book_count
        home_team_spread = home_team_spread_sum / book_count
        home_team = TeamMatchup()
        home_team.team = home
        home_team.opposing_team = away
        home_team.is_home = True
        home_team.projected_team_total = get_projected_total(over_under, home_team_spread)
        home_team.projected_opposing_team_total = get_projected_total(over_under, -1 * home_team_spread)
        home_team.over_under = over_under
        home_team.spread = home_team_spread
        away_team = TeamMatchup()
        away_team.team = away
        away_team.opposing_team = home
        away_team.is_home = False
        away_team.projected_team_total = get_projected_total(over_under, -1 * home_team_spread)
        away_team.projected_opposing_team_total = get_projected_total(over_under, home_team_spread)
        away_team.over_under = over_under
        away_team.spread = -1.0 * home_team_spread
        week_matchups.matchups.append(home_team)
        week_matchups.matchups.append(away_team)
    return week_matchups
    
