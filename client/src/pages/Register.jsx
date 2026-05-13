import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

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
    <main className="auth-page">
      <div className="auth-card card fade-in">
        <div className="auth-brand">
          <span className="auth-brand__icon">🧍</span>
          <span className="auth-brand__name">HealthPosture</span>
        </div>

        <h1 className="auth-title">Buat akun baru</h1>
        <p className="auth-sub">Mulai perjalanan postur sehatmu hari ini</p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="name">Nama Lengkap</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="nama@email.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">
              Password
              {strength && (
                <span className={`pw-strength pw-strength--${strength}`}>
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
            />
            {strength && (
              <div className="pw-bar">
                <div className={`pw-bar__fill pw-bar__fill--${strength}`} />
              </div>
            )}
          </div>

          <div className="auth-field">
            <label htmlFor="confirmPassword">Konfirmasi Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Ulangi password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />

          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? <span className="auth-spinner" /> : null}
            {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
          </button>
        </form>

        <p className="auth-switch">
          Sudah punya akun?{' '}
          <Link to="/login" className="auth-link">Masuk</Link>
        </p>
      </div>
    </main>
  );
}
