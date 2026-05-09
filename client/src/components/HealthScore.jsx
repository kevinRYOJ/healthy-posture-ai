import { useApp } from '../context/AppContext';
import './HealthScore.css';

const LEVELS = [
  { min: 80, label: 'Champion', emoji: '🏆', color: '#22C55E' },
  { min: 60, label: 'Aktif',    emoji: '💪', color: '#14B8A6' },
  { min: 40, label: 'Berkembang', emoji: '🌱', color: '#EAB308' },
  { min: 0,  label: 'Pemula',   emoji: '🐢', color: '#EF4444' },
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
    <div className="hs-card card">
      <h2 className="hs-card__title">Health Score</h2>
      <p className="hs-card__sub">Skor postur hari ini</p>

      <div className="hs-ring-wrap">
        <svg viewBox="0 0 180 180" className="hs-ring">
          {/* Track */}
          <circle cx="90" cy="90" r={r} fill="none" stroke="var(--clr-bg-2)" strokeWidth="14" />
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
        <div className="hs-ring__center">
          <span className="hs-ring__emoji">{level.emoji}</span>
          <span className="hs-ring__score" style={{ color: level.color }}>{healthScore}</span>
          <span className="hs-ring__max">/100</span>
        </div>
      </div>

      <div className="hs-level" style={{ background: level.color + '18', color: level.color }}>
        {level.emoji} Level: <strong>{level.label}</strong>
      </div>

      {/* Level legend */}
      <div className="hs-legend">
        {LEVELS.map((l) => (
          <div key={l.label} className={`hs-legend-item ${healthScore >= l.min ? 'active' : ''}`}>
            <span style={{ color: l.color }}>{l.emoji}</span>
            <span>{l.label}</span>
            <span className="hs-legend-min">{l.min}+</span>
          </div>
        ))}
      </div>
    </div>
  );
}
