// ─────────────────────────────────────────────
// FITTRACK — Territory Map Hook with Backend Sync
// ─────────────────────────────────────────────
import { useState, useCallback, useEffect, useRef } from "react";
import { useApp } from './useAppContext';
import { MAP_ROWS, MAP_COLS, PlayerNames } from '../constants';
import { isAdjacentToPlayer, countCells } from '../utils/territory';
import { api } from '../services/api';

export function useTerritory() {
  const { territory, setTerritory, addXp, addCoins, showToast, setAchievement } = useApp();
  const [zoom, setZoom]       = useState(1);
  const [pan, setPan]         = useState({ x: -30, y: -20 });
  const [flashes, setFlashes] = useState([]);
  const userPos = useRef({ row: 7, col: 4 });
  const aiRef   = useRef();

  // Load grid from backend on mount
  useEffect(() => {
    api.territory.getGrid().then(res => {
      if (res && res.grid) {
        setTerritory(res.grid);
      }
    }).catch(() => {});
  }, [setTerritory]);

  const capture = useCallback(async (row, col) => {
    if (territory[row][col] === 'you') return;

    if (!isAdjacentToPlayer(territory, row, col)) {
      showToast('Walk closer to capture! 📍');
      return;
    }

    const isBattle  = territory[row][col] !== null;
    const xpGain    = isBattle ? 30 : 15;
    const coinsGain = isBattle ? 30 : 15;
    const prevOwner = territory[row][col];

    // Optimistic local update
    setTerritory(prev => {
      const n = prev.map(r => [...r]);
      n[row][col] = 'you';
      return n;
    });

    userPos.current = { row, col };
    addXp(xpGain);
    addCoins(coinsGain);
    showToast(isBattle ? `⚔️ Battle won! +${coinsGain} coins` : `✅ Captured! +${coinsGain} coins`);

    const id = Date.now();
    setFlashes(f => [...f, { id, row, col, color: isBattle ? 'rgba(239,68,68,0.5)' : 'rgba(244,98,31,0.5)' }]);
    setTimeout(() => setFlashes(f => f.filter(x => x.id !== id)), 700);

    if (isBattle) {
      const opponentName = prevOwner ? (PlayerNames[prevOwner] || prevOwner) : 'Opponent';
      setAchievement({
        icon: '⚔️',
        title: 'Territory Captured!',
        sub: `Defeated ${opponentName}!`,
        xp: xpGain,
      });
    }

    // Backend sync
    try {
      const res = await api.territory.claim({ row, col });
      if (res && res.grid) {
        setTerritory(res.grid);
      }
    } catch (err) {
      // Local optimistic state is already preserved
    }
  }, [territory, setTerritory, addXp, addCoins, showToast, setAchievement]);

  // Dynamic AI expansion
  useEffect(() => {
    aiRef.current = setInterval(() => {
      // Attempt backend AI turn sync
      api.territory.aiTurn().then(res => {
        if (res && res.grid) {
          setTerritory(res.grid);
        }
      }).catch(() => {
        // Fallback local AI turn simulation
        setTerritory(prev => {
          const n = prev.map(r => [...r]);
          ['marcus', 'priya', 'jake'].forEach(player => {
            const owned = [];
            for (let r = 0; r < MAP_ROWS; r++) {
              for (let c = 0; c < MAP_COLS; c++) {
                if (n[r][c] === player) owned.push([r, c]);
              }
            }
            if (!owned.length) return;
            const [br, bc] = owned[Math.floor(Math.random() * owned.length)];
            const adj = [[br-1,bc],[br+1,bc],[br,bc-1],[br,bc+1]]
              .filter(([r,c]) => r>=0 && r<MAP_ROWS && c>=0 && c<MAP_COLS && n[r][c]===null);
            if (adj.length && Math.random() < 0.3) {
              const [nr, nc] = adj[0];
              n[nr][nc] = player;
            }
          });
          return n;
        });
      });
    }, 4000);

    return () => clearInterval(aiRef.current);
  }, [setTerritory]);

  const zoomIn  = () => setZoom(z => Math.min(2, +(z + 0.2).toFixed(1)));
  const zoomOut = () => setZoom(z => Math.max(0.5, +(z - 0.2).toFixed(1)));

  const youCells   = countCells(territory, 'you');
  const totalCells = MAP_ROWS * MAP_COLS;
  const youPct     = Math.round((youCells / totalCells) * 100);

  return { territory, zoom, pan, flashes, userPos, capture, zoomIn, zoomOut, youCells, youPct, totalCells };
}
