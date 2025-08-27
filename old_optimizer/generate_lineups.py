import csv
from old_optimizer.Player import Player
from NBAPlayerPool import NBAPlayerPool
import random

DEFAULT_OWNERSHIP = 7.51111


def load_player_pool():
    player_list = []
    with open("player_pool.csv") as pool:
        csv_reader = csv.reader(pool, delimiter=",")
        for row in csv_reader:
            name = row[0]
            team = row[1]
            position = row[2]
            salary = int(row[3])
            projected = float(row[4])
            ownership = DEFAULT_OWNERSHIP if row[5] == "None" else float(row[5])
            player_list.append(
                Player(
                    name=name,
                    team=team,
                    position=position,
                    salary=salary,
                    projected=projected,
                    ownership=ownership,
                )
            )
    return NBAPlayerPool(players=player_list)


def grade(population):
    total_pts = 0.0
    for team in population:
        total_pts += team.total_points()
    return total_pts / len(population)


def evolution(
    population,
    ownership_threshold=100,
    keep=0.25,
    selectProbability=0.05,
    mutateProbability=0.02,
    variance=0.2,
):
    bestTeams = [
        (team.total_points_ownership(threshold=ownership_threshold), team)
        for team in population
    ]
    bestTeams = [x[1] for x in sorted(bestTeams, reverse=True)]
    numKeep = int(keep * len(population))
    parents = bestTeams[0:numKeep]

    for team in bestTeams[numKeep:]:
        if selectProbability > random.random():
            parents.append(team)

    for team in parents:
        if mutateProbability > random.random():
            team.mutate(team)

    parentsLength = len(parents)
    desiredLength = len(population) - parentsLength
    children = []
    while len(children) < desiredLength:
        dad = random.randint(0, parentsLength - 1)
        mom = random.randint(0, parentsLength - 1)
        if dad == mom:
            continue
        dad = parents[dad]
        mom = parents[mom]
        children.append(mom.breed(dad))
    newPopulation = parents + children
    return newPopulation


def main():
    player_pool = load_player_pool()
    best_teams = []
    population = [player_pool.generate_team() for _ in range(10000)]
    fitness_history = [grade(population)]
    for iteration in range(64):
        print(f"Iteration {iteration}")
        population = evolution(population)
        fitness_history.append(grade(population))
    best_teams = [(team.total_points(), team) for team in population]
    best_teams = [x[1] for x in sorted(best_teams, reverse=True)]
    choice = best_teams[0]
    for i in range(10):
        best_teams[i].print_team()


main()
