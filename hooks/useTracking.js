// ─────────────────────────────────────────────
// FITTRACK — Live Tracking Hook with Backend Workout Sync
// ─────────────────────────────────────────────
import { useState, useEffect, useRef } from "react";
import { useApp } from './useAppContext';
import { api } from '../services/api';
import { getToken } from '../constants/storage';

export function useTracking(initialSteps = 6240, initialTime = 14 * 60 + 23) {
  const { addXp, addCoins, user, setUser } = useApp();
  const [steps, setSteps]       = useState(initialSteps);
  const [running, setRunning]   = useState(true);
  const [time, setTime]         = useState(initialTime);
  const [xpEarned, setXpEarned] = useState(47);
  const intervalRef = useRef();
  const stepBatchRef = useRef(0);

  useEffect(() => {
    if (!running) {
      clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setSteps(s => s + 1);
      setTime(t => t + 1);
      stepBatchRef.current += 1;

      // Random reward burst
      if (Math.random() < 0.02) {
        setXpEarned(x => x + 30);
        addXp(30);
        addCoins(30);
      }

      // Sync step batches with backend every 20 steps
      if (stepBatchRef.current >= 20 && getToken()) {
        const batch = stepBatchRef.current;
        stepBatchRef.current = 0;
        api.tracking.syncSteps({
          deltaSteps: batch,
          deltaDistance: batch * 0.0008,
        }).catch(() => {});
      }
    }, 800);

    return () => clearInterval(intervalRef.current);
  }, [running, addXp, addCoins]);

  const pause  = () => {
    setRunning(false);
    // Save session on pause if meaningful activity
    if (steps > initialSteps && getToken()) {
      const activeSteps = steps - initialSteps;
      const dist = (activeSteps * 0.0008).toFixed(2);
      api.tracking.saveSession({
        steps: activeSteps,
        distance: parseFloat(dist),
        duration: time - initialTime,
        calories: Math.round(activeSteps * 0.04),
        xpEarned,
        coinsEarned: Math.round(activeSteps * 0.02),
      }).catch(() => {});
    }
  };

  const resume = () => setRunning(true);
  const toggle = () => (running ? pause() : resume());

  const distance = (steps * 0.0008).toFixed(2);
  const pace = time > 0 && parseFloat(distance) > 0
    ? (time / 60 / parseFloat(distance)).toFixed(1)
    : '0.0';

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return { steps, running, time, xpEarned, distance, pace, formatTime, pause, resume, toggle };
}
