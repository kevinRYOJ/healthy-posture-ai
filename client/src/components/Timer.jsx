import { useEffect } from 'react';
import { formatTime } from '../hooks/useTimer';
import { useApp } from '../context/AppContext';

export default function Timer() {
  const { addSession, fetchRisk, totalSittingToday, timer } = useApp();
  const {
    status, elapsedSitting, continuousSitting, elapsedBreak, breaksTaken,
    startSitting, takeBreak, resumeSitting, stopSitting, reset,
  } = timer;

  // Minta izin notifikasi saat pertama render
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleStop = () => {
    const session = stopSitting();
    addSession(session);
    // Auto-predict setelah sesi selesai
    const newTotalMinutes = totalSittingToday + Math.round(session.duration / 60);
    fetchRisk(newTotalMinutes);
  };

  const sittingMinutes = Math.floor(elapsedSitting / 60);
  const isLongSitting = Math.floor(continuousSitting / 60) >= 30 && status === 'SITTING';

  // Progres lingkaran (max 90 menit = full)
  const maxSeconds = 90 * 60;
  const progress = Math.min(elapsedSitting / maxSeconds, 1);
  const circumference = 2 * Math.PI * 90;
  const strokeDash = circumference * (1 - progress);

  return (
    <div className="bg-white rounded-lg p-8 shadow-md border border-border flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[1.25rem] text-primary font-heading font-bold">Timer Duduk</h2>
        {status !== 'IDLE' && (
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${status === 'BREAK' ? 'bg-yellow-100 text-yellow-700' : isLongSitting ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
            {status === 'BREAK' ? '☕ Istirahat' : isLongSitting ? '⚠️ Terlalu lama!' : '✅ Aktif'}
          </span>
        )}
      </div>

      {/* Ring Progress */}
      <div className="relative w-[200px] h-[200px] mx-auto">
        <svg className="w-full h-full" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="90" fill="none" stroke="var(--color-bg-2)" strokeWidth="10" />
          <circle
            cx="100" cy="100" r="90"
            fill="none"
            stroke={isLongSitting ? 'var(--color-danger)' : status === 'BREAK' ? 'var(--color-warning)' : 'var(--color-primary-light)'}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDash}
            transform="rotate(-90 100 100)"
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.4s ease' }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-0.5">
          {status === 'BREAK' ? (
            <>
              <div className="text-[0.72rem] font-semibold tracking-widest uppercase text-text-secondary">Jeda ke-{breaksTaken + 1}</div>
              <div className="font-heading text-[2.4rem] font-bold text-warning tracking-tight leading-none animate-count-up">{formatTime(elapsedBreak)}</div>
              <div className="text-[0.78rem] text-text-secondary">☕ istirahat</div>
            </>
          ) : (
            <>
              <div className="text-[0.72rem] font-semibold tracking-widest uppercase text-text-secondary">Duduk</div>
              <div className="font-heading text-[2.4rem] font-bold text-primary tracking-tight leading-none animate-count-up">{formatTime(elapsedSitting)}</div>
              <div className="text-[0.78rem] text-text-secondary">{breaksTaken} jeda diambil</div>
            </>
          )}
        </div>
      </div>

      {/* Warning banner */}
      {isLongSitting && (
        <div className="bg-red-50 border border-red-200 rounded-md px-4 py-3 text-[0.88rem] font-medium text-danger text-center animate-fade-in">
          ⚠️ Kamu sudah duduk {sittingMinutes} menit — segera istirahat!
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-2 justify-center flex-wrap">
        {status === 'IDLE' && (
          <button className="inline-flex items-center justify-center gap-2 px-[2.2rem] py-[0.9rem] rounded-full text-base font-semibold transition-all bg-primary text-white shadow-[0_4px_14px_rgba(15,118,110,0.4)] hover:bg-primary-dark hover:-translate-y-px cursor-pointer border-none" onClick={startSitting}>
            ▶ Mulai Duduk
          </button>
        )}

        {status === 'SITTING' && (
          <>
            <button className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-[0.95rem] font-semibold transition-all bg-accent text-white shadow-[0_4px_14px_rgba(249,115,22,0.35)] hover:bg-[#EA6C0A] hover:-translate-y-px cursor-pointer border-none" onClick={takeBreak}>
              ☕ Ambil Jeda
            </button>
            <button className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-[0.95rem] font-semibold transition-all bg-danger text-white shadow-[0_4px_14px_rgba(239,68,68,0.3)] hover:bg-[#DC2626] hover:-translate-y-px cursor-pointer border-none" onClick={handleStop}>
              ⏹ Selesai
            </button>
          </>
        )}

        {status === 'BREAK' && (
          <button className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-[0.95rem] font-semibold transition-all bg-primary text-white shadow-[0_4px_14px_rgba(15,118,110,0.4)] hover:bg-primary-dark hover:-translate-y-px cursor-pointer border-none" onClick={resumeSitting}>
            ▶ Lanjut Duduk
          </button>
        )}

        {status === 'FINISHED' && (
          <div className="flex flex-col items-center gap-2">
            <p className="font-semibold text-success">✅ Sesi selesai disimpan!</p>
            <button className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-[0.95rem] font-semibold transition-all bg-bg-2 text-primary border-2 border-primary-light hover:bg-primary-light hover:text-white cursor-pointer" onClick={reset}>
              🔄 Mulai Sesi Baru
            </button>
          </div>
        )}
      </div>

      {/* Mini stats */}
      <div className="flex justify-around pt-4 border-t border-border">
        <div className="flex flex-col items-center gap-0.5">
          <span className="font-heading text-[1.1rem] font-bold text-primary">{formatTime(elapsedSitting)}</span>
          <span className="text-[0.73rem] text-text-secondary uppercase tracking-wide">Sesi ini</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="font-heading text-[1.1rem] font-bold text-primary">{breaksTaken}</span>
          <span className="text-[0.73rem] text-text-secondary uppercase tracking-wide">Jeda diambil</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="font-heading text-[1.1rem] font-bold text-primary">{totalSittingToday} mnt</span>
          <span className="text-[0.73rem] text-text-secondary uppercase tracking-wide">Total hari ini</span>
        </div>
      </div>
    </div>
  );
}
