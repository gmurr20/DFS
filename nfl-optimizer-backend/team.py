from player_pb2 import Player, Lineup

class Team:
    def __init__(self, team_requirements, salary_cap):
        self.team_requirements = team_requirements
        self.team = {}
        for pos, _ in self.team_requirements.items():
            self.team[pos] = []
        self.salary_cap = salary_cap
        self.players = set()
        self.salary = 0
        self.points = 0
    
    def __eq__(self, other):
        return self.team_requirements == other.team_requirements and self.players == other.players
    
    def __hash__(self):
        return hash(str(self.players) + str(self.team_requirements))
    
    def __lt__(self, other):
        return self.points() < other.points()
    
    def __str__(self):
        return str(self.team)

    def to_lineup(self):
        lineup = Lineup()
        final_order = ['QB', 'RB', 'WR', 'TE', 'FLEX', 'DST']
        position_to_player = {'QB': [], 'RB': [], 'WR': [], 'TE': [], 'FLEX': [], 'DST': []}
        min_count_per_flex = {'RB': 2, 'WR': 3, 'TE': 1}
        for pos, players in self.team.items():
            for player in players:
                player_proto = Player()
                player_proto.id = player['id']
                player_proto.name = player['name']
                player_proto.team = player['team']
                player_proto.position = player['position']
                player_proto.salary = player['salary']
                player_proto.points = player['points']
                player_proto.sim_points = player['simulated_projection']
                if player_proto.position in min_count_per_flex and len(position_to_player[player_proto.position]) >= min_count_per_flex[player_proto.position]:
                    position_to_player['FLEX'].append(player_proto)
                else:
                    position_to_player[player_proto.position].append(player_proto)
        for pos in final_order:
            for player in position_to_player[pos]:
                lineup.players.append(player)
        return lineup

    def points(self):
        return self.points
    
    def salary_left(self):
        return 50000 - self.salary
    
    def __str__(self):
        return f"{self.players}"
    
    def __repr__(self):
        return f"{self.players}"
    
    def is_valid(self):
        return self.salary <= 50000
    
    def team_finalized(self):
        return len(self.needs) == 0

    def contains_player(self, pos, player):
        if player['id'] in self.players:
            return True
        if pos not in self.needs:
            return True
        return False
    
    def add_player(self, player):
        self.salary += player['salary']
        self.points += player['simulated_projection']
        self.players.add(player['id'])
        position = player['position']
        # Position is filled, try to find flex
        if len(self.team[position]) == self.team_requirements[position]:
            other_positions = []
            # Find matching flex spots
            for key, _ in self.team_requirements.items():
                if position in key:
                    other_positions.append(key)
            # Go through matching flex spots until there's a match
            for pos in other_positions:
                if len(self.team[pos]) < self.team_requirements[position]:
                    self.team[pos].append(player)
                    break
        else:
            self.team[position].append(player)