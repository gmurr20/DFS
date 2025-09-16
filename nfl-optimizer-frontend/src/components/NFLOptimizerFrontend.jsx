import { useState, useEffect } from 'react';
import { Lock, X, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';

import { GetPlayersResponse, OptimizerRequest, OptimizerResponse, GetMatchupsResponse } from './compiled.js';

const FLASK_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8888';

// Token management utilities
const getToken = () => localStorage.getItem('nfl-optimizer-token');
const setToken = (token) => localStorage.setItem('nfl-optimizer-token', token);
const removeToken = () => localStorage.removeItem('nfl-optimizer-token');

const LoginForm = ({ onLogin, error }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState(error || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');

    try {
      const response = await fetch(`${FLASK_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setToken(data.token);
      onLogin();
      setPassword('');
    } catch (err) {
      console.error('Login error:', err);
      setLoginError(err.message || 'Login failed');
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="text-center mb-8">
              <img
                src="./assets/logo.png"
                alt="Optimizer Logo"
                className="w-40 h-40 mx-auto mb-4 rounded-lg object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">NFL Optimizer</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {loginError && (
                <p className="mt-2 text-sm text-red-600">{loginError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'Access Optimizer'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const NFLOptimizerFrontend = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [players, setPlayers] = useState({
    QB: [],
    RB: [],
    WR: [],
    TE: [],
    FLEX: [], // Virtual position for flex-eligible players
    DST: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizedLineup, setOptimizedLineup] = useState(null);

  const [week, setWeek] = useState('');

  const [matchups, setMatchups] = useState([]);
  const [excludedTeams, setExcludedTeams] = useState(new Set());
  const [showMatchups, setShowMatchups] = useState(false);
  const [contestPreset, setContestPreset] = useState('main');
  const [availablePresets, setAvailablePresets] = useState([]);
  const [dataLoaded, setDataLoaded] = useState({ players: false, matchups: false });

  // Optimizer settings
  const [randomness, setRandomness] = useState(0);
  const [numLineups, setNumLineups] = useState(1);
  const [stack, setStack] = useState(true);
  const [runBack, setRunBack] = useState(true);
  const [noOpposingDefense, setNoOpposingDefense] = useState(true);

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${FLASK_BASE_URL}/verify-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.valid) {
            setIsAuthenticated(true);
            setAuthError('');
          } else {
            setIsAuthenticated(false);
            setAuthError('Session expired. Please log in again.');
            removeToken();
          }
        } else {
          setIsAuthenticated(false);
          setAuthError('Session expired. Please log in again.');
          removeToken();
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setIsAuthenticated(false);
        setAuthError('Unable to verify authentication. Please try logging in again.');
        removeToken();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setAuthError('');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthError('');
    removeToken();
    setPlayers({
      QB: [],
      RB: [],
      WR: [],
      TE: [],
      FLEX: [],
      DST: [],
    });
    setMatchups([]);
    setExcludedTeams(new Set());
  };

  // Add this helper function to check if there are any players
  const hasAnyPlayers = () => {
    return Object.keys(players).some(position =>
      position !== 'FLEX' && players[position].length > 0
    );
  };

  // API helper function with authentication
  const makeAuthenticatedRequest = async (url, options = {}) => {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token');
    }

    const authOptions = {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      },
    };

    const response = await fetch(url, authOptions);

    if (response.status === 401) {
      // Token expired or invalid
      setIsAuthenticated(false);
      setAuthError('Session expired. Please log in again.');
      removeToken();
      throw new Error('Authentication expired');
    }

    return response;
  };

  // Fetch players from API
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const response = await makeAuthenticatedRequest(`${FLASK_BASE_URL}/getPlayers`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Get the response as array buffer for protobuf parsing
        const arrayBuffer = await response.arrayBuffer();
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
          FLEX: [], // Will be populated separatey
          DST: [],
        };

        setWeek(object.week);

        if (object.players && object.players.players && object.players.players.length > 0) {
          object.players.players.forEach(player => {
            const formattedPlayer = {
              id: player.id,
              name: player.name,
              team: player.team,
              opposingTeam: player.opposingTeam,
              salary: player.salary,
              projection: player.points || 0, // Default to 0 if no projection
              status: 'available',
              injuryStatus: player.injuryStatus
            };

            if (groupedPlayers[player.position]) {
              groupedPlayers[player.position].push(formattedPlayer);
            }
          });
        }

        // Populate FLEX with all WR, RB, and TE players
        groupedPlayers.FLEX = [
          ...groupedPlayers.WR,
          ...groupedPlayers.RB,
          ...groupedPlayers.TE
        ];

        setPlayers(groupedPlayers);
        setDataLoaded(prev => ({ ...prev, players: true }));
        setError(null);
      } catch (err) {
        console.error('Error fetching players:', err);
        if (err.message !== 'Authentication expired') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [isAuthenticated]);

  // Fetch matchups from API
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchMatchups = async () => {
      try {
        const response = await makeAuthenticatedRequest(`${FLASK_BASE_URL}/getMatchups`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Get the response as array buffer for protobuf parsing
        const arrayBuffer = await response.arrayBuffer();
        const message = GetMatchupsResponse.decode(new Uint8Array(arrayBuffer));
        const object = GetMatchupsResponse.toObject(message, {
          longs: String,
          enums: String,
          bytes: String
        });

        if (object.matchups && object.matchups.matchups) {
          setMatchups(object.matchups.matchups);
          const presets = categorizeGamesByTime(object.matchups.matchups);
          setAvailablePresets(presets);
          setDataLoaded(prev => ({ ...prev, matchups: true }));
        }
      } catch (err) {
        console.error('Error fetching matchups:', err);
        // Don't set error state for matchups since it's not critical
      }
    };

    fetchMatchups();
  }, [isAuthenticated]);

  useEffect(() => {
    if (dataLoaded.players && dataLoaded.matchups && availablePresets.length > 0) {
      const defaultPreset = 'main';
      const presetExists = availablePresets.find(p => p.key === defaultPreset);

      if (presetExists && contestPreset === defaultPreset) {
        console.log('Applying default preset after both data sets loaded');
        applyContestPreset(defaultPreset);
      }
    }
  }, [dataLoaded.players, dataLoaded.matchups, availablePresets]);

  const [selectedPosition, setSelectedPosition] = useState('QB');
  const [sortConfig, setSortConfig] = useState({ key: 'salary', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const PLAYERS_PER_PAGE = 50;

  // Minimum requirements per position.
  const BASE_REQUIREMENTS = {
    QB: 1,
    RB: 2,
    WR: 3,
    TE: 1,
    DST: 1
  };
  // The maximum locks per position.
  const MAX_REQUIREMENTS = {
    QB: 1,
    RB: 3,
    WR: 4,
    TE: 2,
    DST: 1
  };

  const FLEX_ELIGIBLE = ['RB', 'WR', 'TE'];
  const MAX_FLEX = 1;
  const MAX_TOTAL_LOCKED = 9;
  const MAX_SALARY_CAP = 50000;

  const toggleTeamExclusion = (team) => {
    setExcludedTeams(prev => {
      const newSet = new Set(prev);
      if (newSet.has(team)) {
        newSet.delete(team);
      } else {
        newSet.add(team);
      }
      return newSet;
    });
  };

  const clearTeamExclusions = () => {
    setExcludedTeams(new Set());
    applyContestPreset(contestPreset);
  };

  // Format game time from epoch timestamp
  const formatGameTime = (epochTime) => {
    if (!epochTime) return 'TBD';
    const date = new Date(parseInt(epochTime) * 1000);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Format spread display
  const formatSpread = (spread, team, opposingTeam, isHome) => {
    if (!spread) return 'N/A';
    const spreadValue = parseFloat(spread);
    if (spreadValue === 0) return 'PK';

    // If spread is positive, the team is favored by that amount
    // If spread is negative, the team is an underdog by that amount
    const displayTeam = isHome ? team : opposingTeam;
    const roundedSpread = Math.abs(spreadValue).toFixed(1);

    if (spreadValue > 0) {
      return `${displayTeam} +${roundedSpread}`;
    } else {
      return `${displayTeam} -${roundedSpread}`;
    }
  };

  const categorizeGamesByTime = (matchups) => {
    const presets = {
      all: { name: 'All Games', teams: [] },
      main: { name: "Main Slate", teams: [] },
      thursday: { name: 'Thursday Night', teams: [] },
      friday: { name: 'Friday', teams: [] },
      saturday: { name: 'Saturday', teams: [] },
      early: { name: 'Early Only', teams: [] },
      late: { name: 'Afternoon Only', teams: [] },
      sunday_night: { name: 'Sunday Night', teams: [] },
      monday_night: { name: 'Monday Night', teams: [] }
    };

    matchups.forEach(matchup => {
      if (!matchup.gametimeEpoch) return;

      const gameDate = new Date(parseInt(matchup.gametimeEpoch) * 1000);

      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Chicago',
        weekday: 'long',
        hour: 'numeric',
        hour12: false
      });

      const parts = formatter.formatToParts(gameDate);
      const dayOfWeek = parts.find(part => part.type === 'weekday').value;
      const hour = parts.find(part => part.type === 'hour').value;

      const teams = [matchup.team, matchup.opposingTeam];

      // Thursday games
      if (dayOfWeek === 'Thursday') {
        presets.thursday.teams.push(...teams);
      }
      // Sunday games
      else if (dayOfWeek === 'Sunday') {
        if (hour >= 18 && hour <= 23) { // 6pm-11pm CT (Sunday Night)
          presets.sunday_night.teams.push(...teams);
        } else if (hour >= 12 && hour <= 14) { // 12pm-2pm CT
          presets.early.teams.push(...teams);
          presets.main.teams.push(...teams);
        } else if (hour >= 15 && hour <= 17) { // 3pm-5pm CT
          presets.late.teams.push(...teams);
          presets.main.teams.push(...teams);
        }
      }
      else if (dayOfWeek === 'Monday') {
        presets.monday_night.teams.push(...teams);
      }
      else if (dayOfWeek === 'Friday') {
        presets.friday.teams.push(...teams);
      }
      else if (dayOfWeek === 'Saturday') {
        presets.saturday.teams.push(...teams);
      }
      else {
        console.error('Game on unknown day:', dayOfWeek);
      }
    });

    // Filter out empty presets and return only those with games
    return Object.entries(presets)
      .filter(([key, preset]) => key === 'all' || preset.teams.length > 0)
      .map(([key, preset]) => ({ key, ...preset }));
  };

  const applyContestPreset = (presetKey) => {
    console.log('applyContestPreset', presetKey);
    setContestPreset(presetKey);

    if (presetKey === 'all') {
      setExcludedTeams(new Set());
      return;
    }

    const selectedPreset = availablePresets.find(p => p.key === presetKey);
    if (!selectedPreset) return;

    // Get all teams from all matchups
    const allTeams = new Set();
    matchups.forEach(matchup => {
      allTeams.add(matchup.team);
      allTeams.add(matchup.opposingTeam);
    });

    // Exclude teams that are NOT in the selected preset
    const teamsInPreset = new Set(selectedPreset.teams);
    const teamsToExclude = [...allTeams].filter(team => !teamsInPreset.has(team));

    setExcludedTeams(new Set(teamsToExclude));
    setCurrentPage(1); // Reset pagination
  };

  // Show loading state during initial auth check
  if (loading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} error={authError} />;
  }

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
        if (position === 'FLEX') return; // Skip FLEX as its virtual
        newPlayers[position] = newPlayers[position].map(player =>
          player.id === playerId ? { ...player, status: newStatus } : player
        );
      });

      // Update FLEX array with updated players
      newPlayers.FLEX = [
        ...newPlayers.WR,
        ...newPlayers.RB,
        ...newPlayers.TE
      ];

      return newPlayers;
    });
  };

  // Helper function for restrictions
  const getAllLockedPlayers = () => {
    const allLocked = [];
    Object.keys(players).forEach(position => {
      if (position === 'FLEX') return; // Skip FLEX as it's virtual
      const locked = players[position].filter(p => p.status === 'locked');
      allLocked.push(...locked);
    });
    return allLocked;
  };

  const getCurrentPlayerPosition = (playerId) => {
    for (const position of Object.keys(players)) {
      if (position === 'FLEX') continue; // Skip FLEX as it's virtual
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
    clearTeamExclusions();
    setPlayers(prevPlayers => {
      const newPlayers = { ...prevPlayers };
      Object.keys(newPlayers).forEach(position => {
        if (position === 'FLEX') return;
        newPlayers[position] = newPlayers[position].map(player => ({
          ...player,
          status: 'available'
        }));
      });

      // Update FLEX array with cleared players
      newPlayers.FLEX = [
        ...newPlayers.WR,
        ...newPlayers.RB,
        ...newPlayers.TE
      ];

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

  // Shortens the player name on mobile
  const formatPlayerNameMobile = (fullName) => {
    if (fullName.length > 12) {
      const nameParts = fullName.split(' ');
      if (nameParts.length >= 2) {
        const firstName = nameParts[0];

        // Check if the name contains "Jr." and use full second name
        if (nameParts.length >= 3 && nameParts[2] === "Jr.") {
          const secondName = nameParts[1];
          return formatPlayerNameMobile(`${firstName} ${secondName}`);
        } else {
          const secondNameInitial = nameParts[1].charAt(0);
          return `${firstName} ${secondNameInitial}.`;
        }
      }
    }
    return fullName;
  };

  // Get string from player status
  const getPlayerStatus = (player) => {
    if (player.injuryStatus === "OUT") {
      return "OUT";
    }
    else if (player.injuryStatus === "IR") {
      return "IR";
    }
    else if (player.injuryStatus === "QUESTIONABLE") {
      return "Q";
    }
    else if (player.injuryStatus === "DOUBTFUL") {
      return "D";
    }
    return "";
  };

  const getPlayerStatusMobile = (player) => {
    if (player.injuryStatus === "OUT") {
      return "O";
    }
    else if (player.injuryStatus === "IR") {
      return "IR";
    }
    else if (player.injuryStatus === "QUESTIONABLE") {
      return "Q";
    }
    else if (player.injuryStatus === "DOUBTFUL") {
      return "D";
    }
    return "";
  };

  // Function to handle lineup optimization
  const handleOptimizeLineup = async () => {
    try {
      setOptimizing(true);
      setError(null);

      // Collect all locked player IDs
      const lockedPlayerIds = [];
      Object.keys(players).forEach(position => {
        if (position === 'FLEX') return; // Skip FLEX as it's virtual
        const locked = players[position].filter(p => p.status === 'locked');
        lockedPlayerIds.push(...locked.map(p => p.id));
      });

      // Collect all excluded player IDs
      const excludedPlayerIds = [];
      Object.keys(players).forEach(position => {
        if (position === 'FLEX') return; // Skip FLEX as it's virtual
        const excluded = players[position].filter(p => p.status === 'excluded');
        excludedPlayerIds.push(...excluded.map(p => p.id));
      });

      // Create the OptimizerRequest message
      const request = OptimizerRequest.create({
        playerIdLocks: lockedPlayerIds,
        playerIdExcludes: excludedPlayerIds,
        randomness: randomness,
        numLineups: numLineups,
        stack: stack,
        noOpposingDefense: noOpposingDefense,
        runBack: runBack,
        teamsToExclude: Array.from(excludedTeams)
      });

      console.log('OptimizerRequest:', request);

      // Encode the request to bytes
      const requestBytes = OptimizerRequest.encode(request).finish();

      // Send the request to the backend
      const response = await makeAuthenticatedRequest(`${FLASK_BASE_URL}/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        body: requestBytes
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the response as array buffer for protobuf parsing
      const arrayBuffer = await response.arrayBuffer();

      // Decode the OptimizerResponse
      const optimizerResponse = OptimizerResponse.decode(new Uint8Array(arrayBuffer));
      const responseObject = OptimizerResponse.toObject(optimizerResponse, {
        longs: String,
        enums: String,
        bytes: String
      });
      console.log('Optimized Lineup:', responseObject);
      setOptimizedLineup(responseObject);

    } catch (err) {
      console.error('Error optimizing lineup:', err);
      if (err.message !== 'Authentication expired') {
        setError(`Failed to optimize lineup: ${err.message}`);
      }
    } finally {
      setOptimizing(false);
    }
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

  // Add this helper function to filter players based on excluded teams
  const getFilteredPlayers = (playerList) => {
    if (excludedTeams.size === 0) return playerList;
    return playerList.filter(player => !excludedTeams.has(player.team));
  };

  // Update your existing getPaginatedPlayers function
  const getPaginatedPlayers = (playerList) => {
    const filteredPlayers = getFilteredPlayers(playerList);
    const sortedPlayers = getSortedPlayers(filteredPlayers);
    const startIndex = (currentPage - 1) * PLAYERS_PER_PAGE;
    const endIndex = startIndex + PLAYERS_PER_PAGE;
    return sortedPlayers.slice(startIndex, endIndex);
  };

  // Update getTotalPages to use filtered count
  const getTotalPages = (playerList) => {
    const filteredPlayers = getFilteredPlayers(playerList);
    return Math.ceil(filteredPlayers.length / PLAYERS_PER_PAGE);
  };


  // Reset to page 1 when position changes
  const handlePositionChange = (position) => {
    setSelectedPosition(position);
    setCurrentPage(1);
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
          <div className="space-x-2">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Retry
            </button>
            <button
              onClick={handleLogout}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="border-b border-gray-200 p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-start space-x-3">
                <div>
                  <img
                    src="./assets/logo.png"
                    alt="Optimizer Logo"
                    className="w-12 md:w-20 h-12 md:h-20 rounded-lg object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-xl md:text-3xl font-bold text-gray-900">DFS Optimizer</h1>
                  <p className="text-gray-600 mt-1 text-sm md:text-base">It's milly maker time</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-gray-600 text-white px-3 md:px-4 py-2 rounded text-xs md:text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                Logout
              </button>
            </div>

            {/* Week Display */}
            {week && (
              <div className="mt-4">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <h2 className="text-lg md:text-xl font-semibold text-gray-800">
                      NFL Week {week} 2025
                    </h2>
                  </div>
                </div>
              </div>
            )}

            {/* Optimizer Settings */}
            <div className="mt-4 md:mt-6 bg-gray-50 rounded-lg p-3 md:p-4">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Optimizer Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {/* Randomness Slider */}
                <div>
                  <label htmlFor="randomness" className="block text-sm font-medium text-gray-700 mb-2">
                    Randomness: {randomness.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    id="randomness"
                    min="0"
                    max="1"
                    step="0.01"
                    value={randomness}
                    onChange={(e) => setRandomness(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0 (Optimal)</span>
                    <span>1 (Random)</span>
                  </div>
                </div>

                {/* Number of Lineups */}
                <div>
                  <label htmlFor="numLineups" className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Lineups
                  </label>
                  <input
                    type="number"
                    id="numLineups"
                    min="1"
                    max="10"
                    value={numLineups}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '') {
                        setNumLineups(''); // Allow empty temporarily
                      } else {
                        const x = parseInt(value) || 1;
                        const clampedValue = Math.min(Math.max(x || 1, 1), 10); // min=1, max=10
                        setNumLineups(clampedValue);
                      }
                    }}
                    onBlur={(e) => {
                      // Set to 1 if still empty when user leaves field
                      if (e.target.value === '') {
                        setNumLineups(1);
                      }
                    }}
                    inputMode="numeric"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Stack Checkbox */}
                <div>
                  <div className="flex items-center h-full">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={stack}
                        onChange={(e) => setStack(e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        Stack Players
                      </span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">QB with same-team receivers/TEs</p>
                </div>
                {/* Run Back Checkbox */}
                <div>
                  <div className="flex items-center h-full">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={runBack}
                        onChange={(e) => setRunBack(e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        Run it back
                      </span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Play an opposing player from your primary stack</p>
                </div>
                {/* No Opposing Defense Checkbox */}
                <div>
                  <div className="flex items-center h-full">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={noOpposingDefense}
                        onChange={(e) => setNoOpposingDefense(e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        No Opposing Defense
                      </span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Avoid defenses playing against your players</p>
                </div>
              </div>
            </div>

            {/* Matchups Dropdown */}
            {matchups.length > 0 && (
              <div className="mt-4 md:mt-6">
                <div className="bg-gray-50 rounded-lg border border-gray-200">
                  <button
                    onClick={() => setShowMatchups(!showMatchups)}
                    className="w-full px-3 md:px-4 py-2 md:py-3 flex items-center justify-between text-left hover:bg-gray-100 transition-colors rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm md:text-base font-semibold text-gray-900">
                        Week {week} Matchups
                      </h3>
                      {excludedTeams.size > 0 && (
                        <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                          {excludedTeams.size} teams excluded
                        </span>
                      )}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showMatchups ? 'rotate-180' : ''}`} />
                  </button>

                  {showMatchups && (
                    <div className="border-t border-gray-200 p-3 md:p-4 bg-white rounded-b-lg">
                      {/* Contest Presets - Top on Mobile */}
                      {availablePresets.length > 1 && (
                        <div className="mb-4 lg:hidden">
                          <h3 className="text-sm font-semibold text-gray-900 mb-2">Contest</h3>
                          <div className="flex flex-wrap gap-1">
                            {availablePresets.map(preset => (
                              <button
                                key={preset.key}
                                onClick={() => applyContestPreset(preset.key)}
                                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${contestPreset === preset.key
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                  }`}
                              >
                                {preset.name}
                                {preset.teams.length > 0 && (
                                  <span className="ml-1 opacity-75">
                                    ({preset.teams.length / 2})
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Table and Presets Side by Side on Desktop */}
                      <div className="flex flex-col lg:flex-row gap-4">
                        {/* Table */}
                        <div className="flex-1 overflow-x-auto">
                          <table className="w-full text-xs md:text-sm">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="text-left py-2 pr-4 font-medium text-gray-700">Matchup</th>
                                <th className="text-left py-2 pr-3 font-medium text-gray-700 hidden sm:table-cell">Time</th>
                                <th className="text-left py-2 pr-3 font-medium text-gray-700">Spread</th>
                                <th className="text-left py-2 pr-3 font-medium text-gray-700">O/U</th>
                                <th className="text-left py-2 font-medium text-gray-700">Exclude</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {matchups.map((matchup, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="py-2 pr-4 text-left">
                                    <div className="text-gray-900">
                                      {matchup.isHome ? (
                                        <span className="text-xs md:text-sm">
                                          {matchup.opposingTeam}&nbsp;@&nbsp;{matchup.team}
                                        </span>
                                      ) : (
                                        <span className="text-xs md:text-sm">
                                          {matchup.team}&nbsp;@&nbsp;{matchup.opposingTeam}
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-xs text-gray-500 sm:hidden">
                                      {formatGameTime(matchup.gametimeEpoch)}
                                    </div>
                                  </td>
                                  <td className="py-2 pr-3 text-gray-700 hidden sm:table-cell text-left">
                                    {formatGameTime(matchup.gametimeEpoch)}
                                  </td>
                                  <td className="py-2 pr-3 text-gray-700 text-left">
                                    {formatSpread(matchup.spread, matchup.team, matchup.opposingTeam, matchup.isHome)}
                                  </td>
                                  <td className="py-2 pr-3 text-gray-700 text-left">
                                    {matchup.overUnder ? parseFloat(matchup.overUnder).toFixed(1) : 'N/A'}
                                  </td>
                                  <td className="py-2 text-left">
                                    <div className="flex items-center space-x-1">
                                      <button
                                        onClick={() => toggleTeamExclusion(matchup.team)}
                                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium transition-colors ${excludedTeams.has(matchup.team)
                                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                            : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-700'
                                          }`}
                                        title={excludedTeams.has(matchup.team) ? `Remove ${matchup.team} exclusion` : `Exclude ${matchup.team}`}
                                      >
                                        <X className="w-2.5 h-2.5 mr-0.5" />
                                        {matchup.team}
                                      </button>
                                      <button
                                        onClick={() => toggleTeamExclusion(matchup.opposingTeam)}
                                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium transition-colors ${excludedTeams.has(matchup.opposingTeam)
                                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                            : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-700'
                                          }`}
                                        title={excludedTeams.has(matchup.opposingTeam) ? `Remove ${matchup.opposingTeam} exclusion` : `Exclude ${matchup.opposingTeam}`}
                                      >
                                        <X className="w-2.5 h-2.5 mr-0.5" />
                                        {matchup.opposingTeam}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Contest Presets Sidebar - Desktop Only */}
                        {availablePresets.length > 1 && (
                          <div className="hidden lg:block lg:w-64 lg:flex-shrink-0">
                            <div className="bg-gray-50 rounded-lg p-3">
                              <h3 className="text-sm font-semibold text-gray-900 mb-3">Contest Selection</h3>
                              <div className="space-y-2">
                                {availablePresets.map(preset => (
                                  <button
                                    key={preset.key}
                                    onClick={() => applyContestPreset(preset.key)}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${contestPreset === preset.key
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                      }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span>{preset.name}</span>
                                      {preset.teams.length > 0 && (
                                        <span className="text-xs opacity-75">
                                          {preset.teams.length / 2}
                                          &nbsp;games
                                        </span>
                                      )}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Summary and Controls */}
            <div className="mt-4 md:mt-6">
              <div className="bg-blue-50 rounded-lg p-3 md:p-4 mb-4 md:mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-6">
                    <div className="text-sm">
                      <span className="font-semibold text-blue-800">Total Locked:</span>
                      <span className="ml-1 text-blue-700">{getAllLockedPlayers().length}/{MAX_TOTAL_LOCKED}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold text-blue-800">Flex Used:</span>
                      <span className="ml-1 text-blue-700">{getFlexUsed()}/{MAX_FLEX}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold text-blue-800">Salary:</span>
                      <span className="ml-1 text-blue-700">
                        ${calculateTotalSalary(getAllLockedPlayers()).toLocaleString()} / ${MAX_SALARY_CAP.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={clearAllFilters}
                    className="bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>

              {/* Player Lists */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Locked Players */}
                <div className="bg-green-50 rounded-lg p-3 md:p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Lock className="w-5 h-5 text-green-600" />
                      <h3 className="text-base md:text-lg font-semibold text-green-800">Locked Players</h3>
                      <span className="bg-green-200 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                        {getAllLockedPlayers().length}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {getAllLockedPlayers().length === 0 ? (
                      <p className="text-green-600 text-sm italic">No players locked</p>
                    ) : (
                      getAllLockedPlayers().map((player) => {
                        const position = getCurrentPlayerPosition(player.id);
                        return (
                          <div key={player.id} className="flex items-center justify-between bg-white rounded px-3 py-2">
                            <div className="flex items-center space-x-2 min-w-0 flex-1">
                              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                                {position}
                              </span>
                              <span className="text-sm font-medium text-gray-900 truncate">{player.name}</span>
                              <span className="text-xs text-gray-500 sm:inline">({player.team})</span>
                              <span className="text-xs text-red-500 sm:inline">{getPlayerStatus(player)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-600">${player.salary.toLocaleString()}</span>
                              <button
                                onClick={() => updatePlayerStatus(player.id, 'available')}
                                className="text-red-600 hover:text-red-800 text-xs"
                                title="Remove lock"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Excluded Players */}
                <div className="bg-red-50 rounded-lg p-3 md:p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <X className="w-5 h-5 text-red-600" />
                      <h3 className="text-base md:text-lg font-semibold text-red-800">Excluded Players</h3>
                      <span className="bg-red-200 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                        {Object.keys(players).filter(pos => pos !== 'FLEX').map(position =>
                          players[position].filter(p => p.status === 'excluded')
                        ).flat().length}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {Object.values(players).flat().filter(p => p.status === 'excluded').length === 0 ? (
                      <p className="text-red-600 text-sm italic">No players excluded</p>
                    ) : (
                      Object.keys(players).filter(pos => pos !== 'FLEX').map(position =>
                        players[position].filter(p => p.status === 'excluded')
                      ).flat().map((player) => {
                        const position = getCurrentPlayerPosition(player.id);
                        return (
                          <div key={player.id} className="flex items-center justify-between bg-white rounded px-3 py-2">
                            <div className="flex items-center space-x-2 min-w-0 flex-1">
                              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                                {position}
                              </span>
                              <span className="text-sm font-medium text-gray-900 truncate">{player.name}</span>
                              <span className="text-xs text-gray-500 sm:inline">({player.team})</span>
                              <span className="text-xs text-red-500 sm:inline">{getPlayerStatus(player)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-600">${player.salary.toLocaleString()}</span>
                              <button
                                onClick={() => updatePlayerStatus(player.id, 'available')}
                                className="text-green-600 hover:text-green-800 text-xs"
                                title="Remove exclusion"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Optimize Lineup Button */}
              <div className="mt-4 md:mt-6 flex justify-center">
                <button
                  onClick={handleOptimizeLineup}
                  disabled={optimizing}
                  className="w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {optimizing && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  )}
                  {optimizing ? 'Optimizing...' : 'Optimize Lineup'}
                </button>
              </div>

              {/* Optimized Lineup Display */}
              {optimizedLineup && (
                <div className="mt-4 md:mt-6 bg-purple-50 rounded-lg p-3 md:p-4">
                  <div className="mb-4">
                    <h3 className="text-base md:text-lg font-semibold text-purple-800">Optimized Lineup</h3>
                  </div>

                  {optimizedLineup.lineups && optimizedLineup.lineups.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                      {optimizedLineup.lineups.map((lineup, lineupIndex) => (
                        <div key={lineupIndex} className="bg-white rounded-lg p-4 border border-purple-200">
                          <h4 className="text-md font-semibold text-purple-800 mb-3">
                            Lineup {lineupIndex + 1}
                          </h4>

                          <div className="space-y-1.5 mb-4">
                            {lineup.players && lineup.players.map((player, playerIndex) => (
                              <div key={`${player.position}-${playerIndex}`} className="flex items-center justify-between bg-gray-50 rounded px-2 py-1.5">
                                <div className="flex items-center space-x-1.5 min-w-0 flex-1">
                                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-1.5 py-0.5 rounded">
                                    {player.position}
                                  </span>
                                  <div className="min-w-0">
                                    <span className="text-xs font-medium text-gray-900 truncate block">
                                      {player.name} ({player.team})  <span className="text-red-900">{getPlayerStatus(player)}</span>
                                    </span>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end">
                                  <span className="text-xs text-green-700 font-medium">${player.salary?.toLocaleString()}</span>
                                  <div className="text-xs">
                                    <span className="hidden md:inline">
                                      <div className="text-gray-600">Base: {player.points?.toFixed(2)}</div>
                                    </span>
                                    <div className="text-purple-700 font-bold">Sim: {player.simPoints?.toFixed(2)}</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="border-t border-purple-200 pt-2">
                            <div className="space-y-1">
                              <div className="text-xs">
                                <span className="font-bold text-green-800">Salary:</span>
                                <span className="ml-1 font-bold text-green-700">
                                  ${lineup.players ?
                                    lineup.players
                                      .reduce((sum, player) => sum + (player.salary || 0), 0)
                                      .toLocaleString() : '0'
                                  }
                                </span>
                              </div>
                              <div className="text-xs">
                                <span className="font-semibold text-purple-800">Simulated Points:</span>
                                <span className="ml-1 text-purple-700 font-bold">
                                  {lineup.players ?
                                    lineup.players
                                      .reduce((sum, player) => sum + (player.simPoints || 0), 0)
                                      .toFixed(2) : '0.00'
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-purple-600 text-sm italic">No valid lineup could be generated with the current constraints.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row">
            {/* Mobile Position Selector - Show above table on mobile */}
            <div className="lg:hidden border-b border-gray-200 p-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Positions</h3>
              <div className="flex flex-wrap gap-2">
                {positions.map(position => (
                  <button
                    key={position}
                    onClick={() => handlePositionChange(position)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${selectedPosition === position
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 border border-gray-300'
                      }`}
                  >
                    {position} ({getFilteredPlayers(players[position]).length})
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-48 border-r border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Positions</h3>
              <nav className="space-y-1">
                {positions.map(position => (
                  <button
                    key={position}
                    onClick={() => handlePositionChange(position)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${selectedPosition === position
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    {position} ({getFilteredPlayers(players[position]).length})
                  </button>
                ))}
              </nav>
            </div>

            {/* Player Table */}
            {hasAnyPlayers() ? (
              <div className="flex-1 p-3 md:p-6">
                <div className="mb-4 md:mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">{selectedPosition} Players</h2>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center mt-4 gap-4">
                    <div className="text-sm text-gray-600">
                      Showing {((currentPage - 1) * PLAYERS_PER_PAGE) + 1} to {Math.min(currentPage * PLAYERS_PER_PAGE, players[selectedPosition].length)} of {players[selectedPosition].length} players
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-600">
                        Page {currentPage} of {getTotalPages(players[selectedPosition])}
                      </span>
                      <button
                        onClick={() => setCurrentPage(Math.min(getTotalPages(players[selectedPosition]), currentPage + 1))}
                        disabled={currentPage === getTotalPages(players[selectedPosition])}
                        className="px-3 py-1 rounded border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          className="px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide cursor-pointer hover:bg-gray-100 group"
                          onClick={() => handleSort('name')}
                        >
                          <div className="flex items-center justify-between">
                            Player
                            {getSortIcon('name')}
                          </div>
                        </th>
                        <th
                          className="px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide cursor-pointer hover:bg-gray-100 group"
                          onClick={() => handleSort('team')}
                        >
                          <div className="flex items-center justify-between">
                            Team
                            {getSortIcon('team')}
                          </div>
                        </th>
                        <th
                          className="px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide cursor-pointer hover:bg-gray-100 group hidden md:table-cell"
                          onClick={() => handleSort('opposingTeam')}
                        >
                          <div className="flex items-center justify-between">
                            Opp
                            {getSortIcon('opposingTeam')}
                          </div>
                        </th>
                        <th
                          className="px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide cursor-pointer hover:bg-gray-100 group"
                          onClick={() => handleSort('salary')}
                        >
                          <div className="flex items-center justify-between">
                            Salary
                            {getSortIcon('salary')}
                          </div>
                        </th>
                        <th
                          className="px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide cursor-pointer hover:bg-gray-100 group"
                          onClick={() => handleSort('projection')}
                        >
                          <div className="flex items-center justify-between">
                            Proj
                            {getSortIcon('projection')}
                          </div>
                        </th>
                        <th
                          className="px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide cursor-pointer hover:bg-gray-100 group sm:table-cell"
                          onClick={() => handleSort('value')}
                        >
                          <div className="flex items-center justify-between">
                            Value
                            {getSortIcon('value')}
                          </div>
                        </th>
                        <th className="px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getPaginatedPlayers(players[selectedPosition]).map((player) => (
                        <tr
                          key={player.id}
                          className={`transition-colors ${getStatusColor(player.status)}`}
                        >
                          <td className="text-left px-2 md:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 mr-2">
                                {getStatusIcon(player.status)}
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  <span className="md:hidden">{formatPlayerNameMobile(player.name)}</span>
                                  <span className="hidden md:inline">{player.name}</span>
                                  <span className="ml-2 text-red-600 hidden md:inline">{getPlayerStatus(player)}</span>
                                  <span className="ml-2 text-red-600 md:hidden">{getPlayerStatusMobile(player)}</span>
                                  {selectedPosition === 'FLEX' && (
                                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                      {getCurrentPlayerPosition(player.id)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="text-left px-2 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {player.team}
                          </td>
                          <td className="text-left px-2 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                            {player.opposingTeam}
                          </td>
                          <td className="text-left px-2 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="md:hidden">${(player.salary / 1000).toFixed(1)}K</span>
                            <span className="hidden md:inline">${player.salary.toLocaleString()}</span>
                          </td>
                          <td className="text-left px-2 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="md:hidden">{(player.projection || 0).toFixed(1)}</span>
                            <span className="hidden md:inline">{(player.projection || 0).toFixed(2)}</span>
                          </td>
                          <td className="text-left px-2 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900 sm:table-cell">
                            <span className="md:hidden">{calculateValue(player.projection, player.salary).toFixed(1)}</span>
                            <span className="hidden md:inline">{calculateValue(player.projection, player.salary).toFixed(2)}</span>
                          </td>
                          <td className="text-left px-2 md:px-6 py-4 whitespace-nowrap text-sm space-x-1 md:space-x-2">
                            <button
                              onClick={() => updatePlayerStatus(player.id,
                                player.status === 'locked' ? 'available' : 'locked'
                              )}
                              disabled={player.status !== 'locked' && (
                                !canLockPlayerInPosition(getCurrentPlayerPosition(player.id) || selectedPosition === 'FLEX' ? getCurrentPlayerPosition(player.id) : selectedPosition).allowed ||
                                getAllLockedPlayers().length >= MAX_TOTAL_LOCKED ||
                                calculateTotalSalary(getAllLockedPlayers(), player.id) > MAX_SALARY_CAP
                              )}
                              className={`inline-flex items-center px-2 md:px-3 py-1 rounded-md text-xs font-medium transition-colors ${player.status === 'locked'
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : (!canLockPlayerInPosition(getCurrentPlayerPosition(player.id) || selectedPosition === 'FLEX' ? getCurrentPlayerPosition(player.id) : selectedPosition).allowed ||
                                  getAllLockedPlayers().length >= MAX_TOTAL_LOCKED ||
                                  calculateTotalSalary(getAllLockedPlayers(), player.id) > MAX_SALARY_CAP)
                                  ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                  : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700'
                                }`}
                            >
                              <Lock className="w-3 h-3 mr-1" />
                              <span className="hidden sm:inline">{player.status === 'locked' ? 'Locked' : 'Lock'}</span>
                            </button>
                            <button
                              onClick={() => updatePlayerStatus(player.id,
                                player.status === 'excluded' ? 'available' : 'excluded'
                              )}
                              className={`inline-flex items-center px-2 md:px-3 py-1 rounded-md text-xs font-medium transition-colors ${player.status === 'excluded'
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-700'
                                }`}
                            >
                              <X className="w-3 h-3 mr-1" />
                              <span className="hidden sm:inline">{player.status === 'excluded' ? 'Excluded' : 'Exclude'}</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>) : (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <div className="text-center max-w-md">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-4xl font-bold text-gray-400">!</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Player Data Available for Week {week}</h3>
                  <p className="text-gray-600 mb-6">
                    There is currently no player data available for this week. Please check back later or contact support if this issue persists.
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Refresh Page
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFLOptimizerFrontend;