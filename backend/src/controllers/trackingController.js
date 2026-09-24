const { db } = require('../db/database');
const { sanitizeUser } = require('./authController');

const saveSession = async (req, res, next) => {
  try {
    const { steps, distance, duration, calories, pace, xpEarned, coinsEarned, zonesCaptured } = req.body;

    const stepCount = parseInt(steps, 10) || 0;
    const dist = parseFloat(distance) || (stepCount * 0.0008);
    const dur = parseInt(duration, 10) || 0;
    const cal = parseInt(calories, 10) || Math.round(stepCount * 0.04);
    const xp = parseInt(xpEarned, 10) || 0;
    const coins = parseInt(coinsEarned, 10) || 0;

    const session = db.saveSession({
      userId: req.user.id,
      steps: stepCount,
      distance: parseFloat(dist.toFixed(2)),
      duration: dur,
      calories: cal,
      pace: pace || (dur > 0 && dist > 0 ? (dur / 60 / dist).toFixed(1) : '0.0'),
      xpEarned: xp,
      coinsEarned: coins,
      zonesCaptured: zonesCaptured || 0,
    });

    // Update User cumulative stats
    const user = db.findUserById(req.user.id);
    const totalSteps = (user.totalSteps || 0) + stepCount;
    const totalDistance = parseFloat(((user.distance || 0) + dist).toFixed(1));
    const totalCalories = (user.calories || 0) + cal;
    const badges = [...(user.badges || [])];

    if (totalSteps >= 1000 && !badges.includes('first_steps')) {
      badges.push('first_steps');
    }
    if (totalDistance >= 10 && !badges.includes('marathon')) {
      badges.push('marathon');
    }

    const updatedUser = db.updateUser(req.user.id, {
      totalSteps,
      distance: totalDistance,
      calories: totalCalories,
      badges,
    });

    return res.status(201).json({
      success: true,
      message: 'Workout session saved successfully! 🏃',
      session,
      user: sanitizeUser(updatedUser),
    });
  } catch (err) {
    next(err);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const sessions = db.getUserSessions(req.user.id);
    const totalSteps = sessions.reduce((acc, s) => acc + (s.steps || 0), 0);
    const totalDistance = sessions.reduce((acc, s) => acc + (s.distance || 0), 0);
    const totalDuration = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
    const totalCalories = sessions.reduce((acc, s) => acc + (s.calories || 0), 0);

    return res.status(200).json({
      success: true,
      summary: {
        totalSessions: sessions.length,
        totalSteps,
        totalDistance: parseFloat(totalDistance.toFixed(2)),
        totalDuration,
        totalCalories,
      },
      sessions: sessions.reverse(),
    });
  } catch (err) {
    next(err);
  }
};

const syncSteps = async (req, res, next) => {
  try {
    const { deltaSteps, deltaDistance } = req.body;
    const steps = parseInt(deltaSteps, 10) || 0;
    const dist = parseFloat(deltaDistance) || (steps * 0.0008);

    if (steps <= 0) {
      return res.status(400).json({ success: false, message: 'Delta steps must be positive' });
    }

    const user = db.findUserById(req.user.id);
    const newTotalSteps = (user.totalSteps || 0) + steps;
    const newDist = parseFloat(((user.distance || 0) + dist).toFixed(2));

    // Update daily challenges progress
    const challenges = db.getChallenges();
    let challengeCompleted = null;

    challenges.forEach(ch => {
      if (ch.id === 'steps_8k' && !ch.done) {
        const newCur = Math.min(ch.target, ch.current + steps);
        db.updateChallenge('steps_8k', { current: newCur });
        if (newCur >= ch.target) {
          challengeCompleted = ch;
        }
      }
    });

    const updatedUser = db.updateUser(req.user.id, {
      totalSteps: newTotalSteps,
      distance: newDist,
    });

    return res.status(200).json({
      success: true,
      totalSteps: newTotalSteps,
      distance: newDist,
      challengeCompleted,
      user: sanitizeUser(updatedUser),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  saveSession,
  getHistory,
  syncSteps,
};
