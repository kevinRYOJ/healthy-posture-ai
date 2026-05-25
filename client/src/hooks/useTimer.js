import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useTimer — logika timer duduk
 *
 * States:
 *  - IDLE      : belum mulai
 *  - SITTING   : sedang duduk, timer jalan
 *  - BREAK     : sedang istirahat, timer jeda jalan
 *  - FINISHED  : sesi selesai
 *
 * Returns: {
 *   status, elapsedSitting, elapsedBreak, breaksTaken,
 *   startSitting, takeBreak, resumeSitting, stopSitting, reset
 * }
 */
export function useTimer() {
  const [status, setStatus] = useState('IDLE');          // IDLE | SITTING | BREAK | FINISHED
  const [elapsedSitting, setElapsedSitting] = useState(0);  // detik (akumulasi)
  const [continuousSitting, setContinuousSitting] = useState(0); // detik tanpa jeda
  const [elapsedBreak, setElapsedBreak]   = useState(0);    // detik jeda saat ini
  const [totalBreakTime, setTotalBreakTime] = useState(0);  // total detik jeda
  const [breaksTaken, setBreaksTaken]     = useState(0);

  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);   // kapan mulai duduk (akumulasi)
  const continuousStartRef = useRef(null); // kapan mulai duduk (tanpa jeda)
  const breakStartRef = useRef(null);  // kapan mulai jeda

  const clearTick = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  // Mulai duduk
  const startSitting = useCallback(() => {
    startTimeRef.current = Date.now() - elapsedSitting * 1000;
    continuousStartRef.current = Date.now();
    setStatus('SITTING');
    clearTick();
    intervalRef.current = setInterval(() => {
      setElapsedSitting(Math.round((Date.now() - startTimeRef.current) / 1000));
      setContinuousSitting(Math.round((Date.now() - continuousStartRef.current) / 1000));
    }, 1000);
  }, [elapsedSitting]);

  // Ambil jeda
  const takeBreak = useCallback(() => {
    clearTick();
    breakStartRef.current = Date.now();
    setStatus('BREAK');
    setElapsedBreak(0);
    setContinuousSitting(0);
    intervalRef.current = setInterval(() => {
      setElapsedBreak(Math.round((Date.now() - breakStartRef.current) / 1000));
    }, 1000);
  }, []);

  // Lanjut duduk setelah jeda
  const resumeSitting = useCallback(() => {
    const breakDuration = Math.round((Date.now() - breakStartRef.current) / 1000);
    setTotalBreakTime((prev) => prev + breakDuration);
    setBreaksTaken((prev) => prev + 1);
    setElapsedBreak(0);
    setContinuousSitting(0);
    
    startTimeRef.current = Date.now() - elapsedSitting * 1000;
    continuousStartRef.current = Date.now();
    
    setStatus('SITTING');
    clearTick();
    intervalRef.current = setInterval(() => {
      setElapsedSitting(Math.round((Date.now() - startTimeRef.current) / 1000));
      setContinuousSitting(Math.round((Date.now() - continuousStartRef.current) / 1000));
    }, 1000);
  }, [elapsedSitting]);

  // Selesai — kembalikan objek sesi
  const stopSitting = useCallback(() => {
    clearTick();
    setStatus('FINISHED');
    const session = {
      id: Date.now(),
      start: new Date(startTimeRef.current).toISOString(),
      end: new Date().toISOString(),
      duration: elapsedSitting,        // detik
      totalBreakTime,                  // detik
      breaksTaken,
    };
    return session;
  }, [elapsedSitting, totalBreakTime, breaksTaken]);

  // Reset ke awal
  const reset = useCallback(() => {
    clearTick();
    setStatus('IDLE');
    setElapsedSitting(0);
    setElapsedBreak(0);
    setTotalBreakTime(0);
    setBreaksTaken(0);
    startTimeRef.current = null;
    breakStartRef.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => () => clearTick(), []);

  return {
    status,
    elapsedSitting,
    continuousSitting,
    elapsedBreak,
    breaksTaken,
    totalBreakTime,
    startSitting,
    takeBreak,
    resumeSitting,
    stopSitting,
    reset,
  };
}

// Helper format detik → MM:SS atau HH:MM:SS
export function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n) => String(n).padStart(2, '0');
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}
