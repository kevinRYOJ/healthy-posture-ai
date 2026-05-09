import { useApp } from '../context/AppContext';
import { formatTime } from '../hooks/useTimer';
import './History.css';

function formatDate(iso) {
  return new Date(iso).toLocaleString('id-ID', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
  });
}

function ScoreBar({ value }) {
  const pct = Math.min(value, 100);
  const color = pct >= 80 ? '#22C55E' : pct >= 50 ? '#EAB308' : '#EF4444';
  return (
    <div className="score-bar">
      <div className="score-bar__track">
        <div
          className="score-bar__fill"
          style={{ width: pct + '%', background: color }}
        />
      </div>
      <span style={{ color }}>{pct}</span>
    </div>
  );
}

export default function History() {
  const { sessions, clearSessions } = useApp();

  const today = new Date().toDateString();
  const todaySessions = sessions.filter(
    (s) => new Date(s.start).toDateString() === today
  );
  const pastSessions = sessions.filter(
    (s) => new Date(s.start).toDateString() !== today
  );

  if (sessions.length === 0) {
    return (
      <main className="history container">
        <div className="history__empty card">
          <span className="history__empty-icon">📭</span>
          <h2>Belum ada riwayat</h2>
          <p>Mulai session duduk pertamamu di Dashboard!</p>
        </div>
      </main>
    );
  }

  return (
    <main className="history container">
      <div className="history__header fade-in">
        <div>
          <h1 className="history__title">Riwayat Sesi</h1>
          <p className="history__sub">{sessions.length} sesi tersimpan</p>
        </div>
        <button className="btn btn-secondary" onClick={clearSessions}>
          🗑️ Hapus Semua
        </button>
      </div>

      {todaySessions.length > 0 && (
        <section className="history-section fade-in">
          <h2 className="history-section__title">Hari Ini</h2>
          <SessionTable sessions={todaySessions} />
        </section>
      )}

      {pastSessions.length > 0 && (
        <section className="history-section fade-in" style={{ animationDelay: '0.1s' }}>
          <h2 className="history-section__title">Sebelumnya</h2>
          <SessionTable sessions={pastSessions} />
        </section>
      )}

      {/* Summary */}
      <div className="history-summary card fade-in" style={{ animationDelay: '0.15s' }}>
        <h3>Statistik Keseluruhan</h3>
        <div className="history-summary__grid">
          <Stat label="Total Sesi" value={sessions.length} />
          <Stat
            label="Total Duduk"
            value={`${sessions.reduce((a, s) => a + Math.floor(s.duration / 60), 0)} mnt`}
          />
          <Stat
            label="Total Jeda"
            value={sessions.reduce((a, s) => a + s.breaksTaken, 0)}
          />
          <Stat
            label="Rata-rata Durasi"
            value={`${Math.round(sessions.reduce((a, s) => a + s.duration / 60, 0) / sessions.length)} mnt`}
          />
        </div>
      </div>
    </main>
  );
}

function SessionTable({ sessions }) {
  return (
    <div className="session-table-wrap card">
      <table className="session-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Mulai</th>
            <th>Durasi Duduk</th>
            <th>Jeda</th>
            <th>Total Istirahat</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s, i) => (
            <tr key={s.id} className={Math.floor(s.duration / 60) > 90 ? 'row--warn' : ''}>
              <td className="col-num">{i + 1}</td>
              <td className="col-date">{formatDate(s.start)}</td>
              <td className="col-dur">
                <strong>{formatTime(s.duration)}</strong>
                {Math.floor(s.duration / 60) > 90 && (
                  <span className="warn-badge"> ⚠️</span>
                )}
              </td>
              <td className="col-breaks">
                <span className={`badge ${s.breaksTaken > 0 ? 'badge-low' : 'badge-high'}`}>
                  {s.breaksTaken}×
                </span>
              </td>
              <td className="col-btime">{formatTime(s.totalBreakTime || 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="hist-stat">
      <span className="hist-stat__val">{value}</span>
      <span className="hist-stat__lbl">{label}</span>
    </div>
  );
}
