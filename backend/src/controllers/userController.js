const { db, XP_PER_LEVEL, BADGES } = require('../db/database');
const { sanitizeUser } = require('./authController');

const getProfile = async (req, res, next) => {
  try {
    const user = db.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({
      success: true,
      user: sanitizeUser(user),
      xpPerLevel: XP_PER_LEVEL,
    });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const allowed = ['name', 'username', 'selectedAvatar', 'settings'];
    const updates = {};

    allowed.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updated = db.updateUser(req.user.id, updates);
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: sanitizeUser(updated),
    });
  } catch (err) {
    next(err);
  }
};

const addXp = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const xpGain = parseInt(amount, 10) || 0;
    if (xpGain <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid XP amount' });
    }

    const user = db.findUserById(req.user.id);
    let newXp = (user.xp || 0) + xpGain;
    let newLevel = user.level || 1;
    let leveledUp = false;

    while (newXp >= XP_PER_LEVEL) {
      newXp -= XP_PER_LEVEL;
      newLevel++;
      leveledUp = true;
    }

    // Check level badge
    const badges = [...(user.badges || [])];
    if (newLevel >= 5 && !badges.includes('level_5')) {
      badges.push('level_5');
    }

    const updated = db.updateUser(req.user.id, {
      xp: newXp,
      level: newLevel,
      badges,
    });

    return res.status(200).json({
      success: true,
      xpGained: xpGain,
      leveledUp,
      level: newLevel,
      xp: newXp,
      user: sanitizeUser(updated),
    });
  } catch (err) {
    next(err);
  }
};

const addCoins = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const coinAmt = parseInt(amount, 10) || 0;

    const user = db.findUserById(req.user.id);
    const newCoins = Math.max(0, (user.coins || 0) + coinAmt);

    const badges = [...(user.badges || [])];
    if (newCoins >= 500 && !badges.includes('coins_500')) {
      badges.push('coins_500');
    }

    const updated = db.updateUser(req.user.id, {
      coins: newCoins,
      badges,
    });

    return res.status(200).json({
      success: true,
      coins: newCoins,
      user: sanitizeUser(updated),
    });
  } catch (err) {
    next(err);
  }
};

const getBadges = async (req, res, next) => {
  try {
    const user = db.findUserById(req.user.id);
    const userBadges = user ? (user.badges || []) : [];

    const badgeList = BADGES.map(b => ({
      ...b,
      unlocked: userBadges.includes(b.id),
    }));

    return res.status(200).json({
      success: true,
      badges: badgeList,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  addXp,
  addCoins,
  getBadges,
};
