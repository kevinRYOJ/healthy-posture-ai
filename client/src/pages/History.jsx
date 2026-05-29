import { useApp } from '../context/AppContext';
import { formatTime } from '../hooks/useTimer';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Trash2 } from 'lucide-react';

function formatDate(iso) {
  return new Date(iso).toLocaleString('id-ID', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
  });
}

// Menghitung data grafik per hari (7 hari terakhir)
function processChartData(sessions) {
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toDateString();
  });

  const grouped = last7Days.map(dateStr => {
    const daySessions = sessions.filter(s => new Date(s.start).toDateString() === dateStr);
    const totalDuduk = daySessions.reduce((a, s) => a + Math.floor(s.duration / 60), 0);
    const totalJeda = daySessions.reduce((a, s) => a + s.breaksTaken, 0);
    return {
      name: new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'short' }),
      'Duduk (mnt)': totalDuduk,
      'Jumlah Jeda': totalJeda
    };
  });
  return grouped;
}

export default function History() {
  const { sessions, clearSessions } = useApp();

  const chartData = processChartData(sessions);

  const today = new Date().toDateString();
  const todaySessions = sessions.filter(
    (s) => new Date(s.start).toDateString() === today
  );
  const pastSessions = sessions.filter(
    (s) => new Date(s.start).toDateString() !== today
  );

  return (
    <main className="max-w-[1100px] mx-auto px-6 pt-8 pb-12 flex flex-col gap-8">
      <div className="flex items-center justify-between flex-wrap gap-4 animate-fade-in">
        <div>
          <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-extrabold text-text">Riwayat & Analitik</h1>
          <p className="text-[0.9rem] text-text-secondary mt-1">{sessions.length} sesi tersimpan</p>
        </div>
        <button
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-[0.95rem] font-semibold transition-all bg-red-300 text-red-700 border-2 border-red-400 hover:bg-red-700 hover:text-white cursor-pointer disabled:cursor-not-allowed"
          onClick={clearSessions}
          disabled={sessions.length === 0}
        >
          <Trash2 size={18} /> Hapus Semua
        </button>
      </div>

      {/* Recharts Analytics (Selalu Tampil) */}
      <div className="bg-white rounded-lg p-8 shadow-md border border-border flex flex-col gap-4 animate-fade-in">
        <h3 className="text-[1.1rem] text-primary font-heading font-bold">Tren 7 Hari Terakhir</h3>
        <div className="h-[250px] w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                cursor={{ fill: '#F1F5F9' }}
              />
              <Bar yAxisId="left" dataKey="Duduk (mnt)" fill="#0F766E" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="Jumlah Jeda" fill="#F97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md border border-border text-center p-12 flex flex-col items-center gap-4 text-text-secondary animate-fade-in">
          <span className="text-[3rem]">📭</span>
          <h2 className="text-text font-heading font-bold text-2xl">Belum ada riwayat sesi</h2>
          <p>Mulai session duduk pertamamu di Dashboard agar data grafik mulai terisi!</p>
        </div>
      ) : (
        <>
          {todaySessions.length > 0 && (
            <section className="flex flex-col gap-4 animate-fade-in">
              <h2 className="text-base font-bold text-primary uppercase tracking-wider font-heading">Hari Ini</h2>
              <SessionTable sessions={todaySessions} />
            </section>
          )}

          {pastSessions.length > 0 && (
            <section className="flex flex-col gap-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <h2 className="text-base font-bold text-primary uppercase tracking-wider font-heading">Sebelumnya</h2>
              <SessionTable sessions={pastSessions} />
            </section>
          )}

          {/* Summary */}
          <div className="bg-white rounded-lg p-8 shadow-md border border-border flex flex-col gap-4 animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <h3 className="text-[1.1rem] text-primary font-heading font-bold">Statistik Keseluruhan</h3>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-4">
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
                value={`${Math.round(sessions.reduce((a, s) => a + s.duration / 60, 0) / sessions.length || 0)} mnt`}
              />
            </div>
          </div>
        </>
      )}
    </main>
  );
}

function SessionTable({ sessions }) {
  return (
    <div className="bg-white rounded-lg shadow-md border border-border p-0 overflow-hidden">
      <div className="overflow-x-auto w-full">
        <table className="w-full border-collapse text-[0.78rem] sm:text-[0.88rem]">
          <thead className="bg-bg-2">
            <tr>
              <th className="px-4 py-3 sm:px-[0.6rem] sm:py-[0.6rem] text-left font-heading text-[0.75rem] tracking-wider uppercase text-primary whitespace-nowrap">#</th>
              <th className="px-4 py-3 sm:px-[0.6rem] sm:py-[0.6rem] text-left font-heading text-[0.75rem] tracking-wider uppercase text-primary whitespace-nowrap hidden sm:table-cell">Mulai</th>
              <th className="px-4 py-3 sm:px-[0.6rem] sm:py-[0.6rem] text-left font-heading text-[0.75rem] tracking-wider uppercase text-primary whitespace-nowrap">Durasi Duduk</th>
              <th className="px-4 py-3 sm:px-[0.6rem] sm:py-[0.6rem] text-left font-heading text-[0.75rem] tracking-wider uppercase text-primary whitespace-nowrap">Jeda</th>
              <th className="px-4 py-3 sm:px-[0.6rem] sm:py-[0.6rem] text-left font-heading text-[0.75rem] tracking-wider uppercase text-primary whitespace-nowrap">Total Istirahat</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s, i) => (
              <tr key={s.id} className={`group hover:bg-bg ${Math.floor(s.duration / 60) > 90 ? 'bg-orange-50 hover:bg-orange-100' : ''}`}>
                <td className="px-4 py-3 sm:px-[0.6rem] sm:py-[0.6rem] border-b border-border align-middle text-text-secondary w-10">{i + 1}</td>
                <td className="px-4 py-3 sm:px-[0.6rem] sm:py-[0.6rem] border-b border-border align-middle hidden sm:table-cell">{formatDate(s.start)}</td>
                <td className="px-4 py-3 sm:px-[0.6rem] sm:py-[0.6rem] border-b border-border align-middle">
                  <strong className="font-heading text-primary">{formatTime(s.duration)}</strong>
                  {Math.floor(s.duration / 60) > 90 && (
                    <span className="text-danger text-[0.8rem]"> ⚠️</span>
                  )}
                </td>
                <td className="px-4 py-3 sm:px-[0.6rem] sm:py-[0.6rem] border-b border-border align-middle">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${s.breaksTaken > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {s.breaksTaken}×
                  </span>
                </td>
                <td className="px-4 py-3 sm:px-[0.6rem] sm:py-[0.6rem] border-b border-border align-middle">{formatTime(s.totalBreakTime || 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="flex flex-col items-center gap-1 p-4 bg-bg rounded-md border border-border">
      <span className="font-heading text-[1.6rem] font-bold text-primary">{value}</span>
      <span className="text-[0.72rem] uppercase tracking-wide text-text-secondary text-center">{label}</span>
    </div>
  );
}
