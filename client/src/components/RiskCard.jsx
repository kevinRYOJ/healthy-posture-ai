import { useState } from 'react';
import { useApp } from '../context/AppContext';

const RISK_INFO = {
  Low: {
    emoji: '✅', label: 'Rendah', color: '#15803D', bg: '#DCFCE7', border: '#86EFAC',
    desc: 'Pola dudukmu sudah bagus! Pertahankan kebiasaan istirahat rutin.',
  },
  Medium: {
    emoji: '⚠️', label: 'Sedang', color: '#A16207', bg: '#FEF9C3', border: '#FDE047',
    desc: 'Perhatikan durasi dudukmu. Pastikan mengambil jeda setiap 45 menit.',
  },
  Tinggi: {
    emoji: '🔴', label: 'Tinggi', color: '#DC2626', bg: '#FEE2E2', border: '#FCA5A5',
    desc: 'Risiko postur buruk tinggi! Segera istirahat dan lakukan peregangan.',
  },
};

const TIPS = {
  Low:    ['Lakukan peregangan ringan tiap jam', 'Pastikan monitor sejajar mata', 'Minum air setiap 30 menit'],
  Medium: ['Istirahat 5 menit tiap 45 menit', 'Cek posisi punggung & leher', 'Pertimbangkan standing desk'],
  Tinggi:   ['Istirahat SEKARANG minimal 15 menit', 'Lakukan peregangan punggung & leher', 'Batasi duduk max 1 jam tanpa jeda'],
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
    <div className="bg-white rounded-lg p-8 shadow-md border border-border flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[1.25rem] text-primary font-heading font-bold">Prediksi Risiko AI</h2>
        <span className="text-[0.72rem] font-mono bg-primary text-white px-2 py-[0.2rem] rounded-sm">🤖 /predict</span>
      </div>
      <p className="text-[0.84rem] text-text-secondary -mt-[0.4rem]">
        Berdasarkan total duduk hari ini ({totalSittingToday} menit)
      </p>

      {/* Result */}
      {riskLoading ? (
        <div className="flex items-center gap-4 p-6 text-text-secondary">
          <div className="w-6 h-6 border-[3px] border-bg-2 border-t-primary rounded-full animate-spin" />
          <span>Menganalisis...</span>
        </div>
      ) : info ? (
        <div
          className="rounded-md border p-4 animate-fade-in flex flex-col gap-4"
          style={{ background: info.bg, borderColor: info.border }}
        >
          <div className="flex items-start gap-4">
            <span className="text-[2rem]">{info.emoji}</span>
            <div>
              <div className="text-base font-semibold mb-1" style={{ color: info.color }}>
                Risiko <strong>{info.label}</strong>
              </div>
              <p className="text-[0.84rem] text-text">{info.desc}</p>
            </div>
          </div>

          <ul className="list-none flex flex-col gap-[0.4rem]">
            {tips.map((tip) => (
              <li key={tip} className="flex items-center gap-2 text-[0.84rem]">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: info.color }} />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center py-8 text-text-secondary flex flex-col items-center gap-2">
          <span className="text-[2.5rem]">🤔</span>
          <p>Belum ada prediksi.</p>
          <p className="text-[0.82rem]">Mulai timer untuk mendapat analisis otomatis.</p>
        </div>
      )}

      {/* Manual check */}
      <div className="pt-4 border-t border-border flex flex-col gap-2">
        <p className="text-[0.82rem] text-text-secondary">Cek manual (masukkan menit duduk):</p>
        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            max="600"
            placeholder="mis. 120"
            value={manualMin}
            onChange={(e) => setManualMin(e.target.value)}
            className="flex-1 px-[0.9rem] py-[0.6rem] border-[1.5px] border-border rounded-full text-[0.9rem] font-body text-text bg-bg outline-none focus:border-primary-light transition-colors"
          />
          <button
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-[0.95rem] font-semibold transition-all bg-primary text-white shadow-[0_4px_14px_rgba(15,118,110,0.4)] hover:bg-primary-dark hover:-translate-y-px cursor-pointer border-none"
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
