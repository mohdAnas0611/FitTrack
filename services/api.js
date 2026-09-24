// ─────────────────────────────────────────────
// FITTRACK — API Client Service Layer
// ─────────────────────────────────────────────
import { getToken, setToken, removeToken } from '../constants/storage';

const API_BASE_URL = typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL
  ? process.env.EXPO_PUBLIC_API_URL
  : 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const error = new Error(data.message || `Request failed with status ${res.status}`);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    // Return friendly error object or bubble up
    throw err;
  }
}

export const api = {
  // Auth Endpoints
  auth: {
    login: async (credentials) => {
      const res = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      if (res.token) setToken(res.token);
      return res;
    },
    register: async (userData) => {
      const res = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      if (res.token) setToken(res.token);
      return res;
    },
    demo: async () => {
      const res = await request('/auth/demo', {
        method: 'POST',
      });
      if (res.token) setToken(res.token);
      return res;
    },
    getMe: async () => {
      return await request('/auth/me');
    },
    logout: () => {
      removeToken();
    },
  },

  // User Endpoints
  user: {
    getProfile: async () => {
      return await request('/user/profile');
    },
    updateProfile: async (updates) => {
      return await request('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },
    addXp: async (amount) => {
      return await request('/user/xp', {
        method: 'POST',
        body: JSON.stringify({ amount }),
      });
    },
    addCoins: async (amount) => {
      return await request('/user/coins', {
        method: 'POST',
        body: JSON.stringify({ amount }),
      });
    },
    getBadges: async () => {
      return await request('/user/badges');
    },
  },

  // Territory Endpoints
  territory: {
    getGrid: async () => {
      return await request('/territory/grid');
    },
    claim: async ({ row, col }) => {
      return await request('/territory/claim', {
        method: 'POST',
        body: JSON.stringify({ row, col }),
      });
    },
    aiTurn: async () => {
      return await request('/territory/ai-turn', {
        method: 'POST',
      });
    },
    getStats: async () => {
      return await request('/territory/stats');
    },
    reset: async () => {
      return await request('/territory/reset', {
        method: 'POST',
      });
    },
  },

  // Tracking Endpoints
  tracking: {
    saveSession: async (sessionData) => {
      return await request('/tracking/session', {
        method: 'POST',
        body: JSON.stringify(sessionData),
      });
    },
    getHistory: async () => {
      return await request('/tracking/history');
    },
    syncSteps: async ({ deltaSteps, deltaDistance }) => {
      return await request('/tracking/step-sync', {
        method: 'POST',
        body: JSON.stringify({ deltaSteps, deltaDistance }),
      });
    },
  },

  // Daily Challenges Endpoints
  challenges: {
    getDaily: async () => {
      return await request('/challenges/daily');
    },
    claimReward: async (challengeId) => {
      return await request(`/challenges/${challengeId}/claim`, {
        method: 'POST',
      });
    },
  },

  // Shop & Avatars Endpoints
  shop: {
    getAvatars: async () => {
      return await request('/shop/avatars');
    },
    buyAvatar: async (avatarId) => {
      return await request('/shop/buy', {
        method: 'POST',
        body: JSON.stringify({ avatarId }),
      });
    },
    equipAvatar: async (avatarId) => {
      return await request('/shop/equip', {
        method: 'POST',
        body: JSON.stringify({ avatarId }),
      });
    },
  },

  // Leaderboard Endpoints
  leaderboard: {
    get: async () => {
      return await request('/leaderboard');
    },
  },

  // Health Check
  health: async () => {
    return await request('/health');
  },
};

export default api;
