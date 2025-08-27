class Player:
    def __init__(
        self,
        name: str,
        team: str,
        position: str,
        salary: int,
        projected: float,
        ownership: float,
    ):
        self.name = name
        self.team = team
        self.position = position
        self.salary = salary
        self.projected = projected
        self.ownership = ownership

    def __eq__(self, other):
        return self.name == other.name and self.team == other.team

    def __str__(self):
        return f"{self.name} ({self.team})"

    def csv_format(self) -> str:
        return f"{self.name},{self.team},{self.position},{self.salary},{self.projected},{self.ownership}%"
