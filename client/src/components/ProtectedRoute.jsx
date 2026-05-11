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
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem',
        color: 'var(--clr-text-secondary)',
        fontFamily: 'var(--font-heading)',
      }}>
        <div style={{
          width: 40, height: 40,
          border: '4px solid var(--clr-bg-2)',
          borderTopColor: 'var(--clr-primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <span>Memuat sesi...</span>
      </div>
    );
  }

  if (!user) {
    // simpan URL tujuan agar bisa redirect balik setelah login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
