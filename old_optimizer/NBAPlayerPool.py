from old_optimizer.Player import Player
import random
from NBATeam import NBATeam


class NBAPlayerPool:
    def __init__(self, players: list[Player]):
        self.player_dict = {}
        self.position_to_players = {
            "pg": [],
            "sg": [],
            "sf": [],
            "pf": [],
            "c": [],
            "g": [],
            "f": [],
            "util": [],
        }
        for player in players:
            player_key = f"{player}"
            self.player_dict[player_key] = player
            self.position_to_players[player.position].append(player_key)
            if "g" in player.position:
                self.position_to_players["g"].append(player_key)
            if "f" in player.position:
                self.position_to_players["f"].append(player_key)
            self.position_to_players["util"].append(player_key)

    def generate_team(self):
        new_team = {}
        new_team_set = set([])
        for pos, players in self.position_to_players.items():
            curr_player = random.sample(players, 1)[0]
            while f"{curr_player}" in new_team_set:
                curr_player = random.sample(players, 1)[0]
            new_team_set.add(curr_player)
            new_team[pos] = self.player_dict[curr_player]
        return NBATeam(position_to_player=new_team)
