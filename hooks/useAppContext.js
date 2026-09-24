// ─────────────────────────────────────────────
// FITTRACK — App Context + Provider with Backend Sync
// ─────────────────────────────────────────────
import { useState, useRef, useCallback, createContext, useContext, useEffect } from "react";
import { LS, STORAGE_KEYS, DEFAULT_USER, DEFAULT_CHALLENGES, XP_PER_LEVEL, getToken } from '../constants';
import { initTerritory } from '../utils/territory';
import { api } from '../services/api';

export const AppCtx = createContext();
export const useApp = () => useContext(AppCtx);

export function AppProvider({ children }) {
  const [dark, setDark]              = useState(() => LS.get(STORAGE_KEYS.DARK, false));
  const [user, setUserRaw]           = useState(() => LS.get(STORAGE_KEYS.USER, DEFAULT_USER));
  const [territory, setTerritoryRaw] = useState(() => LS.get(STORAGE_KEYS.TERRITORY, initTerritory()));
  const [challenges, setChallengesRaw] = useState(() => LS.get(STORAGE_KEYS.CHALLENGES, DEFAULT_CHALLENGES));
  const [toast, setToast]            = useState(null);
  const [achievement, setAchievement] = useState(null);
  const [xpFloats, setXpFloats]      = useState([]);
  const toastRef = useRef();

  const setUser = useCallback((u) => {
    setUserRaw(prev => {
      const nextVal = typeof u === 'function' ? u(prev) : u;
      LS.set(STORAGE_KEYS.USER, nextVal);
      // Background sync to backend if user is authenticated
      if (getToken() && nextVal) {
        api.user.updateProfile({
          name: nextVal.name,
          username: nextVal.username,
          selectedAvatar: nextVal.selectedAvatar,
          settings: nextVal.settings,
        }).catch(() => {});
      }
      return nextVal;
    });
  }, []);

  const setTerritory = useCallback((t) => {
    setTerritoryRaw(prev => {
      const nextVal = typeof t === 'function' ? t(prev) : t;
      LS.set(STORAGE_KEYS.TERRITORY, nextVal);
      return nextVal;
    });
  }, []);

  const setChallenges = useCallback((c) => {
    setChallengesRaw(prev => {
      const nextVal = typeof c === 'function' ? c(prev) : c;
      LS.set(STORAGE_KEYS.CHALLENGES, nextVal);
      return nextVal;
    });
  }, []);

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 2500);
  }, []);

  const addXpFloat = useCallback((x, y, val) => {
    const id = Date.now();
    setXpFloats(f => [...f, { id, x, y, val }]);
    setTimeout(() => setXpFloats(f => f.filter(i => i.id !== id)), 1600);
  }, []);

  const addCoins = useCallback((amt) => {
    setUserRaw(u => {
      const updated = { ...u, coins: Math.max(0, (u.coins || 0) + amt) };
      LS.set(STORAGE_KEYS.USER, updated);
      return updated;
    });

    if (getToken()) {
      api.user.addCoins(amt).catch(() => {});
    }
  }, []);

  const addXp = useCallback((amt) => {
    setUserRaw(u => {
      let nx = (u.xp || 0) + amt, nl = u.level || 1, leveled = false;
      while (nx >= XP_PER_LEVEL) {
        nx -= XP_PER_LEVEL;
        nl++;
        leveled = true;
      }
      if (leveled) {
        setAchievement({
          icon: '⭐',
          title: `Level Up! You're Level ${nl}!`,
          sub: 'Keep conquering territory!',
          xp: 0,
        });
      }
      const updated = { ...u, xp: nx, level: nl };
      LS.set(STORAGE_KEYS.USER, updated);
      return updated;
    });

    if (getToken()) {
      api.user.addXp(amt).catch(() => {});
    }
  }, []);

  const toggleDark = () => {
    setDark(d => {
      const next = !d;
      LS.set(STORAGE_KEYS.DARK, next);
      return next;
    });
  };

  // Sync profile & daily challenges with backend on mount
  useEffect(() => {
    if (getToken()) {
      api.auth.getMe().then(res => {
        if (res && res.user) {
          setUserRaw(res.user);
          LS.set(STORAGE_KEYS.USER, res.user);
        }
      }).catch(() => {});
    }

    api.challenges.getDaily().then(res => {
      if (res && res.challenges) {
        setChallengesRaw(res.challenges);
        LS.set(STORAGE_KEYS.CHALLENGES, res.challenges);
      }
    }).catch(() => {});
  }, []);

  return (
    <AppCtx.Provider value={{
      dark, toggleDark,
      user, setUser,
      territory, setTerritory,
      challenges, setChallenges,
      toast, showToast,
      achievement, setAchievement,
      xpFloats, addXpFloat,
      addCoins, addXp,
    }}>
      {children}
    </AppCtx.Provider>
  );
}
