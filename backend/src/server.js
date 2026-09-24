require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Utility Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Welcome Root Route
app.get('/', (req, res) => {
  res.json({
    name: 'FitTrack Backend API',
    version: '1.0.0',
    description: 'Gamified Fitness & Territory Capture System API',
    documentation: '/api/health',
    endpoints: {
      auth: '/api/auth (register, login, demo, me)',
      user: '/api/user (profile, xp, coins, badges)',
      territory: '/api/territory (grid, claim, ai-turn, stats)',
      tracking: '/api/tracking (session, history, step-sync)',
      challenges: '/api/challenges (daily, claim)',
      shop: '/api/shop (avatars, buy, equip)',
      leaderboard: '/api/leaderboard',
    },
  });
});

// API Routes
app.use('/api', routes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`\n==============================================`);
    console.log(`🔥 FitTrack Server running on http://localhost:${PORT}`);
    console.log(`🎮 API Health: http://localhost:${PORT}/api/health`);
    console.log(`==============================================\n`);
  });
}

module.exports = app;
