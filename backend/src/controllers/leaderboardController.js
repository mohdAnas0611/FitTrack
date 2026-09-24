const { db, MAP_ROWS, MAP_COLS } = require('../db/database');

const getLeaderboard = async (req, res, next) => {
  try {
    const totalCells = MAP_ROWS * MAP_COLS;
    const grid = db.getTerritory();
    const youCells = grid.flat().filter(c => c === 'you').length;
    const youPct = Math.round((youCells / totalCells) * 100);

    const currentUser = req.user ? db.findUserById(req.user.id) : null;
    const rivals = db.getOpponents();

    // Map rivals with live cell count if exists in grid
    const opponentsWithLiveStats = rivals.map(r => {
      const cells = grid.flat().filter(c => c === r.id).length;
      const pct = Math.max(r.pct, Math.round((cells / totalCells) * 100));
      return {
        ...r,
        zones: Math.max(r.zones, cells),
        pct,
        isUser: false,
      };
    });

    const userEntry = {
      id: currentUser ? currentUser.id : 'you',
      name: currentUser ? currentUser.name : 'You',
      avatar: currentUser ? currentUser.selectedAvatar : 'blaze',
      zones: currentUser ? (currentUser.zones || youCells) : youCells,
      steps: currentUser ? (currentUser.totalSteps || 12000) : 12000,
      pct: youPct,
      isUser: true,
    };

    const combined = [userEntry, ...opponentsWithLiveStats];
    combined.sort((a, b) => b.zones - a.zones || b.steps - a.steps);

    const ranked = combined.map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));

    return res.status(200).json({
      success: true,
      leaderboard: ranked,
      totalCells,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getLeaderboard,
};
