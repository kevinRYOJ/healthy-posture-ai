import { useApp } from '../context/AppContext';
import './StatsCard.css';

function StatItem({ icon, label, value, sub, color }) {
  return (
    <div className="stat-item" style={{ '--accent': color }}>
      <div className="stat-item__icon">{icon}</div>
      <div className="stat-item__body">
        <div className="stat-item__value">{value}</div>
        <div className="stat-item__label">{label}</div>
        {sub && <div className="stat-item__sub">{sub}</div>}
      </div>
    </div>
  );
}

export default function StatsCard() {
  const { sessions, totalSittingToday, healthScore } = useApp();

  const today = new Date().toDateString();
  const todaySessions = sessions.filter(
    (s) => new Date(s.start).toDateString() === today
  );
  const totalBreaks = todaySessions.reduce((acc, s) => acc + s.breaksTaken, 0);
  const longestSitting = todaySessions.reduce(
    (max, s) => Math.max(max, Math.floor(s.duration / 60)), 0
  );

  const sitting = totalSittingToday;
  const sittingStatus =
    sitting > 480 ? 'Berbahaya' :
    sitting > 300 ? 'Sedang'    : 'Baik';

  return (
    <div className="stats-wrap card">
      <h2 className="stats-title">Ringkasan Hari Ini</h2>
      <div className="stats-grid">
        <StatItem
          icon="🪑"
          label="Total Duduk"
          value={`${sitting} mnt`}
          sub={sittingStatus}
          color="var(--clr-primary)"
        />
        <StatItem
          icon="☕"
          label="Jeda Diambil"
          value={totalBreaks}
          sub={`dari ${todaySessions.length} sesi`}
          color="var(--clr-accent)"
        />
        <StatItem
          icon="⏱️"
          label="Terlama Duduk"
          value={`${longestSitting} mnt`}
          sub={longestSitting > 60 ? '⚠️ terlalu lama' : '✅ oke'}
          color="var(--clr-warning)"
        />
        <StatItem
          icon="💯"
          label="Health Score"
          value={healthScore}
          sub="/ 100"
          color="var(--clr-success)"
        />
      </div>
    </div>
  );
}
