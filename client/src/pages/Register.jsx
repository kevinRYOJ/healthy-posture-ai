import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Password dan konfirmasi tidak cocok');
      return;
    }

    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.confirmPassword);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Indikator kekuatan password
  const strength =
    form.password.length === 0 ? null :
      form.password.length < 6 ? 'weak' :
        form.password.length < 10 ? 'medium' : 'strong';

  return (
    <main className="min-h-[calc(100vh-70px)] flex items-center justify-center p-8 px-6 bg-[radial-gradient(ellipse_at_60%_0%,#CCFBF1_0%,var(--color-bg)_60%)]">
      <div className="bg-white rounded-lg shadow-md border border-border w-full max-w-[440px] flex flex-col gap-4 p-12 animate-fade-in">
        <div className="flex items-center gap-2 font-heading text-[1.1rem] font-bold text-primary mb-2">
          <span className="text-[1.4rem]">🧍</span>
          <span className="">HealthPosture</span>
        </div>

        <h1 className="text-[1.6rem] font-extrabold text-text -mt-2 font-heading">Buat akun baru</h1>
        <p className="text-[0.88rem] text-text-secondary -mt-2">Mulai perjalanan postur sehatmu hari ini</p>

        {error && <div className="bg-red-100 border border-red-200 rounded-md text-danger text-[0.875rem] px-4 py-[0.65rem] animate-fade-in">{error}</div>}

        <form className="flex flex-col gap-4 mt-2" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-[0.35rem]">
            <label htmlFor="name" className="text-[0.83rem] font-semibold text-text flex items-center justify-between">Nama Lengkap</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
              required
              autoFocus
              className="px-4 py-[0.72rem] border-[1.5px] border-border rounded-md text-[0.95rem] font-body text-text bg-bg outline-none focus:border-primary-light focus:ring-[3px] focus:ring-primary-light/15 transition-all"
            />
          </div>

          <div className="flex flex-col gap-[0.35rem]">
            <label htmlFor="email" className="text-[0.83rem] font-semibold text-text flex items-center justify-between">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="nama@email.com"
              value={form.email}
              onChange={handleChange}
              required
              className="px-4 py-[0.72rem] border-[1.5px] border-border rounded-md text-[0.95rem] font-body text-text bg-bg outline-none focus:border-primary-light focus:ring-[3px] focus:ring-primary-light/15 transition-all"
            />
          </div>

          <div className="flex flex-col gap-[0.35rem]">
            <label htmlFor="password" className="text-[0.83rem] font-semibold text-text flex items-center justify-between">
              Password
              {strength && (
                <span className={`text-[0.72rem] font-semibold px-2 py-[0.1rem] rounded-full ${strength === 'weak' ? 'bg-red-100 text-danger' : strength === 'medium' ? 'bg-yellow-100 text-[#A16207]' : 'bg-green-100 text-green-700'}`}>
                  {strength === 'weak' ? 'Lemah' : strength === 'medium' ? 'Sedang' : '✅ Kuat'}
                </span>
              )}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Min. 6 karakter"
              value={form.password}
              onChange={handleChange}
              required
              className="px-4 py-[0.72rem] border-[1.5px] border-border rounded-md text-[0.95rem] font-body text-text bg-bg outline-none focus:border-primary-light focus:ring-[3px] focus:ring-primary-light/15 transition-all"
            />
            {strength && (
              <div className="h-1 bg-bg-2 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-300 ${strength === 'weak' ? 'w-1/3 bg-danger' : strength === 'medium' ? 'w-2/3 bg-warning' : 'w-full bg-success'}`} />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-[0.35rem]">
            <label htmlFor="confirmPassword" className="text-[0.83rem] font-semibold text-text flex items-center justify-between">Konfirmasi Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Ulangi password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className="px-4 py-[0.72rem] border-[1.5px] border-border rounded-md text-[0.95rem] font-body text-text bg-bg outline-none focus:border-primary-light focus:ring-[3px] focus:ring-primary-light/15 transition-all"
            />

          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-6 py-[0.85rem] rounded-full text-base font-semibold transition-all bg-primary text-white shadow-[0_4px_14px_rgba(15,118,110,0.4)] hover:bg-primary-dark hover:-translate-y-px disabled:opacity-55 disabled:cursor-not-allowed disabled:!translate-y-0 mt-2 border-none"
            disabled={loading}
          >
            {loading ? <span className="w-[18px] h-[18px] border-[2.5px] border-white/40 border-t-white rounded-full animate-spin inline-block" /> : null}
            {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
          </button>
        </form>

        <p className="text-center text-[0.875rem] text-text-secondary pt-2 border-t border-border">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-primary font-semibold underline underline-offset-2 hover:text-primary-dark">Masuk</Link>
        </p>
      </div>
    </main>
  );
}
