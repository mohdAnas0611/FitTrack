const { db, XP_PER_LEVEL } = require('../db/database');
const { sanitizeUser } = require('./authController');

const getDailyChallenges = async (req, res, next) => {
  try {
    const challenges = db.getChallenges();
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const resetSeconds = Math.max(0, Math.floor((midnight - now) / 1000));
    const resetHours = Math.floor(resetSeconds / 3600);

    return res.status(200).json({
      success: true,
      challenges,
      resetInHours: resetHours,
      resetInSeconds: resetSeconds,
    });
  } catch (err) {
    next(err);
  }
};

const claimReward = async (req, res, next) => {
  try {
    const { id } = req.params;
    const challenges = db.getChallenges();
    const challenge = challenges.find(c => c.id === id);

    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    if (challenge.done) {
      return res.status(400).json({ success: false, message: 'Reward already claimed for this challenge!' });
    }

    if (challenge.current < challenge.target && challenge.id !== 'streak_7') {
      return res.status(400).json({ success: false, message: 'Challenge goal not reached yet!' });
    }

    // Mark done
    db.updateChallenge(id, { done: true });

    // Award XP and coins
    const user = db.findUserById(req.user.id);
    let newXp = (user.xp || 0) + challenge.xp;
    let newLevel = user.level || 1;
    let leveledUp = false;

    while (newXp >= XP_PER_LEVEL) {
      newXp -= XP_PER_LEVEL;
      newLevel++;
      leveledUp = true;
    }

    const updatedUser = db.updateUser(req.user.id, {
      xp: newXp,
      level: newLevel,
      coins: (user.coins || 0) + challenge.coins,
    });

    return res.status(200).json({
      success: true,
      message: `🎉 Challenge "${challenge.label}" completed! Claimed +${challenge.xp} XP and +${challenge.coins} coins!`,
      challenge: { ...challenge, done: true },
      xpGained: challenge.xp,
      coinsGained: challenge.coins,
      leveledUp,
      user: sanitizeUser(updatedUser),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDailyChallenges,
  claimReward,
};
