import { Link } from 'react-router-dom';

const FEATURES = [
  { icon: '⏱️', title: 'Timer Cerdas', desc: 'Lacak durasi duduk secara real-time dengan pengingat otomatis setiap 45 menit.' },
  { icon: '🤖', title: 'Prediksi AI', desc: 'Model ML menganalisis pola dudukmu dan memprediksi tingkat risiko postur.' },
  { icon: '📊', title: 'Dashboard Insight', desc: 'Visualisasi data aktivitas harian dan tren kesehatan posturmu.' },
  { icon: '🏆', title: 'Gamifikasi', desc: 'Kumpulkan Health Score dan naiki level dari Pemula ke Champion.' },
];

const FAQS = [
  { q: 'Seberapa sering harus istirahat?', a: 'Disarankan setiap 45–60 menit duduk, ambil jeda 5–10 menit untuk peregangan ringan.' },
  { q: 'Apa itu Health Score?', a: 'Skor 0–100 yang dihitung berdasarkan kepatuhan jeda, durasi duduk, dan pola aktivitasmu.' },
  { q: 'Bagaimana AI memprediksi risiko?', a: 'Model mengklasifikasikan risiko (Low/Medium/High) berdasarkan total menit dudukmu hari ini.' },
];

export default function Home() {
  return (
    <main className="pb-12">
      {/* Hero */}
      <section className="max-w-[1100px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 text-center md:text-left gap-12 items-center pt-12 pb-12">
        <div className="animate-fade-in order-last md:order-none">
          {/* <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary-light/10 text-primary mb-4">🧍 Coding Camp 2026 · CC26-PSU130</span> */}
          <h1 className="text-[clamp(2rem,4vw,3.2rem)] font-extrabold leading-[1.1] text-text mb-4 font-heading">
            Jaga Postur,<br />
            <span className="text-primary relative inline-block border-b-4 border-primary">Jaga Kesehatan</span>
          </h1>
          <p className="text-text-secondary max-w-[440px] mb-8 text-[1.05rem] md:mx-auto">
            Aplikasi pengingat postur berbasis AI yang memantau kebiasaan
            dudukmu, memprediksi risiko, dan mendorongmu untuk hidup lebih aktif.
          </p>
          <div className="flex gap-2 flex-wrap justify-center md:justify-start">
            <Link to="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-[0.95rem] font-semibold transition-all bg-primary text-white shadow-[0_4px_14px_rgba(15,118,110,0.4)] hover:bg-primary-dark hover:-translate-y-px border-none">
              🚀 Mulai Sekarang
            </Link>
            <Link to="/history" className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-[0.95rem] font-semibold transition-all bg-bg-2 text-primary border-2 border-primary-light hover:bg-primary-light hover:text-white cursor-pointer">
              📋 Lihat Riwayat
            </Link>
          </div>
        </div>

        <div className="flex justify-center animate-fade-in order-first md:order-none" style={{ animationDelay: '0.15s' }}>
          <div className="bg-primary text-white rounded-xl p-8 w-[260px] shadow-[0_20px_50px_rgba(15,118,110,0.35)] flex flex-col items-center gap-2 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-[140px] h-[140px] bg-white/[0.07] rounded-full pointer-events-none" />
            
            <div className="text-[0.75rem] tracking-wider uppercase opacity-75 z-10 relative">Health Score Hari Ini</div>
            <div className="font-heading text-[4rem] font-extrabold leading-none z-10 relative">87</div>
            <div className="text-base font-semibold bg-white/15 px-3 py-[0.3rem] rounded-full z-10 relative">🏆 Champion</div>
            <div className="flex gap-4 mt-2 pt-2 border-t border-white/20 w-full justify-around z-10 relative">
              <div className="flex flex-col items-center gap-0.5"><strong className="font-heading text-[1.1rem] font-bold">120</strong><span className="text-[0.65rem] opacity-70 uppercase tracking-wider">menit duduk</span></div>
              <div className="flex flex-col items-center gap-0.5"><strong className="font-heading text-[1.1rem] font-bold">3</strong><span className="text-[0.65rem] opacity-70 uppercase tracking-wider">jeda diambil</span></div>
              <div className="flex flex-col items-center gap-0.5"><strong className="font-heading text-[1.1rem] font-bold">Low</strong><span className="text-[0.65rem] opacity-70 uppercase tracking-wider">risiko</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-[1100px] mx-auto px-6 py-12">
        <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-text mb-8 text-center font-heading">Apa yang bisa dilakukan?</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="bg-white rounded-lg p-8 shadow-md border border-border flex flex-col gap-2 transition-transform hover:-translate-y-1 hover:shadow-lg animate-fade-in"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <span className="text-[2rem]">{f.icon}</span>
              <h3 className="text-[1.05rem] font-bold text-primary font-heading">{f.title}</h3>
              <p className="text-[0.88rem] text-text-secondary">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-[1100px] mx-auto px-6 py-12">
        <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-text mb-8 text-center font-heading">Cara Kerja</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 relative">
          <div className="absolute top-7 left-[12.5%] w-3/4 h-0.5 bg-gradient-to-r from-primary-light to-bg-2 hidden md:block" />
          {[
            { step: '01', icon: '▶', text: 'Klik "Mulai Duduk" saat mulai bekerja' },
            { step: '02', icon: '☕', text: 'Ambil jeda ketika notifikasi muncul' },
            { step: '03', icon: '⏹', text: 'Klik "Selesai" untuk menyimpan sesi' },
            { step: '04', icon: '📊', text: 'Cek dashboard & prediksi risiko AI' },
          ].map((s) => (
            <div key={s.step} className="flex flex-col items-center text-center gap-2 relative">
              <div className="font-heading text-[0.7rem] font-bold tracking-wider text-primary bg-bg-2 px-[0.6rem] py-1 rounded-full">{s.step}</div>
              <div className="w-[52px] h-[52px] bg-primary text-white rounded-full flex items-center justify-center text-[1.3rem] shadow-[0_4px_14px_rgba(15,118,110,0.35)]">{s.icon}</div>
              <p className="text-[0.84rem] text-text-secondary max-w-[140px]">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-[1100px] mx-auto px-6 py-12">
        <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-text mb-8 text-center font-heading">FAQ</h2>
        <div className="flex flex-col gap-4 max-w-[680px] mx-auto">
          {FAQS.map((f) => (
            <details key={f.q} className="bg-white rounded-lg shadow-md border border-border px-6 py-4 cursor-pointer group">
              <summary className="font-semibold text-[0.95rem] text-primary cursor-pointer list-none flex justify-between items-center">
                {f.q}
                <span className="text-primary group-open:hidden">+</span>
                <span className="text-primary hidden group-open:inline">−</span>
              </summary>
              <p className="mt-2 text-[0.88rem] text-text-secondary">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1100px] mx-auto px-6 py-12">
        <div className="text-center p-12 bg-gradient-to-br from-primary to-primary-dark text-white rounded-lg shadow-md border border-border flex flex-col items-center gap-4">
          <h2 className="text-[1.7rem] text-white font-heading font-bold">Siap jaga posturmu hari ini?</h2>
          <p className="text-white/80">Mulai tracking sekarang — gratis, tanpa akun.</p>
          <Link to="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-[0.95rem] font-semibold transition-all bg-white text-primary shadow-[0_4px_14px_rgba(0,0,0,0.2)] hover:-translate-y-px border-none cursor-pointer">
            Mulai Gratis →
          </Link>
        </div>
      </section>
    </main>
  );
}
