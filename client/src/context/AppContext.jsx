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

function calcHealthScore(sessions, user) {
  let baseScore = 100;

  // Denda berdasarkan data personalisasi profil user
  if (user && user.has_personalized) {
    const bmi = parseFloat(user.bmi);
    if (!isNaN(bmi)) {
      if (bmi > 30) baseScore -= 10;
      else if (bmi > 25) baseScore -= 5;
    }
    const sleep = parseFloat(user.sleep_hours);
    if (!isNaN(sleep)) {
      if (sleep < 5) baseScore -= 10;
      else if (sleep < 6) baseScore -= 5;
    }
    if (user.fitness_level === 'Low') baseScore -= 10;
    else if (user.fitness_level === 'Medium') baseScore -= 5;
  }

  const today = new Date().toDateString();
  const todaySessions = sessions.filter(
    (s) => s && isValidDate(s.start) && new Date(s.start).toDateString() === today
  );

  // Jika belum ada sesi duduk, skor hanya terpengaruh profil
  if (todaySessions.length === 0) return Math.min(100, Math.max(0, Math.round(baseScore)));

  // Hitung penalti dari sesi duduk
  let score = baseScore;
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
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [riskLevel, setRiskLevel] = useState(null);
  const [riskLoading, setRiskLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  // Inisialisasi global timer
  const timer = useTimer();

  // Gabungkan skor sesi lokal + prediksi AI + personalisasi user
  const baseScore = calcHealthScore(sessions, user);
  const riskModifier = riskLevel === 'Tinggi' ? -25 : riskLevel === 'Medium' ? -10 : riskLevel === 'Low' ? 5 : 0;
  const healthScore = Math.max(0, Math.min(100, baseScore + riskModifier));
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

  const alarmAudioRef = useRef(null);

  // Hentikan alarm jika user melakukan action (jeda/selesai)
  useEffect(() => {
    if (timer.status !== 'SITTING' || riskLevel !== 'Tinggi') {
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
    if (riskLevel === 'Tinggi' && previousRisk.current !== 'Tinggi') {
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
    } catch (err) {
      console.warn('Risk prediction gagal:', err.message);
      setRiskLevel(null);
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
