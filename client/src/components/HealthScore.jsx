import { useApp } from '../context/AppContext';

const LEVELS = [
  { min: 80, label: 'Champion', color: '#22C55E' },
  { min: 60, label: 'Aktif',    color: '#14B8A6' },
  { min: 40, label: 'Berkembang', color: '#EAB308' },
  { min: 0,  label: 'Pemula',   color: '#EF4444' },
];

function getLevel(score) {
  return LEVELS.find((l) => score >= l.min) || LEVELS[LEVELS.length - 1];
}

export default function HealthScore() {
  const { healthScore } = useApp();
  const level = getLevel(healthScore);

  const r = 72;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - healthScore / 100);

  return (
    <div className="bg-white rounded-lg p-8 shadow-md border border-border flex flex-col gap-4">
      <h2 className="text-[1.25rem] text-primary font-heading font-bold">Health Score</h2>
      <p className="text-[0.85rem] text-text-secondary -mt-2">Skor postur hari ini</p>

      <div className="relative w-[180px] h-[180px] mx-auto">
        <svg viewBox="0 0 180 180" className="w-full h-full">
          {/* Track */}
          <circle cx="90" cy="90" r={r} fill="none" stroke="var(--color-bg-2)" strokeWidth="14" />
          {/* Progress */}
          <circle
            cx="90" cy="90" r={r}
            fill="none"
            stroke={level.color}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            transform="rotate(-90 90 90)"
            style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.4s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-heading text-[2.5rem] font-extrabold leading-none tracking-tight" style={{ color: level.color }}>{healthScore}</span>
          <span className="text-[0.8rem] text-text-secondary mt-1">/100</span>
        </div>
      </div>

      <div className="text-center px-4 py-2 rounded-full text-[0.9rem] font-medium" style={{ background: level.color + '18', color: level.color }}>
        Level: <strong>{level.label}</strong>
      </div>

      {/* Level legend */}
      <div className="grid grid-cols-2 gap-[0.4rem] mt-1">
        {LEVELS.map((l) => {
          const isActive = level.label === l.label;
          return (
            <div key={l.label} className={`flex items-center gap-[0.35rem] text-[0.78rem] px-2 py-[0.3rem] rounded-sm transition-all ${isActive ? 'text-text bg-bg-2 font-semibold ring-1 ring-primary-light/50' : 'text-text-secondary'}`}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color, opacity: isActive ? 1 : 0.6 }} />
              <span>{l.label}</span>
              <span className="ml-auto text-[0.72rem] text-text-secondary opacity-70">{l.min}+</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
