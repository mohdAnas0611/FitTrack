const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const MAP_ROWS = 26;
const MAP_COLS = 17;
const XP_PER_LEVEL = 5000;

const AVATAR_CONFIGS = {
  blaze:  { id: 'blaze',  name: 'Blaze Runner', emoji: '🦁', color: '#F4621F', grad: '#FF8A50', effect: '🔥', desc: 'Fire trail effect',     price: 0,    owned: true  },
  cyber:  { id: 'cyber',  name: 'Cyber Bot',    emoji: '🤖', color: '#0EA5E9', grad: '#38BDF8', effect: '⚡', desc: 'Electric spark effect', price: 0,    owned: false },
  fox:    { id: 'fox',    name: 'Fire Fox',     emoji: '🦊', color: '#EF4444', grad: '#F87171', effect: '🔥', desc: 'Double flame trail',    price: 800,  owned: false },
  alien:  { id: 'alien',  name: 'Space Walker', emoji: '👾', color: '#7C3AED', grad: '#A78BFA', effect: '✨', desc: 'Nebula orbit effect',   price: 1200, owned: false },
  frost:  { id: 'frost',  name: 'Frost Nova',   emoji: '❄️', color: '#06B6D4', grad: '#22D3EE', effect: '❄️', desc: 'Crystal freeze aura',  price: 2000, owned: false },
  legend: { id: 'legend', name: 'Legendary',    emoji: '👑', color: '#F59E0B', grad: '#FCD34D', effect: '👑', desc: 'Rainbow crown aura',   price: 5000, owned: false },
};

const BADGES = [
  { id: 'first_steps', emoji: '👟', name: 'First Steps',  desc: 'Walk 1,000 steps' },
  { id: 'zone_hunter', emoji: '🗺️', name: 'Zone Hunter',  desc: 'Capture 5 zones' },
  { id: 'streak_7',    emoji: '🔥', name: 'On Fire',      desc: '7-day streak' },
  { id: 'coins_500',   emoji: '💰', name: 'Coin Hoarder', desc: 'Earn 500 coins' },
  { id: 'level_5',     emoji: '⭐', name: 'Rising Star',  desc: 'Reach level 5' },
  { id: 'battle_win',  emoji: '⚔️', name: 'Conqueror',    desc: 'Win 3 territory battles' },
  { id: 'marathon',    emoji: '🏃', name: 'Marathoner',   desc: 'Walk 10km total' },
  { id: 'legend_buy',  emoji: '👑', name: 'Legendary',    desc: 'Own a legendary avatar' },
];

const DEFAULT_CHALLENGES = [
  { id: 'steps_8k', label: 'Reach 8,000 Steps',    current: 6240, target: 8000, xp: 150, coins: 50,  icon: '👟', color: '#F4621F', done: false },
  { id: 'zones_3',  label: 'Claim 3 Zones Today',  current: 1,    target: 3,    xp: 250, coins: 75,  icon: '🗺️', color: '#7C3AED', done: false },
  { id: 'streak_7', label: 'Maintain 7-day streak', current: 14,  target: 7,    xp: 500, coins: 100, icon: '🔥', color: '#F59E0B', done: true },
];

const OPPONENTS = [
  { id: 'marcus', name: 'Marcus K.', username: 'marcus_k', avatar: 'cyber', level: 6, zones: 42, steps: 18400, pct: 28 },
  { id: 'priya',  name: 'Priya S.',  username: 'priya_fit', avatar: 'alien', level: 4, zones: 14, steps: 9800,  pct: 9  },
  { id: 'jake',   name: 'Jake R.',   username: 'jakerun',  avatar: 'fox',   level: 2, zones: 9,  steps: 7200,  pct: 6  },
];

function initTerritoryGrid() {
  const grid = Array(MAP_ROWS).fill(null).map(() => Array(MAP_COLS).fill(null));
  const paint = (player, cells) => {
    cells.forEach(([r, c]) => {
      if (r >= 0 && r < MAP_ROWS && c >= 0 && c < MAP_COLS) grid[r][c] = player;
    });
  };

  paint('you',    [[5,3],[5,4],[5,5],[6,3],[6,4],[6,5],[7,4],[7,5],[8,4],[8,5],[9,4],[9,5],[10,4],[10,5],[11,4],[11,5],[12,4],[12,5]]);
  paint('marcus', [[2,8],[2,9],[2,10],[2,11],[3,8],[3,9],[3,10],[3,11],[4,8],[4,9],[4,10],[4,11],[5,8],[5,9],[5,10],[5,11],[6,8],[6,9],[6,10],[6,11],[7,8],[7,9],[7,10],[7,11],[8,8],[8,9],[8,10],[8,11],[9,8],[9,9],[9,10],[9,11],[10,8],[10,9],[10,10],[10,11],[11,8],[11,9],[11,10],[11,11],[12,8],[12,9]]);
  paint('priya',  [[14,3],[14,4],[14,5],[15,3],[15,4],[15,5],[16,3],[16,4],[16,5],[17,3],[17,4],[17,5],[18,3],[18,4],[18,5]]);
  paint('jake',   [[13,11],[13,12],[14,11],[14,12],[15,11],[15,12],[16,11],[16,12],[17,11]]);
  return grid;
}

class Database {
  constructor() {
    this.data = {
      users: [],
      territory: initTerritoryGrid(),
      opponents: OPPONENTS,
      avatars: AVATAR_CONFIGS,
      badges: BADGES,
      challenges: DEFAULT_CHALLENGES,
      trackingSessions: [],
    };
    this.init();
  }

  init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        if (raw.trim()) {
          const parsed = JSON.parse(raw);
          this.data = { ...this.data, ...parsed };
          return;
        }
      }

      // Seed initial demo user
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync('demo123', salt);

      const demoUser = {
        id: 'usr_demo_001',
        email: 'demo@fittrack.app',
        password: hashedPassword,
        name: 'Alex Chen',
        username: 'alexfit',
        level: 3,
        xp: 2200,
        coins: 340,
        totalSteps: 124000,
        distance: 87.4,
        calories: 4820,
        streak: 14,
        zones: 18,
        ownedAvatars: ['blaze', 'cyber'],
        selectedAvatar: 'blaze',
        badges: ['first_steps', 'zone_hunter', 'streak_7', 'coins_500'],
        settings: { notifications: true, gps: true, privacy: false, dark: false },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.data.users = [demoUser];
      this.save();
    } catch (err) {
      console.error('Database initialization error:', err);
    }
  }

  save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to persist database file:', err);
    }
  }

  // Users
  findUserByEmail(email) {
    if (!email) return null;
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  findUserById(id) {
    if (!id) return null;
    return this.data.users.find(u => u.id === id) || null;
  }

  createUser(userData) {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(userData.password, salt);

    const newUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      name: userData.name || userData.email.split('@')[0],
      username: userData.username || userData.email.split('@')[0].toLowerCase(),
      level: 1,
      xp: 0,
      coins: 100,
      totalSteps: 0,
      distance: 0.0,
      calories: 0,
      streak: 1,
      zones: 0,
      ownedAvatars: ['blaze'],
      selectedAvatar: 'blaze',
      badges: ['first_steps'],
      settings: { notifications: true, gps: true, privacy: false, dark: false },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  updateUser(id, updates) {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) return null;

    const user = this.data.users[index];
    const updated = {
      ...user,
      ...updates,
      settings: updates.settings ? { ...user.settings, ...updates.settings } : user.settings,
      updatedAt: new Date().toISOString(),
    };

    this.data.users[index] = updated;
    this.save();
    return updated;
  }

  // Territory
  getTerritory() {
    return this.data.territory || initTerritoryGrid();
  }

  saveTerritory(grid) {
    this.data.territory = grid;
    this.save();
    return this.data.territory;
  }

  resetTerritory() {
    this.data.territory = initTerritoryGrid();
    this.save();
    return this.data.territory;
  }

  // Challenges
  getChallenges() {
    return this.data.challenges || DEFAULT_CHALLENGES;
  }

  updateChallenge(id, updates) {
    const list = this.getChallenges();
    const idx = list.findIndex(c => c.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      this.data.challenges = list;
      this.save();
      return list[idx];
    }
    return null;
  }

  // Tracking Sessions
  saveSession(sessionData) {
    const session = {
      id: `sess_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      userId: sessionData.userId,
      steps: sessionData.steps || 0,
      distance: sessionData.distance || 0,
      duration: sessionData.duration || 0, // in seconds
      calories: sessionData.calories || 0,
      pace: sessionData.pace || 0,
      xpEarned: sessionData.xpEarned || 0,
      coinsEarned: sessionData.coinsEarned || 0,
      zonesCaptured: sessionData.zonesCaptured || 0,
      createdAt: new Date().toISOString(),
    };

    this.data.trackingSessions.push(session);
    this.save();
    return session;
  }

  getUserSessions(userId) {
    return this.data.trackingSessions.filter(s => s.userId === userId);
  }

  // Shop Avatars
  getAvatars() {
    return this.data.avatars || AVATAR_CONFIGS;
  }

  // Badges
  getBadges() {
    return this.data.badges || BADGES;
  }

  // Opponents & Leaderboard
  getOpponents() {
    return this.data.opponents || OPPONENTS;
  }
}

const db = new Database();

module.exports = {
  db,
  MAP_ROWS,
  MAP_COLS,
  XP_PER_LEVEL,
  AVATAR_CONFIGS,
  BADGES,
  DEFAULT_CHALLENGES,
  OPPONENTS,
};
