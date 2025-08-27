import React, { useState } from 'react';
import { Lock, X, Users } from 'lucide-react';

const NFLOptimizerFrontend = () => {
  // Sample player data - replace with your actual data source
  const [players, setPlayers] = useState({
    QB: [
      { id: 1, name: 'Josh Allen', team: 'BUF', salary: 8500, projection: 22.5, status: 'available' },
      { id: 2, name: 'Lamar Jackson', team: 'BAL', salary: 8300, projection: 21.8, status: 'available' },
      { id: 3, name: 'Patrick Mahomes', team: 'KC', salary: 8100, projection: 21.2, status: 'available' },
      { id: 4, name: 'Dak Prescott', team: 'DAL', salary: 7800, projection: 19.5, status: 'available' },
    ],
    RB: [
      { id: 5, name: 'Christian McCaffrey', team: 'SF', salary: 9000, projection: 20.8, status: 'available' },
      { id: 6, name: 'Austin Ekeler', team: 'LAC', salary: 7800, projection: 18.2, status: 'available' },
      { id: 7, name: 'Derrick Henry', team: 'TEN', salary: 7600, projection: 17.9, status: 'available' },
      { id: 8, name: 'Nick Chubb', team: 'CLE', salary: 7400, projection: 17.1, status: 'available' },
      { id: 9, name: 'Alvin Kamara', team: 'NO', salary: 7200, projection: 16.8, status: 'available' },
      { id: 10, name: 'Saquon Barkley', team: 'PHI', salary: 7000, projection: 16.2, status: 'available' },
    ],
    WR: [
      { id: 11, name: 'Cooper Kupp', team: 'LAR', salary: 8800, projection: 19.5, status: 'available' },
      { id: 12, name: 'Davante Adams', team: 'LV', salary: 8600, projection: 19.2, status: 'available' },
      { id: 13, name: 'Tyreek Hill', team: 'MIA', salary: 8400, projection: 18.8, status: 'available' },
      { id: 14, name: 'Stefon Diggs', team: 'HOU', salary: 8200, projection: 18.5, status: 'available' },
      { id: 15, name: 'DeAndre Hopkins', team: 'TEN', salary: 7800, projection: 17.2, status: 'available' },
      { id: 16, name: 'Mike Evans', team: 'TB', salary: 7600, projection: 16.8, status: 'available' },
    ],
    TE: [
      { id: 17, name: 'Travis Kelce', team: 'KC', salary: 7500, projection: 16.5, status: 'available' },
      { id: 18, name: 'Mark Andrews', team: 'BAL', salary: 6800, projection: 14.2, status: 'available' },
      { id: 19, name: 'George Kittle', team: 'SF', salary: 6600, projection: 13.8, status: 'available' },
      { id: 20, name: 'T.J. Hockenson', team: 'DET', salary: 5800, projection: 11.5, status: 'available' },
    ],
    DST: [
      { id: 21, name: 'San Francisco', team: 'SF', salary: 3200, projection: 8.5, status: 'available' },
      { id: 22, name: 'Buffalo', team: 'BUF', salary: 3000, projection: 8.2, status: 'available' },
      { id: 23, name: 'Pittsburgh', team: 'PIT', salary: 2800, projection: 7.8, status: 'available' },
      { id: 24, name: 'New England', team: 'NE', salary: 2600, projection: 7.2, status: 'available' },
    ]
  });

  const [selectedPosition, setSelectedPosition] = useState('QB');

  const updatePlayerStatus = (playerId, newStatus) => {
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
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedPosition === position
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
                <p className="text-gray-600 mt-1">
                  {players[selectedPosition].filter(p => p.status === 'locked').length} locked, {' '}
                  {players[selectedPosition].filter(p => p.status === 'excluded').length} excluded
                </p>
              </div>

              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Player
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Team
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Salary
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Projection
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {players[selectedPosition].map((player) => (
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
                          {player.projection}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {(player.projection / player.salary * 1000).toFixed(1)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          <button
                            onClick={() => updatePlayerStatus(player.id, 
                              player.status === 'locked' ? 'available' : 'locked'
                            )}
                            className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                              player.status === 'locked'
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
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
                            className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                              player.status === 'excluded'
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