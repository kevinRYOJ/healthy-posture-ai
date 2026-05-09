import { Link } from 'react-router-dom';
import './Home.css';

const FEATURES = [
  {
    title: 'Timer Cerdas',
    desc: 'Lacak durasi duduk secara real-time dengan pengingat otomatis setiap 45 menit.'
  },
  {
    title: 'Prediksi AI',
    desc: 'Model machine learning menganalisis pola duduk dan memprediksi tingkat risiko postur.'
  },
  {
    title: 'Dashboard Insight',
    desc: 'Visualisasi aktivitas harian dan tren kesehatan postur secara interaktif.'
  },
  {
    title: 'Gamifikasi',
    desc: 'Kumpulkan Health Score dan tingkatkan progres kesehatanmu setiap hari.'
  },
];

const FAQS = [
  {
    q: 'Seberapa sering harus istirahat?',
    a: 'Disarankan setiap 45–60 menit duduk, ambil jeda 5–10 menit untuk peregangan ringan.'
  },
  {
    q: 'Apa itu Health Score?',
    a: 'Skor 0–100 yang dihitung berdasarkan kepatuhan jeda, durasi duduk, dan pola aktivitasmu.'
  },
  {
    q: 'Bagaimana AI memprediksi risiko?',
    a: 'Model mengklasifikasikan risiko berdasarkan total durasi duduk dan pola aktivitas harian.'
  },
];

export default function Home() {
  return (
    <main className="home">

      {/* Hero */}
      <section className="hero container">
        <div className="hero__text fade-in">
          <span className="hero__pill">
            Coding Camp 2026 · CC26-PSU130
          </span>

          <h1 className="hero__heading">
            Jaga Postur,
            <br />
            <span className="hero__highlight">
              Jaga Kesehatan
            </span>
          </h1>

          <p className="hero__desc">
            Aplikasi pengingat postur berbasis AI yang memantau kebiasaan
            duduk, memprediksi risiko kesehatan, dan membantu pengguna
            hidup lebih aktif setiap hari.
          </p>

          <div className="hero__actions">
            <Link to="/dashboard" className="btn btn-primary">
              Mulai Sekarang
            </Link>

            <Link to="/history" className="btn btn-secondary">
              Lihat Riwayat
            </Link>
          </div>
        </div>

        <div
          className="hero__visual fade-in"
          style={{ animationDelay: '0.15s' }}
        >
          <div className="hero__card">
            <div className="hero__card-label">
              Health Score Hari Ini
            </div>

            <div className="hero__score">87</div>

            <div className="hero__level">
              Champion
            </div>

            <div className="hero__mini-stats">
              <div>
                <strong>120</strong>
                <span>menit duduk</span>
              </div>

              <div>
                <strong>3</strong>
                <span>jeda diambil</span>
              </div>

              <div>
                <strong>Low</strong>
                <span>risiko</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features container">
        <h2 className="section-title">
          Apa yang bisa dilakukan?
        </h2>

        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="feature-card card fade-in"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="feature-line"></div>

              <h3 className="feature-title">
                {f.title}
              </h3>

              <p className="feature-desc">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="how container">
        <h2 className="section-title">
          Cara Kerja
        </h2>

        <div className="how-steps">
          {[
            {
              step: '01',
              text: 'Klik "Mulai Duduk" saat mulai bekerja'
            },
            {
              step: '02',
              text: 'Ambil jeda ketika notifikasi muncul'
            },
            {
              step: '03',
              text: 'Klik "Selesai" untuk menyimpan sesi'
            },
            {
              step: '04',
              text: 'Cek dashboard dan prediksi risiko AI'
            },
          ].map((s) => (
            <div key={s.step} className="how-step">
              <div className="how-step__num">
                {s.step}
              </div>

              <p className="how-step__text">
                {s.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="faq container">
        <h2 className="section-title">
          FAQ
        </h2>

        <div className="faq-list">
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="faq-item card"
            >
              <summary className="faq-q">
                {f.q}
              </summary>

              <p className="faq-a">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section container">
        <div className="cta-box card">
          <h2>
            Siap menjaga postur hari ini?
          </h2>

          <p>
            Mulai tracking sekarang secara gratis tanpa akun.
          </p>

          <Link
            to="/dashboard"
            className="btn btn-primary"
          >
            Mulai Gratis
          </Link>
        </div>
      </section>

    </main>
  );
}