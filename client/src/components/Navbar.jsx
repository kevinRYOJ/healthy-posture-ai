import { NavLink } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <NavLink to="/" className="navbar__brand">
          <span className="navbar__name">HealthPosture</span>
        </NavLink>

        <nav className="navbar__links">
          <NavLink
            to="/"
            className={({ isActive }) =>
              'navbar__link' + (isActive ? ' navbar__link--active' : '')
            }
            end
          >
            Beranda
          </NavLink>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              'navbar__link' + (isActive ? ' navbar__link--active' : '')
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/history"
            className={({ isActive }) =>
              'navbar__link' + (isActive ? ' navbar__link--active' : '')
            }
          >
            Riwayat
          </NavLink>
        </nav>

        <NavLink to="/dashboard" className="btn btn-primary navbar__cta">
          Mulai Sekarang
        </NavLink>
      </div>
    </header>
  );
}
