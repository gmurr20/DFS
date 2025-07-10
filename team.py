class Team:
    def __init__(self, team_requirements, player, pos):
        self.team_requirements = team_requirements
        self.team = {}
        self.players = set()
        self.needs = []
        for pos, count in self.team_requirements.items():
            for i in range(count):
                self.needs.append(pos)
        self.add_player(pos, player)
    
    def __eq__(self, other):
        return self.team_requirements == other.team_requirements and self.team == other.team
    
    def __hash__(self):
        return hash(str(self.team) + str(self.team_requirements))
    
    def __lt__(self, other):
        return self.points() < other.points()

    def points(self):
        points = 0.0
        salary = 0
        for pos, player in self.team.items():
            points += player['simulated_projection']
            salary += player['salary']
            if salary > 50000:
                return -1
        return points
    
    def is_valid(self):
        return self.points() != -1
    
    def team_finalized(self):
        return self.needs.empty()
    
    def needs(self):
        return self.needs
    
    def add_player(self, pos, player):
        if player['id'] in self.players:
            return
        if pos not in self.needs:
            return
        self.needs.remove(pos)
        self.players.add(player['id'])
        self.team[pos] = player