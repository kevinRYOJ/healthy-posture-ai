import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  predictRisk,
  getSessions as apiGetSessions,
  createSession as apiCreateSession,
  deleteAllSessions as apiDeleteAllSessions,
} from '../api';

const AppContext = createContext(null);

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeSession(raw) {
  if (!raw) return null;

  const start =
    raw.start ??
    raw.startTime ??
    raw.start_time ??
    raw.started_at ??
    null;

  const end =
    raw.end ??
    raw.endTime ??
    raw.end_time ??
    raw.finished_at ??
    null;

  return {
    id: raw.id ?? raw.session_id ?? Date.now(),
    start,
    end,
    duration: toNumber(raw.duration, 0),
    totalBreakTime: toNumber(
      raw.totalBreakTime ??
      raw.total_break_time,
      0
    ),
    breaksTaken: toNumber(
      raw.breaksTaken ??
      raw.breaks_taken,
      0
    ),
  };
}

function isValidDate(value) {
  return value && !Number.isNaN(new Date(value).getTime());
}

function calcHealthScore(sessions) {
  const today = new Date().toDateString();
  const todaySessions = sessions.filter(
    (s) => s && isValidDate(s.start) && new Date(s.start).toDateString() === today
  );
  if (todaySessions.length === 0) return 100;

  let score = 100;
  for (const s of todaySessions) {
    const durationMin = toNumber(s.duration) / 60;
    if (durationMin > 60) score -= 10;
    if (durationMin > 90) score -= 15;
    if (toNumber(s.breaksTaken) === 0 && durationMin > 30) score -= 5;
    if (toNumber(s.breaksTaken) > 0) score += 3;
  }
  return Math.max(0, Math.min(100, Math.round(score)));
}

function calcTodaySitting(sessions) {
  const today = new Date().toDateString();
  return sessions
    .filter((s) => s && isValidDate(s.start) && new Date(s.start).toDateString() === today)
    .reduce((acc, s) => acc + Math.round(toNumber(s.duration) / 60), 0);
}

export function AppProvider({ children }) {
  const [sessions, setSessions] = useState([]);
  const [riskLevel, setRiskLevel] = useState(null);
  const [riskLoading, setRiskLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  const healthScore = calcHealthScore(sessions);
  const totalSittingToday = calcTodaySitting(sessions);

  const loadSessions = useCallback(async () => {
    if (!localStorage.getItem('hpr_token')) {
      setSessions([]);
      return;
    }

    setSessionsLoading(true);
    try {
      const data = await apiGetSessions();
      const normalized = (data.sessions || [])
        .map(normalizeSession)
        .filter(Boolean);
      setSessions(normalized);
    } catch (err) {
      console.warn('Gagal mengambil sessions:', err.message);
      setSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const fetchRisk = useCallback(async (minutes) => {
    setRiskLoading(true);
    try {
      const data = await predictRisk(minutes);
      setRiskLevel(data.risk);
    } catch (err) {
      console.warn('Risk prediction gagal:', err.message);
      setRiskLevel(null);
    } finally {
      setRiskLoading(false);
    }
  }, []);

  const addSession = useCallback(async (session) => {
    try {
      const token = localStorage.getItem('hpr_token');

      const payload = {
        startTime: session.startTime || session.start,
        endTime: session.endTime || session.end || new Date().toISOString(),
        duration: session.duration || 0,
        breaksTaken: session.breaksTaken || 0,
        totalBreakTime: session.totalBreakTime || 0,
      };

      console.log('KIRIM SESSION:', payload);

      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Gagal menyimpan session');
      }

      const normalized = normalizeSession(data.session);
      setSessions((prev) => [normalized, ...prev]);
    } catch (error) {
      console.error('Gagal menyimpan session ke server:', error.message);
    }
  }, []);

  const clearSessions = useCallback(async () => {
    try {
      await apiDeleteAllSessions();
    } catch (err) {
      console.warn('Gagal hapus sessions di server:', err.message);
    }
    setSessions([]);
    setRiskLevel(null);
  }, []);

  return (
    <AppContext.Provider value={{
      sessions,
      addSession,
      clearSessions,
      healthScore,
      totalSittingToday,
      riskLevel,
      riskLoading,
      fetchRisk,
      sessionsLoading,
      reloadSessions: loadSessions,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp harus dipakai di dalam AppProvider');
  return ctx;
}
