import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { predictRisk } from '../api';

const AppContext = createContext(null);

// Baca/simpan ke localStorage
const LS_KEY = 'hpr_sessions';
const loadSessions = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};
const saveSessions = (s) => localStorage.setItem(LS_KEY, JSON.stringify(s));

// Hitung health score (0–100) dari sesi hari ini
// Rumus: poin per jeda diambil tepat waktu, dikurangi overtime
function calcHealthScore(sessions) {
  const today = new Date().toDateString();
  const todaySessions = sessions.filter(
    (s) => new Date(s.start).toDateString() === today
  );
  if (todaySessions.length === 0) return 100;

  let score = 100;
  for (const s of todaySessions) {
    const durationMin = s.duration / 60;
    if (durationMin > 60) score -= 10;      // duduk > 1 jam tanpa jeda
    if (durationMin > 90) score -= 15;
    if (s.breaksTaken === 0 && durationMin > 30) score -= 5;
    if (s.breaksTaken > 0) score += 3;
  }
  return Math.max(0, Math.min(100, Math.round(score)));
}

// Total duduk hari ini (menit)
function calcTodaySitting(sessions) {
  const today = new Date().toDateString();
  return sessions
    .filter((s) => new Date(s.start).toDateString() === today)
    .reduce((acc, s) => acc + Math.round(s.duration / 60), 0);
}

export function AppProvider({ children }) {
  const [sessions, setSessions] = useState(loadSessions);
  const [riskLevel, setRiskLevel] = useState(null);   // 'Low'|'Medium'|'High'
  const [riskLoading, setRiskLoading] = useState(false);

  const healthScore = calcHealthScore(sessions);
  const totalSittingToday = calcTodaySitting(sessions);

  // Simpan ke localStorage setiap kali sessions berubah
  useEffect(() => { saveSessions(sessions); }, [sessions]);

  // Ambil prediksi risk dari backend
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

  // Tambah sesi baru setelah timer selesai
  const addSession = useCallback((session) => {
    setSessions((prev) => {
      const updated = [session, ...prev].slice(0, 100); // max 100 sesi
      return updated;
    });
    fetchRisk(totalSittingToday + Math.round(session.duration / 60));
  }, [fetchRisk, totalSittingToday]);

  // Hapus semua sesi (reset)
  const clearSessions = useCallback(() => {
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
