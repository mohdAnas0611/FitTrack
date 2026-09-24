// ─────────────────────────────────────────────
// FITTRACK — LocalStorage & Auth Storage Utility
// ─────────────────────────────────────────────

export const LS = {
  get: (key, fallback = null) => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return fallback;
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch {
      return fallback;
    }
  },
  set: (key, value) => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  },
  remove: (key) => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      localStorage.removeItem(key);
    } catch {}
  },
  getRaw: (key, fallback = '') => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return fallback;
      return localStorage.getItem(key) || fallback;
    } catch {
      return fallback;
    }
  },
  setRaw: (key, value) => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      localStorage.setItem(key, value);
    } catch {}
  },
};

export const STORAGE_KEYS = {
  TOKEN:      'ft_token',
  USER:       'ft_user',
  DARK:       'ft_dark',
  TERRITORY:  'ft_territory',
  CHALLENGES: 'ft_challenges',
};

export const getToken = () => LS.getRaw(STORAGE_KEYS.TOKEN, '');
export const setToken = (t) => LS.setRaw(STORAGE_KEYS.TOKEN, t);
export const removeToken = () => LS.remove(STORAGE_KEYS.TOKEN);
