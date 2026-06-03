import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  predictRisk,
  getSessions as apiGetSessions,
  createSession as apiCreateSession,
  deleteAllSessions as apiDeleteAllSessions,
} from '../api';
import { useAuth } from './AuthContext';
import { useTimer } from '../hooks/useTimer';

const BREAK_REMINDER_SECONDS = 30 * 60;

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
      raw.breakTaken ??
      raw.breaks_taken,
      0
    ),
  };
}

function isValidDate(value) {
  return value && !Number.isNaN(new Date(value).getTime());
}

// Logika health score sekarang pindah ke backend (server/src/utils/healthScore.js)

function calcTodaySitting(sessions) {
  const today = new Date().toDateString();
  return sessions
    .filter((s) => s && isValidDate(s.start) && new Date(s.start).toDateString() === today)
    .reduce((acc, s) => acc + Math.round(toNumber(s.duration) / 60), 0);
}

export function AppProvider({ children }) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [riskLevel, setRiskLevel] = useState(null);
  const [riskInsight, setRiskInsight] = useState(null);
  const [riskLoading, setRiskLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [baseHealthScore, setBaseHealthScore] = useState(100);

  // Inisialisasi global timer
  const timer = useTimer();

  // Gabungkan skor sesi dari API + prediksi AI lokal
  const riskModifier = riskLevel === 'High' ? -25 : riskLevel === 'Medium' ? -10 : riskLevel === 'Low' ? 5 : 0;
  const healthScore = Math.max(0, Math.min(100, baseHealthScore + riskModifier));
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
      if (data.baseHealthScore !== undefined) {
        setBaseHealthScore(data.baseHealthScore);
      }
    } catch (err) {
      console.warn('Gagal mengambil sessions:', err.message);
      setSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  // Muat ulang sessions setiap kali user berubah (login/logout/register)
  useEffect(() => {
    if (user) {
      // User baru login/register → muat sessions milik user ini
      loadSessions();
    } else {
      // User logout → bersihkan semua state
      setSessions([]);
      setRiskLevel(null);
      setRiskInsight(null);
      setBaseHealthScore(100);
      timer.reset();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const alarmAudioRef = useRef(null);

  // Hentikan alarm jika user melakukan action (jeda/selesai)
  useEffect(() => {
    if (timer.status !== 'SITTING' || riskLevel !== 'High') {
      // Jika status bukan SITTING, atau misalnya ingin mematikan alarm
      // Kita asumsikan kapanpun status bukan SITTING, matikan bunyi.
      if (timer.status !== 'SITTING') {
        if (alarmAudioRef.current) {
          alarmAudioRef.current.pause();
          alarmAudioRef.current.currentTime = 0;
          alarmAudioRef.current = null;
        }
      }
    }
  }, [timer.status]);

  const previousRisk = useRef(null);

  useEffect(() => {
    if (riskLevel === 'High' && previousRisk.current !== 'High') {
      if (!alarmAudioRef.current && timer.status === 'SITTING') {
        alarmAudioRef.current = new Audio('/alert.wav');
        alarmAudioRef.current.loop = true;
        alarmAudioRef.current.play().catch(e => console.log('Audio play blocked:', e));
      }

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🚨 BAHAYA: Risiko Tinggi!', {
          body: 'AI mendeteksi postur dan kebiasaan dudukmu saat ini sangat berisiko. Berdiri sekarang juga!',
        });
      }
    }
    previousRisk.current = riskLevel;
  }, [riskLevel, timer.status]);

  // Global break reminder (30 menit)
  useEffect(() => {
    if (timer.status === 'SITTING' && timer.continuousSitting > 0) {
      if (timer.continuousSitting % BREAK_REMINDER_SECONDS === 0) {
        // Mainkan suara peringatan dan LOOP terus menerus
        if (!alarmAudioRef.current) {
          alarmAudioRef.current = new Audio('/alert.wav');
          alarmAudioRef.current.loop = true;
          alarmAudioRef.current.play().catch(e => console.log('Audio play blocked:', e));
        }

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('⚠️ Peringatan Kesehatan', {
            body: `Kamu sudah duduk ${Math.floor(timer.continuousSitting / 60)} menit tanpa henti. Waktunya istirahat!`,
          });
        }
      }
    }
  }, [timer.continuousSitting, timer.status]);

  const fetchRisk = useCallback(async (minutes) => {
    setRiskLoading(true);
    try {
      const data = await predictRisk(minutes);
      setRiskLevel(data.data.risk_level);
      if (data.data.insight) {
        setRiskInsight(data.data.insight);
      }
    } catch (err) {
      console.warn('Risk prediction gagal:', err.message);
      setRiskLevel(null);
      setRiskInsight(null);
    } finally {
      setRiskLoading(false);
    }
  }, []);

  const addSession = useCallback(async (session) => {
    try {
      const payload = {
        startTime: session.start || session.startTime,
        endTime: session.end || session.endTime || new Date().toISOString(),
        duration: session.duration || 0,
        breakTaken: session.breaksTaken || 0,
        totalBreakTime: session.totalBreakTime || 0,
      };

      console.log('KIRIM SESSION:', payload);

      const data = await apiCreateSession(payload);
      const normalized = normalizeSession(data.session);
      setSessions((prev) => [normalized, ...prev]);
      if (data.baseHealthScore !== undefined) {
        setBaseHealthScore(data.baseHealthScore);
      }
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
    setRiskInsight(null);
    setBaseHealthScore(100);
  }, []);

  return (
    <AppContext.Provider value={{
      sessions,
      addSession,
      clearSessions,
      healthScore,
      totalSittingToday,
      riskLevel,
      riskInsight,
      riskLoading,
      fetchRisk,
      sessionsLoading,
      reloadSessions: loadSessions,
      timer, // expose timer globally
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
