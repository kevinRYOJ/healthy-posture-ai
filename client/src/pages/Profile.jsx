import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { updateProfile } from '../api';
import './Profile.css';

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const { sessions, healthScore, totalSittingToday, clearSessions } = useApp();
  const navigate = useNavigate();

  const [editName, setEditName]   = useState(false);
  const [name,     setName]       = useState(user?.name || '');
  const [saving,   setSaving]     = useState(false);
  const [success,  setSuccess]    = useState('');
  const [error,    setError]      = useState('');

  // Stats
  const totalSessions   = sessions.length;
  const totalSittingAll = sessions.reduce((a, s) => a + Math.floor(s.duration / 60), 0);
  const totalBreaks     = sessions.reduce((a, s) => a + s.breaksTaken, 0);
  const joinDate        = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  const handleSaveName = async () => {
    if (!name.trim()) { setError('Nama tidak boleh kosong'); return; }
    setSaving(true); setError(''); setSuccess('');
    try {
      const data = await updateProfile(name.trim());
      updateUser(data.user);
      setSuccess('Nama berhasil diperbarui!');
      setEditName(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleClear = () => {
    if (window.confirm('Hapus semua riwayat sesi? Tindakan ini tidak bisa dibatalkan.')) {
      clearSessions();
    }
  };

  return (
    <main className="profile container fade-in">
      <h1 className="profile__title">Profil Saya</h1>

      {/* Avatar + info */}
      <div className="profile__hero card">
        <div className="profile__avatar">
          {user?.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div className="profile__info">
          {editName ? (
            <div className="profile__edit-row">
              <input
                className="profile__name-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              />
              <button className="btn btn-primary" onClick={handleSaveName} disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button className="btn btn-secondary" onClick={() => { setEditName(false); setName(user.name); }}>
                Batal
              </button>
            </div>
          ) : (
            <div className="profile__name-row">
              <h2 className="profile__name">{user?.name}</h2>
              <button className="profile__edit-btn" onClick={() => setEditName(true)} title="Edit nama">
                ✏️
              </button>
            </div>
          )}
          <p className="profile__email">{user?.email}</p>
          <p className="profile__join">Bergabung sejak {joinDate}</p>
          {success && <p className="profile__success">{success}</p>}
          {error   && <p className="profile__error">{error}</p>}
        </div>
      </div>

      {/* Stats grid */}
      <div className="profile__section">
        <h3 className="profile__section-title">Statistik Akumulasi</h3>
        <div className="profile__stats-grid">
          <StatBox icon="🪑" label="Total Sesi"    value={totalSessions} />
          <StatBox icon="⏱️" label="Total Duduk"   value={`${totalSittingAll} mnt`} />
          <StatBox icon="☕" label="Total Jeda"    value={totalBreaks} />
          <StatBox icon="💯" label="Health Score"  value={`${healthScore}/100`} />
        </div>
      </div>

      {/* Danger zone */}
      <div className="profile__section profile__danger card">
        <h3 className="profile__section-title profile__danger-title">⚠️ Zona Berbahaya</h3>
        <div className="profile__danger-actions">
          <div className="profile__danger-item">
            <div>
              <strong>Hapus Riwayat Sesi</strong>
              <p>Semua data sesi akan dihapus permanen dari perangkat ini.</p>
            </div>
            <button className="btn btn-danger" onClick={handleClear}>
              🗑️ Hapus Data
            </button>
          </div>
          <div className="profile__danger-item">
            <div>
              <strong>Keluar dari Akun</strong>
              <p>Sesi login akan dihapus. Kamu perlu masuk kembali.</p>
            </div>
            <button className="btn btn-danger" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function StatBox({ icon, label, value }) {
  return (
    <div className="profile__stat-box">
      <span className="profile__stat-icon">{icon}</span>
      <span className="profile__stat-value">{value}</span>
      <span className="profile__stat-label">{label}</span>
    </div>
  );
}
