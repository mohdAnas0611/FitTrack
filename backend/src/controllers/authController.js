const bcrypt = require('bcryptjs');
const { db } = require('../db/database');
const { generateToken } = require('../middleware/auth');

function sanitizeUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

const register = async (req, res, next) => {
  try {
    const { name, email, password, username } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const existing = db.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists. Please sign in.',
      });
    }

    const user = db.createUser({
      name: name || email.split('@')[0],
      email,
      password,
      username: username || email.split('@')[0].toLowerCase(),
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to FitTrack 🏃',
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully! 🚀',
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

const demoLogin = async (req, res, next) => {
  try {
    let demoUser = db.findUserByEmail('demo@fittrack.app');
    if (!demoUser) {
      demoUser = db.createUser({
        name: 'Alex Chen',
        email: 'demo@fittrack.app',
        password: 'demo123',
        username: 'alexfit',
      });
      demoUser = db.updateUser(demoUser.id, {
        level: 3,
        xp: 2200,
        coins: 340,
        totalSteps: 124000,
        distance: 87.4,
        streak: 14,
        zones: 18,
        ownedAvatars: ['blaze', 'cyber'],
        selectedAvatar: 'blaze',
        badges: ['first_steps', 'zone_hunter', 'streak_7', 'coins_500'],
      });
    }

    const token = generateToken(demoUser);

    return res.status(200).json({
      success: true,
      message: 'Welcome back to Demo Mode! 🎮',
      token,
      user: sanitizeUser(demoUser),
    });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = db.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    return res.status(200).json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  demoLogin,
  getMe,
  sanitizeUser,
};
