import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-70px)] flex items-center justify-center p-8 px-6 bg-[radial-gradient(ellipse_at_60%_0%,#CCFBF1_0%,var(--color-bg)_60%)]">
      <div className="bg-white rounded-lg shadow-md border border-border w-full max-w-[440px] flex flex-col gap-4 p-12 animate-fade-in">
        {/* Branding */}
        <div className="flex flex-col items-center gap-2 font-heading text-[1.1rem] font-bold text-primary mb-2">
          <p className="">HealthPosture</p>
          <h1 className="text-xl lg:text-2xl font-extrabold text-text -mt-2 font-heading">Selamat datang kembali</h1>
          <p className="text-sm lg:text-md text-center text-text-secondary -mt-2">Masuk untuk melanjutkan tracking posturmu</p>
        </div>

        {error && <div className="bg-red-100 border border-red-200 rounded-md text-danger text-[0.875rem] px-4 py-[0.65rem] animate-fade-in">{error}</div>}

        <form className="flex flex-col gap-4 mt-2" onSubmit={handleSubmit}>
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
              autoFocus
              className="px-4 py-[0.72rem] border-[1.5px] border-border rounded-md text-[0.95rem] font-body text-text bg-bg outline-none focus:border-primary-light focus:ring-[3px] focus:ring-primary-light/15 transition-all"
            />
          </div>

          <div className="flex flex-col gap-[0.35rem]">
            <label
              htmlFor="password"
              className="text-[0.83rem] font-semibold text-text flex items-center justify-between"
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              className="px-4 py-[0.72rem] border-[1.5px] border-border rounded-md text-[0.95rem] font-body text-text bg-bg outline-none focus:border-primary-light focus:ring-[3px] focus:ring-primary-light/15 transition-all"
            />
          </div>

          <div className="flex justify-end -mt-2">
            <Link
              to="/forgot-password"
            >
              <p className="text-[0.83rem] font-medium text-primary hover:text-primary-dark hover:underline transition-colors">Lupa Password?</p>
            </Link>
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-6 py-[0.85rem] rounded-full text-base font-semibold transition-all bg-primary text-white shadow-[0_4px_14px_rgba(15,118,110,0.4)] hover:bg-primary-dark hover:-translate-y-px disabled:opacity-55 disabled:cursor-not-allowed disabled:!translate-y-0 mt-2 border-none"
            disabled={loading}
          >
            {loading ? <span className="w-[18px] h-[18px] border-[2.5px] border-white/40 border-t-white rounded-full animate-spin inline-block" /> : null}
            {loading ? 'Masuk...' : 'Masuk'}
          </button>
        </form>

        <p className="text-center text-[0.875rem] text-text-secondary pt-2 border-t border-border">
          Belum punya akun?{' '}
          <Link to="/register">
            <span className='text-primary font-semibold underline underline-offset-2 hover:text-primary-dark'>Daftar sekarang</span>
          </Link>
        </p>
      </div>
    </main>
  );
}
