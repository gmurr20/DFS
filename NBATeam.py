import random
from Player import Player

NBA_POSITIONS = ["pg", "sg", "sf", "c", "pf", "g", "f", "util"]


class NBATeam:
    def __init__(self, position_to_player: dict[Player]):
        self.players = position_to_player
        self.player_set = set(
            [
                f"{self.players['pg']}",
                f"{self.players['sg']}",
                f"{self.players['sf']}",
                f"{self.players['pf']}",
                f"{self.players['c']}",
                f"{self.players['g']}",
                f"{self.players['f']}",
                f"{self.players['util']}",
            ]
        )

    def __lt__(self, other):
        return self.total_points() < other.total_points()

    def print_team(self):
        total_salary = 0
        projected_pts = 0
        ownership = 0
        for pos, player in self.players.items():
            print(pos, player.csv_format())
            total_salary += player.salary
            projected_pts += player.projected
            ownership += player.ownership
        print(total_salary)
        print(projected_pts)
        print(f"{ownership}")

    def total_points(self):
        total_salary = 0
        projected_pts = 0
        for pos, player in self.players.items():
            total_salary += player.salary
            projected_pts += player.projected
        if total_salary > 50000:
            return 0
        return projected_pts

    def total_points_ownership(self, threshold=100):
        ownership = 0
        for pos, player in self.players.items():
            ownership += player.ownership
        if ownership > threshold:
            return 0
        return self.total_points()

    def mutate(self, other):
        pos = random.choice(NBA_POSITIONS)
        other_team_sample = other.players[pos]
        if f"{other_team_sample}" in self.player_set:
            return
        self.player_set.remove(f"{self.players[pos]}")
        self.players[pos] = other_team_sample
        self.player_set.add(f"{other_team_sample}")

    def breed(self, other):
        new_team = {}
        new_team_set = set([])
        for pos in NBA_POSITIONS:
            pick_team = random.randint(0, 1)
            if pick_team == 0 and f"{self.players[pos]}" not in new_team_set:
                new_team[pos] = self.players[pos]
            elif f"{other.players[pos]}" not in new_team_set:
                new_team[pos] = other.players[pos]
            else:
                return self
            new_team_set.add(f"{new_team[pos]}")
        return NBATeam(position_to_player=new_team)
