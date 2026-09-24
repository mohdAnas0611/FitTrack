const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const territoryRoutes = require('./territoryRoutes');
const trackingRoutes = require('./trackingRoutes');
const challengeRoutes = require('./challengeRoutes');
const shopRoutes = require('./shopRoutes');
const leaderboardRoutes = require('./leaderboardRoutes');

// API Health
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'FitTrack API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/territory', territoryRoutes);
router.use('/tracking', trackingRoutes);
router.use('/challenges', challengeRoutes);
router.use('/shop', shopRoutes);
router.use('/leaderboard', leaderboardRoutes);

module.exports = router;
