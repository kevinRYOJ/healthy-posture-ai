import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { Menu, X, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-[100] bg-[rgba(240,253,250,0.88)] backdrop-blur-[12px] border-b border-border py-3.5">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">

        {/* Brand */}
        <NavLink
          to="/"
          className="flex items-center gap-2 font-heading text-[1.1rem] sm:text-[1.2rem] font-bold text-primary tracking-tight"
        >
          <span>Health Posture</span>
        </NavLink>

        {/* Desktop Navigation */}
        {user && (
          <nav className="hidden md:flex items-center gap-2">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                'px-4 py-[0.45rem] rounded-full text-[0.9rem] font-medium transition-all hover:text-primary hover:bg-bg-2 ' +
                (isActive
                  ? 'text-primary bg-bg-2 font-semibold'
                  : 'text-text-secondary')
              }
            >
              Beranda
            </NavLink>

            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                'px-4 py-[0.45rem] rounded-full text-[0.9rem] font-medium transition-all hover:text-primary hover:bg-bg-2 ' +
                (isActive
                  ? 'text-primary bg-bg-2 font-semibold'
                  : 'text-text-secondary')
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/history"
              className={({ isActive }) =>
                'px-4 py-[0.45rem] rounded-full text-[0.9rem] font-medium transition-all hover:text-primary hover:bg-bg-2 ' +
                (isActive
                  ? 'text-primary bg-bg-2 font-semibold'
                  : 'text-text-secondary')
              }
            >
              Riwayat
            </NavLink>
          </nav>
        )}

        {/* Right Side */}
        <div className="flex items-center gap-2">

          {user ? (
            <>
              {/* Desktop Profile */}
              <div className="hidden md:flex items-center gap-2">
                <NavLink
                  to="/profile"
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-light text-white font-heading text-[0.9rem] font-bold flex items-center justify-center shrink-0 hover:opacity-85 transition-opacity"
                  title="Lihat profil"
                >
                  {user.name?.[0]?.toUpperCase()}
                </NavLink>

                <div className="hidden lg:flex flex-col leading-tight max-w-[180px]">
                  <NavLink
                    to="/profile"
                    className="text-[0.85rem] font-semibold text-text hover:text-primary truncate"
                  >
                    {user.name}
                  </NavLink>

                  <span className="text-[0.72rem] text-text-secondary truncate">
                    {user.email}
                  </span>
                </div>

                <button
                  className="bg-transparent p-2 rounded-md hover:bg-red-100 transition-colors cursor-pointer border-none"
                  onClick={handleLogout}
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 rounded-md hover:bg-bg-2 transition"
              >
                {isOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </>
          ) : (
            <>
              {/* Desktop Auth Buttons */}
              <div className="hidden md:flex items-center gap-2">
                <NavLink
                  to="/login"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[0.85rem] font-semibold transition-all bg-bg-2 text-primary border-2 border-primary-light hover:bg-primary-light hover:text-white"
                >
                  Masuk
                </NavLink>

                <NavLink
                  to="/register"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[0.85rem] font-semibold transition-all bg-primary text-white shadow-[0_4px_14px_rgba(15,118,110,0.4)] hover:bg-primary-dark hover:-translate-y-px"
                >
                  Daftar
                </NavLink>
              </div>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 rounded-md hover:bg-bg-2 transition"
              >
                {isOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </>
          )}

        </div>
      </div>

      {/* Mobile Menu - Login */}
      {user && isOpen && (
        <div className="md:hidden border-t border-border bg-white/95 backdrop-blur">
          <nav className="flex flex-col p-4 gap-2">

            <NavLink
              to="/"
              end
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                'px-4 py-3 rounded-xl transition-all ' +
                (isActive
                  ? 'bg-bg-2 text-primary font-semibold'
                  : 'text-text-secondary')
              }
            >
              Beranda
            </NavLink>

            <NavLink
              to="/dashboard"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                'px-4 py-3 rounded-xl transition-all ' +
                (isActive
                  ? 'bg-bg-2 text-primary font-semibold'
                  : 'text-text-secondary')
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/history"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                'px-4 py-3 rounded-xl transition-all ' +
                (isActive
                  ? 'bg-bg-2 text-primary font-semibold'
                  : 'text-text-secondary')
              }
            >
              Riwayat
            </NavLink>

            <NavLink
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="px-4 py-3 rounded-xl text-text-secondary hover:bg-bg-2"
            >
              Profil
            </NavLink>

            <button
              onClick={handleLogout}
              className="text-left px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition"
            >
              Logout
            </button>

          </nav>
        </div>
      )}

      {/* Mobile Menu - Guest */}
      {!user && isOpen && (
        <div className="md:hidden border-t border-border bg-white/95 backdrop-blur">
          <nav className="flex flex-col p-4 gap-2">

            <NavLink
              to="/login"
              onClick={() => setIsOpen(false)}
              className="px-4 py-3 rounded-xl text-text-secondary hover:bg-bg-2"
            >
              Masuk
            </NavLink>

            <NavLink
              to="/register"
              onClick={() => setIsOpen(false)}
              className="px-4 py-3 rounded-xl bg-primary text-white font-medium"
            >
              Daftar
            </NavLink>

          </nav>
        </div>
      )}
    </header>
  );
}