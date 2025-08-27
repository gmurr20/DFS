import pandas
from old_optimizer.Player import Player

# with open("DFF_NBA_cheatsheet.csv") as projections:
#     csv_reader = csv.reader(projections, delimiter=",")
#     players = {}
#     for row in csv_reader:


def normalize_name(name: str) -> str:
    return name.lower().replace("-", " ").replace(".", "").replace("'", "")


def generate_csv():
    nba_df = pandas.read_csv("DFF_NBA_cheatsheet.csv")
    players = {}
    for ind in nba_df.index:
        name = normalize_name(f'{nba_df["first_name"][ind]} {nba_df["last_name"][ind]}')
        team = nba_df["team"][ind]
        position = nba_df["position"][ind].lower()
        salary = int(nba_df["salary"][ind])
        projected_points = float(nba_df["ppg_projection"][ind])
        players[name] = Player(
            name=name,
            team=team,
            position=position,
            salary=salary,
            projected=projected_points,
            ownership=None,
        )

    ownership_df = pandas.read_csv("Ownership.csv")
    for ind in ownership_df.index:
        name = normalize_name(ownership_df["Athlete"][ind])
        if name not in players:
            print(f"Could not find player: {name}")
            continue
        players[name].ownership = float(
            ownership_df["DK NBA Ownership Projection"][ind].strip("%")
        )

    for name, player in players.items():
        if player.projected > 3.0 and player.ownership is None:
            continue
            # print(f"Could not find player ownership {player}")
        # Change to write CSV
        print(player.csv_format())


generate_csv()
