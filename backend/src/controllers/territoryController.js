const { db, MAP_ROWS, MAP_COLS } = require('../db/database');
const { sanitizeUser } = require('./authController');

function isAdjacentToUser(grid, row, col) {
  const neighbors = [
    [row - 1, col],
    [row + 1, col],
    [row, col - 1],
    [row, col + 1],
  ];

  return neighbors.some(([r, c]) => {
    return r >= 0 && r < MAP_ROWS && c >= 0 && c < MAP_COLS && grid[r][c] === 'you';
  });
}

function calculateTerritoryStats(grid) {
  const totalCells = MAP_ROWS * MAP_COLS;
  const counts = { you: 0, marcus: 0, priya: 0, jake: 0, neutral: 0 };

  for (let r = 0; r < MAP_ROWS; r++) {
    for (let c = 0; c < MAP_COLS; c++) {
      const owner = grid[r][c];
      if (owner && counts[owner] !== undefined) {
        counts[owner]++;
      } else {
        counts.neutral++;
      }
    }
  }

  const percentages = {
    you: Math.round((counts.you / totalCells) * 100),
    marcus: Math.round((counts.marcus / totalCells) * 100),
    priya: Math.round((counts.priya / totalCells) * 100),
    jake: Math.round((counts.jake / totalCells) * 100),
    neutral: Math.round((counts.neutral / totalCells) * 100),
  };

  return { totalCells, counts, percentages };
}

const getGrid = async (req, res, next) => {
  try {
    const grid = db.getTerritory();
    const stats = calculateTerritoryStats(grid);

    return res.status(200).json({
      success: true,
      grid,
      rows: MAP_ROWS,
      cols: MAP_COLS,
      stats,
    });
  } catch (err) {
    next(err);
  }
};

const claimCell = async (req, res, next) => {
  try {
    const { row, col } = req.body;
    const r = parseInt(row, 10);
    const c = parseInt(col, 10);

    if (isNaN(r) || isNaN(c) || r < 0 || r >= MAP_ROWS || c < 0 || c >= MAP_COLS) {
      return res.status(400).json({ success: false, message: 'Invalid coordinates' });
    }

    const grid = db.getTerritory();
    const currentOwner = grid[r][c];

    if (currentOwner === 'you') {
      return res.status(400).json({ success: false, message: 'You already own this sector!' });
    }

    if (!isAdjacentToUser(grid, r, c)) {
      return res.status(400).json({
        success: false,
        message: 'Walk closer to capture! You can only claim sectors adjacent to your current territory.',
      });
    }

    const isBattle = currentOwner !== null;
    const defeatedOpponent = currentOwner;
    const xpGain = isBattle ? 30 : 15;
    const coinsGain = isBattle ? 30 : 15;

    // Clone grid and update cell
    const updatedGrid = grid.map(rowArr => [...rowArr]);
    updatedGrid[r][c] = 'you';
    db.saveTerritory(updatedGrid);

    // Update user stats
    let user = null;
    if (req.user) {
      const u = db.findUserById(req.user.id);
      const totalZones = updatedGrid.flat().filter(cell => cell === 'you').length;
      const badges = [...(u.badges || [])];

      if (totalZones >= 5 && !badges.includes('zone_hunter')) {
        badges.push('zone_hunter');
      }
      if (isBattle && !badges.includes('battle_win')) {
        badges.push('battle_win');
      }

      user = db.updateUser(req.user.id, {
        zones: totalZones,
        xp: (u.xp || 0) + xpGain,
        coins: (u.coins || 0) + coinsGain,
        badges,
      });
    }

    const stats = calculateTerritoryStats(updatedGrid);

    return res.status(200).json({
      success: true,
      message: isBattle
        ? `⚔️ Battle won against ${defeatedOpponent}! +${coinsGain} coins and +${xpGain} XP!`
        : `✅ Sector captured! +${coinsGain} coins and +${xpGain} XP!`,
      isBattle,
      defeatedOpponent,
      xpGained: xpGain,
      coinsGained: coinsGain,
      cell: { row: r, col: c, owner: 'you' },
      grid: updatedGrid,
      stats,
      user: user ? sanitizeUser(user) : undefined,
    });
  } catch (err) {
    next(err);
  }
};

const aiTurn = async (req, res, next) => {
  try {
    const grid = db.getTerritory();
    const updatedGrid = grid.map(rowArr => [...rowArr]);
    const opponents = ['marcus', 'priya', 'jake'];
    const capturedCells = [];

    opponents.forEach(player => {
      const owned = [];
      for (let r = 0; r < MAP_ROWS; r++) {
        for (let c = 0; c < MAP_COLS; c++) {
          if (updatedGrid[r][c] === player) {
            owned.push([r, c]);
          }
        }
      }

      if (!owned.length) return;

      const [br, bc] = owned[Math.floor(Math.random() * owned.length)];
      const adj = [
        [br - 1, bc],
        [br + 1, bc],
        [br, bc - 1],
        [br, bc + 1],
      ].filter(([r, c]) => r >= 0 && r < MAP_ROWS && c >= 0 && c < MAP_COLS && updatedGrid[r][c] === null);

      if (adj.length && Math.random() < 0.35) {
        const [nr, nc] = adj[Math.floor(Math.random() * adj.length)];
        updatedGrid[nr][nc] = player;
        capturedCells.push({ player, row: nr, col: nc });
      }
    });

    db.saveTerritory(updatedGrid);
    const stats = calculateTerritoryStats(updatedGrid);

    return res.status(200).json({
      success: true,
      capturedCells,
      grid: updatedGrid,
      stats,
    });
  } catch (err) {
    next(err);
  }
};

const getStats = async (req, res, next) => {
  try {
    const grid = db.getTerritory();
    const stats = calculateTerritoryStats(grid);
    return res.status(200).json({ success: true, stats });
  } catch (err) {
    next(err);
  }
};

const resetGrid = async (req, res, next) => {
  try {
    const grid = db.resetTerritory();
    const stats = calculateTerritoryStats(grid);
    return res.status(200).json({
      success: true,
      message: 'Territory map reset to default.',
      grid,
      stats,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getGrid,
  claimCell,
  aiTurn,
  getStats,
  resetGrid,
};
