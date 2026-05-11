import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        {/* Brand */}
        <NavLink to="/" className="navbar__brand">
          <span className="navbar__name">Health Posture</span>
        </NavLink>

        {/* Nav links — hanya tampil kalau sudah login */}
        {user && (
          <nav className="navbar__links">
            <NavLink to="/" className={({ isActive }) => 'navbar__link' + (isActive ? ' navbar__link--active' : '')} end>Beranda</NavLink>
            <NavLink to="/dashboard" className={({ isActive }) => 'navbar__link' + (isActive ? ' navbar__link--active' : '')}>Dashboard</NavLink>
            <NavLink to="/history" className={({ isActive }) => 'navbar__link' + (isActive ? ' navbar__link--active' : '')}>Riwayat</NavLink>
          </nav>
        )}

        {/* Right side */}
        <div className="navbar__right">
          {user ? (
            /* User info + logout */
            <div className="navbar__user">
              <NavLink to="/profile" className="navbar__avatar" title="Lihat profil">
                {user.name?.[0]?.toUpperCase()}
              </NavLink>
              <div className="navbar__user-info">
                <NavLink to="/profile" className="navbar__user-name">{user.name}</NavLink>
                <span className="navbar__user-email">{user.email}</span>
              </div>
              <button className="navbar__logout" onClick={handleLogout} title="Logout">
                🚪
              </button>
            </div>
          ) : (
            /* Belum login */
            <div className="navbar__auth">
              <NavLink to="/login" className="btn btn-secondary navbar__auth-btn">Masuk</NavLink>
              <NavLink to="/register" className="btn btn-primary  navbar__auth-btn">Daftar</NavLink>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
