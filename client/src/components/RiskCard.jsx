import { useState } from 'react';
import { useApp } from '../context/AppContext';
import './RiskCard.css';

const RISK_INFO = {
  Low: {
    emoji: '✅', label: 'Rendah', color: '#15803D', bg: '#DCFCE7', border: '#86EFAC',
    desc: 'Pola dudukmu sudah bagus! Pertahankan kebiasaan istirahat rutin.',
  },
  Medium: {
    emoji: '⚠️', label: 'Sedang', color: '#A16207', bg: '#FEF9C3', border: '#FDE047',
    desc: 'Perhatikan durasi dudukmu. Pastikan mengambil jeda setiap 45 menit.',
  },
  High: {
    emoji: '🔴', label: 'Tinggi', color: '#DC2626', bg: '#FEE2E2', border: '#FCA5A5',
    desc: 'Risiko postur buruk tinggi! Segera istirahat dan lakukan peregangan.',
  },
};

const TIPS = {
  Low:    ['Lakukan peregangan ringan tiap jam', 'Pastikan monitor sejajar mata', 'Minum air setiap 30 menit'],
  Medium: ['Istirahat 5 menit tiap 45 menit', 'Cek posisi punggung & leher', 'Pertimbangkan standing desk'],
  High:   ['Istirahat SEKARANG minimal 15 menit', 'Lakukan peregangan punggung & leher', 'Batasi duduk max 1 jam tanpa jeda'],
};

export default function RiskCard() {
  const { riskLevel, riskLoading, totalSittingToday, fetchRisk } = useApp();
  const [manualMin, setManualMin] = useState('');

  const info = riskLevel ? RISK_INFO[riskLevel] : null;
  const tips = riskLevel ? TIPS[riskLevel] : [];

  const handleManualCheck = () => {
    const val = parseInt(manualMin, 10);
    if (!isNaN(val) && val >= 0) fetchRisk(val);
  };

  return (
    <div className="risk-card card">
      <div className="risk-card__header">
        <h2 className="risk-card__title">Prediksi Risiko AI</h2>
        <span className="risk-card__badge-api">🤖 /predict</span>
      </div>
      <p className="risk-card__sub">
        Berdasarkan total duduk hari ini ({totalSittingToday} menit)
      </p>

      {/* Result */}
      {riskLoading ? (
        <div className="risk-loading">
          <div className="risk-spinner" />
          <span>Menganalisis...</span>
        </div>
      ) : info ? (
        <div
          className="risk-result"
          style={{ background: info.bg, borderColor: info.border }}
        >
          <div className="risk-result__top">
            <span className="risk-result__emoji">{info.emoji}</span>
            <div>
              <div className="risk-result__level" style={{ color: info.color }}>
                Risiko <strong>{info.label}</strong>
              </div>
              <p className="risk-result__desc">{info.desc}</p>
            </div>
          </div>

          <ul className="risk-tips">
            {tips.map((tip) => (
              <li key={tip} className="risk-tip">
                <span className="risk-tip__dot" style={{ background: info.color }} />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="risk-empty">
          <span className="risk-empty__icon">🤔</span>
          <p>Belum ada prediksi.</p>
          <p className="risk-empty__hint">Mulai timer untuk mendapat analisis otomatis.</p>
        </div>
      )}

      {/* Manual check */}
      <div className="risk-manual">
        <p className="risk-manual__label">Cek manual (masukkan menit duduk):</p>
        <div className="risk-manual__row">
          <input
            type="number"
            min="0"
            max="600"
            placeholder="mis. 120"
            value={manualMin}
            onChange={(e) => setManualMin(e.target.value)}
            className="risk-manual__input"
          />
          <button
            className="btn btn-primary"
            onClick={handleManualCheck}
            disabled={riskLoading}
          >
            Cek
          </button>
        </div>
      </div>
    </div>
  );
}
