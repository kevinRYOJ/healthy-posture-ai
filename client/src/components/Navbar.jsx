import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-[100] bg-[rgba(240,253,250,0.88)] backdrop-blur-[12px] border-b border-border py-3.5">
      <div className="max-w-[1100px] mx-auto px-6 flex items-center justify-between gap-6">
        {/* Brand */}
        <NavLink to="/" className="flex items-center gap-2 font-heading text-[1.2rem] font-bold text-primary tracking-tight">
          <span className="hidden sm:inline">Health Posture</span>
        </NavLink>

        {/* Nav links — hanya tampil kalau sudah login */}
        {user && (
          <nav className="flex items-center gap-2">
            <NavLink to="/" className={({ isActive }) => 'px-4 py-[0.45rem] rounded-full text-[0.9rem] font-medium transition-all hover:text-primary hover:bg-bg-2 ' + (isActive ? 'text-primary bg-bg-2 font-semibold' : 'text-text-secondary')} end>Beranda</NavLink>
            <NavLink to="/dashboard" className={({ isActive }) => 'px-4 py-[0.45rem] rounded-full text-[0.9rem] font-medium transition-all hover:text-primary hover:bg-bg-2 ' + (isActive ? 'text-primary bg-bg-2 font-semibold' : 'text-text-secondary')}>Dashboard</NavLink>
            <NavLink to="/history" className={({ isActive }) => 'px-4 py-[0.45rem] rounded-full text-[0.9rem] font-medium transition-all hover:text-primary hover:bg-bg-2 ' + (isActive ? 'text-primary bg-bg-2 font-semibold' : 'text-text-secondary')}>Riwayat</NavLink>
          </nav>
        )}

        {/* Right side */}
        <div className="">
          {user ? (
            /* User info + logout */
            <div className="flex items-center gap-2">
              <NavLink to="/profile" className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-light text-white font-heading text-[0.9rem] font-bold flex items-center justify-center shrink-0 hover:opacity-85 transition-opacity" title="Lihat profil">
                {user.name?.[0]?.toUpperCase()}
              </NavLink>
              <div className="hidden sm:flex flex-col leading-tight">
                <NavLink to="/profile" className="text-[0.85rem] font-semibold text-text hover:text-primary">{user.name}</NavLink>
                <span className="text-[0.72rem] text-text-secondary">{user.email}</span>
              </div>
              <button className="bg-transparent text-base p-1.5 rounded-sm hover:bg-red-100 transition-colors ml-1 leading-none cursor-pointer border-none" onClick={handleLogout} title="Logout">
                🚪
              </button>
            </div>
          ) : (
            /* Belum login */
            <div className="flex items-center gap-2">
              <NavLink to="/login" className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full text-[0.85rem] font-semibold transition-all bg-bg-2 text-primary border-2 border-primary-light hover:bg-primary-light hover:text-white">Masuk</NavLink>
              <NavLink to="/register" className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[0.85rem] font-semibold transition-all bg-primary text-white shadow-[0_4px_14px_rgba(15,118,110,0.4)] hover:bg-primary-dark hover:-translate-y-px">Daftar</NavLink>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
