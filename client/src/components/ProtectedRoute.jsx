import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Bungkus halaman yang butuh login.
 * Kalau belum login → redirect ke /login (dan simpan tujuan asal).
 * Kalau masih loading session → tampilkan spinner.
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-text-secondary font-heading">
        <div className="w-10 h-10 border-4 border-bg-2 border-t-primary rounded-full animate-spin" />
        <span>Memuat sesi...</span>
      </div>
    );
  }

  if (!user) {
    // simpan URL tujuan agar bisa redirect balik setelah login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user.has_personalized && location.pathname !== '/setup') {
    return <Navigate to="/setup" replace />;
  }

  return children;
}
