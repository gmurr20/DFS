#!/usr/bin/python
#idea from: http://sambrady3.github.io/knapsack.html thank you for showing me about genetic algorithms!

import random
import time
from FinalizeData import finalizeData
from operator import add
global allEligiblePlayers
print "getting players and projected points"
allEligiblePlayers = finalizeData()
print "got points"
global qb, rb, wr, te, dst, flex
qb = [allEligiblePlayers[player] for player in allEligiblePlayers if allEligiblePlayers[player].position == "QB"]
rb = [allEligiblePlayers[player] for player in allEligiblePlayers if allEligiblePlayers[player].position == "RB"]
wr = [allEligiblePlayers[player] for player in allEligiblePlayers if allEligiblePlayers[player].position == "WR"]
te = [allEligiblePlayers[player] for player in allEligiblePlayers if allEligiblePlayers[player].position == "TE"]
dst = [allEligiblePlayers[player] for player in allEligiblePlayers if allEligiblePlayers[player].position == "DST"]
flex = [allEligiblePlayers[player] for player in allEligiblePlayers if allEligiblePlayers[player].position != "DST" and allEligiblePlayers[player].position != "QB"]

def generateRandomTeam():
	team = {'qb' : random.sample(qb,1),
	'rb' : random.sample(rb,2),
	'wr' : random.sample(wr,3),
	'te' : random.sample(te,1),
	'flex' : random.sample(flex,1),
	'dst' : random.sample(dst,1)
	}
	while (team['flex'][0] in team['rb'] or team['flex'][0] in team['te'] or team['flex'][0] in team['wr']):
		team['flex'] = random.sample(flex,1)
	return team

def createPopulation(count):
	population = []
	for i in range(count):
		population.append(generateRandomTeam())
	return population

def getTeamPointTotal(team):
    points = 0
    for key in team:
        for player in team[key]:
            points += player.projected_pts
    return points

def getTeamSalary(team):
    salary = 0
    for key in team:
        for player in team[key]:
            salary += player.salary
    return salary

def printTeam(team):
    print team['qb'][0]
    print team['rb'][0]
    print team['rb'][1]
    print team['wr'][0]
    print team['wr'][1]
    print team['wr'][2]
    print team['te'][0]
    print team['flex'][0]
    print team['dst'][0]

def teamStrength(team):
	points = getTeamPointTotal(team)
	salary = getTeamSalary(team)
	if salary > 50000:
		points = 0
	return points

def breed(mom, dad):
	children = []
	for i in range(2):
		child = {}
		qblist = set(mom['qb'] + dad['qb'])
		child['qb'] = random.sample(qblist, 1)
		
		rblist = set(mom['rb'] + dad['rb'])
		child['rb'] = random.sample(rblist, 2)

		wrlist = set(mom['wr'] + dad['wr'])
		child['wr'] = random.sample(wrlist, 3)

		telist = set(mom['te'] + dad['te'])
		child['te'] = random.sample(telist, 1)

		flexlist = set(mom['flex']+dad['flex'])-set(rblist | wrlist | telist)
		if len(flexlist) == 0:
			flexlist = set(rblist|wrlist|telist)-set(child['rb']+child['wr']+child['te'])
		child['flex'] = random.sample(flexlist, 1)
		dstlist = set(mom['dst'] + dad['dst'])
		child['dst'] = random.sample(dstlist, 1)
		children.append(child)
	return children

def mutate(team):
    positions = ['qb','rb','wr','te','flex','dst']
    pos = random.choice(positions)
    if pos == 'qb':
        team['qb'][0] = random.choice(qb)
    elif pos == 'rb':
        team['rb'] = random.sample(rb,2)
    elif pos == 'wr':
        team['wr'] = random.sample(wr,3)
    elif pos == 'te':
        team['te'][0] = random.choice(te)
    elif pos == 'flex':
        team['flex'][0] = random.choice(flex)
    elif pos == 'dst':
        team['dst'][0] = random.choice(dst)
   #  while (team['flex'][0] in team['rb'] or team['flex'][0] in team['wr'] or team['flex'][0] in team['te']):
			# team['flex'] = random.sample(flex, 1)
    return team

def evolution(population, keep=.4, selectProbability=.05, mutateProbability=.01):
	bestTeams = [ (teamStrength(team), team) for team in population]
	bestTeams = [ x[1] for x in sorted(bestTeams, reverse=True) ]
	numKeep = int(keep*len(population))
	parents = bestTeams[0:numKeep]

	for team in bestTeams[numKeep:]:
		if selectProbability > random.random():
			parents.append(team)

	for team in parents:
		if mutateProbability > random.random():
			team = mutate(team)

	parentsLength = len(parents)
	desiredLength = len(population) - parentsLength
	children = []
	while len(children) < desiredLength:
	    dad = random.randint(0, parentsLength-1)
	    mom = random.randint(0, parentsLength-1)
	    if dad != mom:
	        dad = parents[dad]
	        mom = parents[mom]
	        kids = breed(mom,dad)
	        for kid in kids:
	            children.append(kid)
	newPopulation = parents + children
	return newPopulation

def grade(pop):
    summed = reduce(add, (teamStrength(team) for team in pop))
    return summed / (len(pop) * 1.0)

def main():
	best_teams=[]
	history = []
	print "a"
	p = createPopulation(10000)
	fitness_history = [grade(p)]
	print "b"
	for i in range(40):
		print str(i)
		p = evolution(p)
		fitness_history.append(grade(p))
		valid_teams = [ team for team in p if getTeamSalary(team) <= 50000]
		valid_teams = sorted(valid_teams, key=getTeamPointTotal, reverse=True)
		if len(valid_teams) > 0:
			best_teams.append(valid_teams[0])
	for datum in fitness_history:
		history.append(datum)
	best_teams = sorted(best_teams, key=getTeamSalary, reverse=True)
	choice = best_teams[0]
	printTeam(choice)
	print getTeamSalary(choice)
	print getTeamPointTotal(choice)

main()