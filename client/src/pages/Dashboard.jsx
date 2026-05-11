import { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Timer from '../components/Timer';
import HealthScore from '../components/HealthScore';
import RiskCard from '../components/RiskCard';
import StatsCard from '../components/StatsCard';
import './Dashboard.css';

export default function Dashboard() {
  const { totalSittingToday, fetchRisk } = useApp();

  // Fetch risk saat pertama load berdasarkan data hari ini
  useEffect(() => {
    if (totalSittingToday > 0) fetchRisk(totalSittingToday);
  }, []); // eslint-disable-line

  const now = new Date();
  const greeting =
    now.getHours() < 12 ? 'Selamat Pagi' :
      now.getHours() < 17 ? 'Selamat Siang' : 'Selamat Sore';

  return (
    <main className="dashboard container">
      {/* Header */}
      <div className="dashboard__header fade-in">
        <div>
          <h1 className="dashboard__greeting">{greeting}! 👋</h1>
          <p className="dashboard__date">
            {now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="dashboard__tip">
          <em>Duduk tegak, layar sejajar mata, kaki rata di lantai.</em>
        </div>
      </div>

      {/* Stats row */}
      <div className="fade-in" style={{ animationDelay: '0.05s' }}>
        <StatsCard />
      </div>

      {/* Main grid */}
      <div className="dashboard__grid">
        {/* Left column */}
        <div className="dashboard__col-left">
          <div className="fade-in" style={{ animationDelay: '0.1s' }}>
            <Timer />
          </div>
          <div className="fade-in" style={{ animationDelay: '0.15s' }}>
            <BreakGuide />
          </div>
        </div>

        {/* Right column */}
        <div className="dashboard__col-right">
          <div className="fade-in" style={{ animationDelay: '0.12s' }}>
            <HealthScore />
          </div>
          <div className="fade-in" style={{ animationDelay: '0.18s' }}>
            <RiskCard />
          </div>
        </div>
      </div>
    </main>
  );
}

/* Inline sub-component: panduan peregangan */
function BreakGuide() {
  const STRETCHES = [
    { icon: '🙆', name: 'Regangkan leher', desc: 'Miringkan kepala kanan-kiri, 10 detik tiap sisi' },
    { icon: '🤸', name: 'Bahu & punggung', desc: 'Putar bahu ke belakang 10×' },
    { icon: '👁️', name: 'Istirahat mata', desc: 'Tutup mata 20 detik atau pandang jauh' },
    { icon: '🚶', name: 'Berjalan', desc: 'Jalan kaki minimal 2 menit' },
  ];

  return (
    <div className="break-guide card">
      <h3 className="break-guide__title">Panduan Peregangan</h3>
      <p className="break-guide__sub">Lakukan saat mengambil jeda</p>
      <ul className="break-guide__list">
        {STRETCHES.map((s) => (
          <li key={s.name} className="break-guide__item">
            <span className="break-guide__icon">{s.icon}</span>
            <div>
              <strong>{s.name}</strong>
              <p>{s.desc}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
