import { useApp } from '../context/AppContext';

function StatItem({ label, value, sub, color }) {
  return (
    <div className="relative flex items-center gap-4 p-4 bg-bg rounded-md border border-border transition-transform hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex flex-col">
        <div className="font-heading text-[1.4rem] font-bold leading-tight" style={{ color: color }}>{value}</div>
        <div className="text-[0.78rem] font-semibold text-text uppercase tracking-wide">{label}</div>

        {sub && (
          <div className="text-[0.72rem] text-text-secondary mt-px">
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

function isValidDate(value) {
  return value && !Number.isNaN(new Date(value).getTime());
}

export default function StatsCard() {
  const {
    sessions = [],
    totalSittingToday = 0,
    healthScore = 100,
  } = useApp();

  const today = new Date().toDateString();

  const todaySessions = sessions.filter(
    (s) =>
      s &&
      isValidDate(s.start) &&
      new Date(s.start).toDateString() === today
  );

  const totalBreaks = todaySessions.reduce(
    (acc, s) => acc + (s.breaksTaken || 0),
    0
  );

  const longestSitting = todaySessions.reduce(
    (max, s) =>
      Math.max(
        max,
        Math.floor((s.duration || 0) / 60)
      ),
    0
  );

  const sitting = totalSittingToday;

  const sittingStatus =
    sitting > 480
      ? 'Berbahaya'
      : sitting > 300
        ? 'Sedang'
        : 'Baik';

  return (
    <div className="bg-white rounded-lg p-8 shadow-md border border-border flex flex-col gap-4">
      <h2 className="text-[1.25rem] text-primary font-heading font-bold">
        Ringkasan Hari Ini
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatItem
          label="Total Duduk"
          value={`${sitting} mnt`}
          sub={sittingStatus}
          color="var(--color-primary)"
        />

        <StatItem
          label="Jeda Diambil"
          value={totalBreaks}
          sub={`dari ${todaySessions.length} sesi`}
          color="var(--color-accent)"
        />

        <StatItem
          label="Terlama Duduk"
          value={`${longestSitting} mnt`}
          sub={
            longestSitting > 60
              ? '⚠️ terlalu lama'
              : '✅ oke'
          }
          color="var(--color-warning)"
        />

        <StatItem
          icon="💯"
          label="Health Score"
          value={healthScore}
          sub="/ 100"
          color="var(--color-success)"
        />
      </div>
    </div>
  );
}