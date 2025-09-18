import json
from team_matchup_pb2 import TeamMatchup, WeekMatchups
from player_pb2 import Player, Players, InjuryDesignation
import pandas as pd
from ff_overrides import player_to_pts_override
import logging


def get_projected_total(over_under: float, spread: float):
    return (over_under - spread) / 2.0


def create_spreads_proto(json_data: json, matchup_json: json):
    team_to_gametime = {}
    for matchup in matchup_json["body"]:
        team_to_gametime[matchup['home']] = int(
            float(matchup["gameTime_epoch"]))
        team_to_gametime[matchup['away']] = int(
            float(matchup["gameTime_epoch"]))

    books = ['ballybet', 'bet365', 'betmgm', 'betrivers',
             'caesars_sportsbook', 'draftkings', 'espnbet', 'fanatics', 'fanduel']
    week_matchups = []
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
            if 'totalUnder' not in spread_map[book]:
                continue
            if 'homeTeamSpread' not in spread_map[book]:
                continue
            over_under_sum += float(spread_map[book]['totalUnder'])
            home_team_spread_sum += float(spread_map[book]['homeTeamSpread']
                                          ) if spread_map[book]['homeTeamSpread'] != 'PK' else 0
            book_count += 1
        if book_count == 0:
            logging.error(f'{game} has no spread yet. Default to 44')
        over_under = over_under_sum / book_count if book_count != 0 else 44
        home_team_spread = home_team_spread_sum / \
            book_count if book_count != 0 else -.5
        home_team = TeamMatchup()
        home_team.team = home
        home_team.opposing_team = away
        home_team.is_home = True
        home_team.projected_team_total = get_projected_total(
            over_under, home_team_spread)
        home_team.projected_opposing_team_total = get_projected_total(
            over_under, -1 * home_team_spread)
        home_team.over_under = over_under
        home_team.spread = home_team_spread
        home_team.gametime_epoch = team_to_gametime[home]
        away_team = TeamMatchup()
        away_team.team = away
        away_team.opposing_team = home
        away_team.is_home = False
        away_team.projected_team_total = get_projected_total(
            over_under, -1 * home_team_spread)
        away_team.projected_opposing_team_total = get_projected_total(
            over_under, home_team_spread)
        away_team.over_under = over_under
        away_team.spread = -1.0 * home_team_spread
        away_team.gametime_epoch = team_to_gametime[away]
        week_matchups.append(home_team)
        week_matchups.append(away_team)
    sorted_matchups = sorted(week_matchups, key=lambda x: x.gametime_epoch)
    return WeekMatchups(matchups=sorted_matchups)


def calculate_draftkings_dst_points(stats):
    # DraftKings scoring values
    SACK_POINTS = 1
    INTERCEPTION_POINTS = 2
    FUMBLE_RECOVERY_POINTS = 2
    DEFENSIVE_TD_POINTS = 6
    RETURN_TD_POINTS = 6
    SAFETY_POINTS = 2
    BLOCKED_KICK_POINTS = 2

    # Points allowed scoring
    def points_allowed_score(pts_against):
        if pts_against == 0:
            return 10
        elif 1 <= pts_against <= 6:
            return 7
        elif 7 <= pts_against <= 13:
            return 4
        elif 14 <= pts_against <= 20:
            return 1
        elif 21 <= pts_against <= 27:
            return 0
        elif 28 <= pts_against <= 34:
            return -1
        else:  # 35+
            return -4

    # Calculate points for each category
    sack_pts = float(stats["sacks"]) * SACK_POINTS
    int_pts = float(stats["interceptions"]) * INTERCEPTION_POINTS
    fumble_pts = float(stats["fumbleRecoveries"]) * FUMBLE_RECOVERY_POINTS
    def_td_pts = float(stats["defTD"]) * DEFENSIVE_TD_POINTS
    return_td_pts = float(stats["returnTD"]) * RETURN_TD_POINTS
    safety_pts = float(stats["safeties"]) * SAFETY_POINTS
    block_kick_pts = float(stats["blockKick"]) * BLOCKED_KICK_POINTS
    pts_allowed_pts = points_allowed_score(float(stats["ptsAgainst"]))

    # Total fantasy points
    return (sack_pts + int_pts + fumble_pts + def_td_pts +
            return_td_pts + safety_pts + block_kick_pts + pts_allowed_pts)

# This is a hack to only grab main slate games


def is_sunday_in_time_range_pandas(date_string, time_string):
    # Parse date
    date = pd.to_datetime(date_string, format='%Y%m%d')

    # Parse time (pandas handles 12-hour format well)
    time_normalized = time_string.upper().replace('P', 'PM').replace('A', 'AM')
    time_obj = pd.to_datetime(time_normalized, format='%I:%M%p').time()

    # Check conditions
    is_sunday = date.day_name() == 'Sunday'
    is_in_range = pd.to_datetime('1:00 PM', format='%I:%M %p').time(
    ) <= time_obj <= pd.to_datetime('5:00 PM', format='%I:%M %p').time()

    return is_sunday and is_in_range


def create_player_pool(matchups: json, ff_projections: json, salaries_json: json, player_status_json: json, dk_df: pd.DataFrame) -> Players:
    team_to_opposing_team = {}
    for matchup in matchups["body"]:
        # Remove main slate filtering
        # is_main_slate = is_sunday_in_time_range_pandas(
        #     matchup["gameDate"], matchup["gameTime"])
        # if not is_main_slate:
        #     continue
        team_to_opposing_team[matchup["away"]] = matchup["home"]
        team_to_opposing_team[matchup["home"]] = matchup["away"]

    # Grab player pool and salaries
    player_dict = {}
    for player in salaries_json["body"]["draftkings"]:
        # Skip player if they're not on main slate
        if player["team"] not in team_to_opposing_team:
            continue
        player_proto = Player()
        player_proto.id = player["playerID"] if "playerID" in player else player["team"]
        player_proto.name = player["longName"]
        player_proto.team = player["team"]
        player_proto.position = player["pos"]
        player_proto.salary = int(player["salary"])
        player_proto.opposing_team = team_to_opposing_team[player["team"]]
        player_dict[player_proto.id] = player_proto

    # Use Draftkings data as source of truth for salary
    if dk_df is not None:
        for row in dk_df.itertuples():
            # Mismatch in CSV vs API for WSH abbreviation
            team_abbrev = row.TeamAbbrev
            if team_abbrev == 'WAS':
                team_abbrev = 'WSH'
            # Only mainslate
            if team_abbrev not in team_to_opposing_team:
                continue
            if row.Position == 'DST':
                player_proto = Player()
                player_proto.id = team_abbrev
                player_proto.name = row.Name
                player_proto.team = team_abbrev
                player_proto.position = row.Position
                player_proto.salary = int(row.Salary)
                player_proto.opposing_team = team_to_opposing_team[team_abbrev]
                player_dict[player_proto.id] = player_proto
            else:
                if str(row.ID) in player_dict:
                    player_dict[str(row.ID)].salary = int(row.Salary)

    # Grab fantasy projections
    for id, player in ff_projections["body"]["playerProjections"].items():
        if id not in player_dict:
            # print(f"Can't find '{player["longName"]}'")
            continue
        player_dict[id].points = float(player["fantasyPointsDefault"]["PPR"])
        if id in player_to_pts_override:
            logging.info(
                f'Player {player["longName"]}, Projected {player_dict[id].points}, Override {player_to_pts_override[id]}')
            player_dict[id].points = player_to_pts_override[id]
    for id, dst in ff_projections["body"]["teamDefenseProjections"].items():
        team_id = dst["teamAbv"]
        if team_id not in player_dict:
            # print(f"Can't find DST {team_id}")
            continue
        player_dict[team_id].points = calculate_draftkings_dst_points(dst)

    # Add status and adjust points
    if player_status_json is not None:
        status_map = {'Questionable': InjuryDesignation.QUESTIONABLE,
                      'Out': InjuryDesignation.OUT, 'Injured Reserve': InjuryDesignation.IR, 'Doubtful': InjuryDesignation.DOUBTFUL}
        for player_info in player_status_json['body']:
            id = player_info['playerID']
            if 'injury' not in player_info:
                continue
            designation = player_info['injury']['designation']
            if designation not in status_map or id not in player_dict:
                continue
            player_dict[id].injury_status = status_map[designation]
            if player_dict[id].injury_status in [InjuryDesignation.IR, InjuryDesignation.OUT]:
                player_dict[id].points = 0

    # Clean data to player pool
    player_pool = Players()
    for _, player in player_dict.items():
        player_pool.players.append(player)

    return player_pool
