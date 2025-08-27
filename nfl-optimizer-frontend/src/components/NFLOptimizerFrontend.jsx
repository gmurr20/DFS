import React, { useState, useEffect } from 'react';
import { Lock, X, Users, ChevronUp, ChevronDown } from 'lucide-react';

import protobuf from 'protobufjs';

const FLASK_BASE_URL = 'http://localhost:8888';

const NFLOptimizerFrontend = () => {
  const [players, setPlayers] = useState({
    QB: [],
    RB: [],
    WR: [],
    TE: [],
    DST: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch players from API
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${FLASK_BASE_URL}/getPlayers`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Get the response as array buffer for protobuf parsing
        const arrayBuffer = await response.arrayBuffer();

        // Define the protobuf schema
        const root = protobuf.Root.fromJSON({
          "nested": {
            "Player": {
              "fields": {
                "id": { "type": "string", "id": 1 },
                "name": { "type": "string", "id": 2 },
                "team": { "type": "string", "id": 3 },
                "position": { "type": "string", "id": 4 },
                "salary": { "type": "int32", "id": 5 },
                "points": { "type": "float", "id": 6 },
                "opposing_team": { "type": "string", "id": 7 }
              }
            },
            "Players": {
              "fields": {
                "players": { "rule": "repeated", "type": "Player", "id": 1 }
              }
            },
            "GetPlayersResponse": {
              "fields": {
                "players": { "type": "Players", "id": 1 }
              }
            }
          }
        });

        const GetPlayersResponse = root.lookupType("GetPlayersResponse");
        const message = GetPlayersResponse.decode(new Uint8Array(arrayBuffer));
        const object = GetPlayersResponse.toObject(message, {
          longs: String,
          enums: String,
          bytes: String
        });

        // Group players by position and add status field
        const groupedPlayers = {
          QB: [],
          RB: [],
          WR: [],
          TE: [],
          DST: []
        };

        object.players.players.forEach(player => {
          const formattedPlayer = {
            id: player.id,
            name: player.name,
            team: player.team,
            salary: player.salary,
            projection: player.points || 0, // Default to 0 if no projection
            status: 'available'
          };

          if (groupedPlayers[player.position]) {
            groupedPlayers[player.position].push(formattedPlayer);
          }
        });

        setPlayers(groupedPlayers);
        setError(null);
      } catch (err) {
        console.error('Error fetching players:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  const [selectedPosition, setSelectedPosition] = useState('QB');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Position limits for locking (base requirements + flex)
  const BASE_REQUIREMENTS = {
    QB: 1,
    RB: 2,
    WR: 3,
    TE: 1,
    DST: 1
  };
  const MAX_REQUIREMENTS = {
    QB: 1,
    RB: 3,
    WR: 4,
    TE: 2,
    DST: 1
  };

  const FLEX_ELIGIBLE = ['RB', 'WR', 'TE']; // Positions that can fill flex
  const MAX_FLEX = 1; // Only 1 flex spot
  const MAX_TOTAL_LOCKED = 9;
  const MAX_SALARY_CAP = 50000;

  const updatePlayerStatus = (playerId, newStatus) => {
    // If trying to lock a player, check restrictions
    if (newStatus === 'locked') {
      const allLockedPlayers = getAllLockedPlayers();
      const currentPosition = getCurrentPlayerPosition(playerId);
      const currentPositionLocked = getLockedPlayersInPosition(currentPosition);
      const totalLocked = allLockedPlayers.length;
      const totalSalary = calculateTotalSalary(allLockedPlayers, playerId);

      // Check position limit
      if (currentPositionLocked.length >= MAX_REQUIREMENTS[currentPosition]) {
        alert(`Cannot lock more than ${MAX_REQUIREMENTS[currentPosition]} ${currentPosition} player${MAX_REQUIREMENTS[currentPosition] > 1 ? 's' : ''}.`);
        return;
      }

      // Check total locked limit
      if (totalLocked >= MAX_TOTAL_LOCKED) {
        alert(`Cannot lock more than ${MAX_TOTAL_LOCKED} players total.`);
        return;
      }

      // Check salary cap
      if (totalSalary > MAX_SALARY_CAP) {
        alert(`Locking this player would exceed the salary cap of ${MAX_SALARY_CAP.toLocaleString()}.`);
        return;
      }
    }

    setPlayers(prevPlayers => {
      const newPlayers = { ...prevPlayers };
      Object.keys(newPlayers).forEach(position => {
        newPlayers[position] = newPlayers[position].map(player =>
          player.id === playerId ? { ...player, status: newStatus } : player
        );
      });
      return newPlayers;
    });
  };

  // Helper functions for restrictions
  const getAllLockedPlayers = () => {
    const allLocked = [];
    Object.keys(players).forEach(position => {
      const locked = players[position].filter(p => p.status === 'locked');
      allLocked.push(...locked);
    });
    return allLocked;
  };

  const getCurrentPlayerPosition = (playerId) => {
    for (const position of Object.keys(players)) {
      const player = players[position].find(p => p.id === playerId);
      if (player) return position;
    }
    return null;
  };

  const getLockedPlayersInPosition = (position) => {
    return players[position].filter(p => p.status === 'locked');
  };

  const calculateTotalSalary = (lockedPlayers, additionalPlayerId = null) => {
    let total = lockedPlayers.reduce((sum, player) => sum + player.salary, 0);

    // If adding a new player, include their salary
    if (additionalPlayerId) {
      const additionalPlayer = findPlayerById(additionalPlayerId);
      if (additionalPlayer) {
        total += additionalPlayer.salary;
      }
    }

    return total;
  };

  const findPlayerById = (playerId) => {
    for (const position of Object.keys(players)) {
      const player = players[position].find(p => p.id === playerId);
      if (player) return player;
    }
    return null;
  };

  const clearAllFilters = () => {
    setPlayers(prevPlayers => {
      const newPlayers = { ...prevPlayers };
      Object.keys(newPlayers).forEach(position => {
        newPlayers[position] = newPlayers[position].map(player => ({
          ...player,
          status: 'available'
        }));
      });
      return newPlayers;
    });
  };

  // Calculate how many flex spots are currently used
  const getFlexUsed = () => {
    let flexUsed = 0;
    FLEX_ELIGIBLE.forEach(position => {
      const locked = getLockedPlayersInPosition(position).length;
      const base = BASE_REQUIREMENTS[position];
      if (locked > base) {
        flexUsed += (locked - base);
      }
    });
    return flexUsed;
  };

  // Check if a player can be locked in a position considering flex rules
  const canLockPlayerInPosition = (position) => {
    const currentPositionLocked = getLockedPlayersInPosition(position);
    const baseRequired = BASE_REQUIREMENTS[position];

    // Non-flex positions (QB, DST) - simple check
    if (!FLEX_ELIGIBLE.includes(position)) {
      if (currentPositionLocked.length >= baseRequired) {
        return {
          allowed: false,
          message: `Cannot lock more than ${baseRequired} ${position} player${baseRequired > 1 ? 's' : ''}.`
        };
      }
      return { allowed: true };
    }

    // Flex-eligible positions (RB, WR, TE)
    const flexUsed = getFlexUsed();
    const currentlyInPosition = currentPositionLocked.length;

    // If we haven't met base requirements, allow locking
    if (currentlyInPosition < baseRequired) {
      return { allowed: true };
    }

    // If we've met base requirements, check if flex is available
    if (flexUsed >= MAX_FLEX) {
      return {
        allowed: false,
        message: `Cannot lock more ${position} players. Base requirement (${baseRequired}) met and flex spot is occupied.`
      };
    }

    return { allowed: true };
  };

  // Helper function to calculate value safely
  const calculateValue = (projection, salary) => {
    if (!projection || !salary || salary === 0) return 0;
    return (projection / salary * 1000);
  };
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedPlayers = (playerList) => {
    if (!sortConfig.key) return playerList;

    return [...playerList].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle different data types
      if (sortConfig.key === 'name') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      } else if (sortConfig.key === 'salary' || sortConfig.key === 'projection') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else if (sortConfig.key === 'value') {
        aValue = calculateValue(a.projection, a.salary);
        bValue = calculateValue(b.projection, b.salary);
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronUp className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100" />;
    }
    return sortConfig.direction === 'asc'
      ? <ChevronUp className="w-4 h-4 text-blue-600" />
      : <ChevronDown className="w-4 h-4 text-blue-600" />;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'locked': return 'bg-green-100 border-green-500';
      case 'excluded': return 'bg-red-100 border-red-500';
      default: return 'bg-white border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'locked': return <Lock className="w-4 h-4 text-green-600" />;
      case 'excluded': return <X className="w-4 h-4 text-red-600" />;
      default: return null;
    }
  };

  const positions = Object.keys(players);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading players...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            Error loading players: {error}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">NFL Daily Fantasy Optimizer</h1>
                <p className="text-gray-600 mt-1">Lock or exclude players to customize your lineup optimization</p>
              </div>
            </div>
          </div>

          <div className="flex">
            {/* Position Sidebar */}
            <div className="w-48 border-r border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Positions</h3>
              <nav className="space-y-1">
                {positions.map(position => (
                  <button
                    key={position}
                    onClick={() => setSelectedPosition(position)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${selectedPosition === position
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    {position} ({players[position].length})
                  </button>
                ))}
              </nav>
            </div>

            {/* Player Table */}
            <div className="flex-1 p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedPosition} Players</h2>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-gray-600">
                    {players[selectedPosition].filter(p => p.status === 'locked').length} locked, {' '}
                    {players[selectedPosition].filter(p => p.status === 'excluded').length} excluded
                  </p>
                  <div className="text-sm text-gray-600">
                    <span className="mr-4">
                      <button
                        onClick={clearAllFilters}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-700 transition-colors"
                      >
                        Clear Filters
                      </button>
                    </span>
                    <span className="mr-4">
                      Total Locked: {getAllLockedPlayers().length}/{MAX_TOTAL_LOCKED}
                    </span>
                    <span className="mr-4">
                      Flex Used: {getFlexUsed()}/{MAX_FLEX}
                    </span>
                    <span>
                      Salary: ${calculateTotalSalary(getAllLockedPlayers()).toLocaleString()}/${MAX_SALARY_CAP.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide cursor-pointer hover:bg-gray-100 group"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center justify-between">
                          Player
                          {getSortIcon('name')}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide cursor-pointer hover:bg-gray-100 group"
                        onClick={() => handleSort('team')}
                      >
                        <div className="flex items-center justify-between">
                          Team
                          {getSortIcon('team')}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide cursor-pointer hover:bg-gray-100 group"
                        onClick={() => handleSort('salary')}
                      >
                        <div className="flex items-center justify-between">
                          Salary
                          {getSortIcon('salary')}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide cursor-pointer hover:bg-gray-100 group"
                        onClick={() => handleSort('projection')}
                      >
                        <div className="flex items-center justify-between">
                          Projection
                          {getSortIcon('projection')}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide cursor-pointer hover:bg-gray-100 group"
                        onClick={() => handleSort('value')}
                      >
                        <div className="flex items-center justify-between">
                          Value
                          {getSortIcon('value')}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getSortedPlayers(players[selectedPosition]).map((player) => (
                      <tr
                        key={player.id}
                        className={`transition-colors ${getStatusColor(player.status)}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 mr-2">
                              {getStatusIcon(player.status)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{player.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {player.team}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${player.salary.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {(player.projection || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {calculateValue(player.projection, player.salary).toFixed(1)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          <button
                            onClick={() => updatePlayerStatus(player.id,
                              player.status === 'locked' ? 'available' : 'locked'
                            )}
                            disabled={player.status !== 'locked' && (
                              !canLockPlayerInPosition(selectedPosition).allowed ||
                              getAllLockedPlayers().length >= MAX_TOTAL_LOCKED ||
                              calculateTotalSalary(getAllLockedPlayers(), player.id) > MAX_SALARY_CAP
                            )}
                            className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium transition-colors ${player.status === 'locked'
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : (!canLockPlayerInPosition(selectedPosition).allowed ||
                                getAllLockedPlayers().length >= MAX_TOTAL_LOCKED ||
                                calculateTotalSalary(getAllLockedPlayers(), player.id) > MAX_SALARY_CAP)
                                ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700'
                              }`}
                          >
                            <Lock className="w-3 h-3 mr-1" />
                            {player.status === 'locked' ? 'Locked' : 'Lock'}
                          </button>
                          <button
                            onClick={() => updatePlayerStatus(player.id,
                              player.status === 'excluded' ? 'available' : 'excluded'
                            )}
                            className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium transition-colors ${player.status === 'excluded'
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-700'
                              }`}
                          >
                            <X className="w-3 h-3 mr-1" />
                            {player.status === 'excluded' ? 'Excluded' : 'Exclude'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Optimize Lineup
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFLOptimizerFrontend;