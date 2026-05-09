import { useEffect } from 'react';
import { useTimer, formatTime } from '../hooks/useTimer';
import { useApp } from '../context/AppContext';
import './Timer.css';

// Setiap 45 menit duduk → tampilkan peringatan
const BREAK_REMINDER_MINUTES = 45;

export default function Timer() {
  const { addSession, fetchRisk, totalSittingToday } = useApp();
  const {
    status, elapsedSitting, elapsedBreak, breaksTaken,
    startSitting, takeBreak, resumeSitting, stopSitting, reset,
  } = useTimer();

  // Auto-reminder setiap kelipatan 45 menit
  useEffect(() => {
    if (status === 'SITTING' && elapsedSitting > 0) {
      const minutes = Math.floor(elapsedSitting / 60);
      if (minutes > 0 && minutes % BREAK_REMINDER_MINUTES === 0 && elapsedSitting % 60 === 0) {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('⚠️ Healthy Posture Reminder', {
            body: `Kamu sudah duduk ${minutes} menit. Waktunya istirahat sebentar!`,
          });
        }
      }
    }
  }, [elapsedSitting, status]);

  // Minta izin notifikasi saat pertama render
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleStop = () => {
    const session = stopSitting();
    addSession(session);
  };

  const sittingMinutes = Math.floor(elapsedSitting / 60);
  const isLongSitting = sittingMinutes >= BREAK_REMINDER_MINUTES && status === 'SITTING';

  // Progres lingkaran (max 90 menit = full)
  const maxSeconds = 90 * 60;
  const progress = Math.min(elapsedSitting / maxSeconds, 1);
  const circumference = 2 * Math.PI * 90;
  const strokeDash = circumference * (1 - progress);

  return (
    <div className="timer-card card">
      <div className="timer-card__header">
        <h2 className="timer-card__title">Timer Duduk</h2>
        {status !== 'IDLE' && (
          <span className={`badge ${status === 'BREAK' ? 'badge-medium' : isLongSitting ? 'badge-high' : 'badge-low'}`}>
            {status === 'BREAK' ? '☕ Istirahat' : isLongSitting ? '⚠️ Terlalu lama!' : '✅ Aktif'}
          </span>
        )}
      </div>

      {/* Ring Progress */}
      <div className="timer-ring-wrap">
        <svg className="timer-ring" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="90" fill="none" stroke="var(--clr-bg-2)" strokeWidth="10" />
          <circle
            cx="100" cy="100" r="90"
            fill="none"
            stroke={isLongSitting ? 'var(--clr-danger)' : status === 'BREAK' ? 'var(--clr-warning)' : 'var(--clr-primary-light)'}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDash}
            transform="rotate(-90 100 100)"
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.4s ease' }}
          />
        </svg>

        <div className="timer-ring__inner">
          {status === 'BREAK' ? (
            <>
              <div className="timer-ring__label">Jeda ke-{breaksTaken + 1}</div>
              <div className="timer-ring__time break">{formatTime(elapsedBreak)}</div>
              <div className="timer-ring__sub">☕ istirahat</div>
            </>
          ) : (
            <>
              <div className="timer-ring__label">Duduk</div>
              <div className="timer-ring__time">{formatTime(elapsedSitting)}</div>
              <div className="timer-ring__sub">{breaksTaken} jeda diambil</div>
            </>
          )}
        </div>
      </div>

      {/* Warning banner */}
      {isLongSitting && (
        <div className="timer-warning">
          ⚠️ Kamu sudah duduk {sittingMinutes} menit — segera istirahat!
        </div>
      )}

      {/* Controls */}
      <div className="timer-controls">
        {status === 'IDLE' && (
          <button className="btn btn-primary btn--lg" onClick={startSitting}>
            ▶ Mulai Duduk
          </button>
        )}

        {status === 'SITTING' && (
          <>
            <button className="btn btn-accent" onClick={takeBreak}>
              ☕ Ambil Jeda
            </button>
            <button className="btn btn-danger" onClick={handleStop}>
              ⏹ Selesai
            </button>
          </>
        )}

        {status === 'BREAK' && (
          <button className="btn btn-primary" onClick={resumeSitting}>
            ▶ Lanjut Duduk
          </button>
        )}

        {status === 'FINISHED' && (
          <div className="timer-finished">
            <p className="timer-finished__msg">✅ Sesi selesai disimpan!</p>
            <button className="btn btn-secondary" onClick={reset}>
              🔄 Mulai Sesi Baru
            </button>
          </div>
        )}
      </div>

      {/* Mini stats */}
      <div className="timer-stats">
        <div className="timer-stat">
          <span className="timer-stat__val">{formatTime(elapsedSitting)}</span>
          <span className="timer-stat__key">Sesi ini</span>
        </div>
        <div className="timer-stat">
          <span className="timer-stat__val">{breaksTaken}</span>
          <span className="timer-stat__key">Jeda diambil</span>
        </div>
        <div className="timer-stat">
          <span className="timer-stat__val">{totalSittingToday} mnt</span>
          <span className="timer-stat__key">Total hari ini</span>
        </div>
      </div>
    </div>
  );
}
