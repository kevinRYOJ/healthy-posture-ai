import { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Timer from '../components/Timer';
import HealthScore from '../components/HealthScore';
import RiskCard from '../components/RiskCard';
import StatsCard from '../components/StatsCard';

export default function Dashboard() {
  const { totalSittingToday, fetchRisk } = useApp();

  // Fetch risk saat pertama load berdasarkan data hari ini
  useEffect(() => {
    fetchRisk(totalSittingToday);
  }, []); // eslint-disable-line

  const now = new Date();
  const greeting =
    now.getHours() < 12 ? 'Selamat Pagi' :
    now.getHours() < 17 ? 'Selamat Siang' : 'Selamat Sore';

  return (
    <main className="max-w-[1100px] mx-auto px-6 pt-8 pb-12 flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 animate-fade-in">
        <div>
          <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-extrabold text-text">{greeting}!</h1>
          <p className="text-[0.9rem] text-text-secondary mt-1 capitalize">
            {now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="bg-bg-2 rounded-md px-4 py-[0.6rem] text-[0.84rem] text-primary max-w-[340px] border-l-[3px] border-primary-light">
          <em>Duduk tegak, layar sejajar mata, kaki rata di lantai.</em>
        </div>
      </div>

      {/* Main vertical layout - Stacked cards */}
      <div className="flex flex-col gap-8">
        <div className="animate-fade-in" style={{ animationDelay: '0.05s' }}>
          <StatsCard />
        </div>
        
        <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <Timer />
        </div>
        
        <div className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <BreakGuide />
        </div>
        
        <div className="animate-fade-in" style={{ animationDelay: '0.12s' }}>
          <HealthScore />
        </div>
        
        <div className="animate-fade-in" style={{ animationDelay: '0.18s' }}>
          <RiskCard />
        </div>
      </div>
    </main>
  );
}

/* Inline sub-component: panduan peregangan */
function BreakGuide() {
  const STRETCHES = [
    { name: 'Regangkan leher', desc: 'Miringkan kepala kanan-kiri, 10 detik tiap sisi' },
    { name: 'Bahu & punggung', desc: 'Putar bahu ke belakang 10×' },
    { name: 'Istirahat mata', desc: 'Tutup mata 20 detik atau pandang jauh' },
    { name: 'Berjalan', desc: 'Jalan kaki minimal 2 menit' },
  ];

  return (
    <div className="bg-white rounded-lg p-8 shadow-md border border-border flex flex-col gap-4">
      <h3 className="text-[1.1rem] text-primary font-heading font-bold">Panduan Peregangan</h3>
      <p className="text-[0.82rem] text-text-secondary -mt-[0.4rem]">Lakukan saat mengambil jeda</p>
      <ul className="list-none flex flex-col gap-2">
        {STRETCHES.map((s) => (
          <li key={s.name} className="flex flex-col justify-center px-4 py-[0.65rem] bg-bg rounded-md border border-border text-[0.84rem]">
            <strong className="block font-semibold text-text">{s.name}</strong>
            <p className="text-text-secondary text-[0.78rem]">{s.desc}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
