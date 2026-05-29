import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { updateProfile } from '../api';
import { UserPen, Trash2, LogOut, Trophy, TriangleAlert, Flame, Snowflake } from 'lucide-react';

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const { sessions, healthScore, totalSittingToday, clearSessions } = useApp();
  const navigate = useNavigate();

  const [editName, setEditName] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Stats
  const totalSessions = sessions.length;
  const totalSittingAll = sessions.reduce((a, s) => a + Math.floor(s.duration / 60), 0);
  const totalBreaks = sessions.reduce((a, s) => a + s.breaksTaken, 0);
  const joinDate = user?.createdAt
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
    <main className="max-w-[700px] mx-auto px-6 pt-8 pb-12 flex flex-col gap-8 animate-fade-in">
      <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-extrabold text-text">Profil Saya</h1>

      {/* Avatar + info */}
      <div className="bg-white rounded-lg p-8 shadow-md border border-border flex items-center gap-8 flex-wrap">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-light text-white font-heading text-[2rem] font-extrabold flex items-center justify-center shrink-0 shadow-[0_4px_16px_rgba(15,118,110,0.3)]">
          {user?.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div className="flex flex-col gap-[0.3rem] flex-1">
          {editName ? (
            <div className="flex items-center gap-2 flex-wrap">
              <input
                className="px-[0.9rem] py-[0.55rem] border-[1.5px] border-primary-light rounded-md text-base font-heading font-bold text-text bg-bg outline-none ring-[3px] ring-primary-light/15"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              />
              <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-[0.95rem] font-semibold transition-all bg-primary text-white shadow-[0_4px_14px_rgba(15,118,110,0.4)] hover:bg-primary-dark hover:-translate-y-px disabled:opacity-55 disabled:cursor-not-allowed border-none" onClick={handleSaveName} disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-[0.95rem] font-semibold transition-all bg-bg-2 text-primary border-2 border-primary-light hover:bg-primary-light hover:text-white cursor-pointer" onClick={() => { setEditName(false); setName(user.name); }}>
                Batal
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-text">{user?.name}</h2>
              <button className="bg-transparent text-base cursor-pointer p-1 rounded-sm hover:bg-bg-2 transition-colors leading-none border-none" onClick={() => setEditName(true)} title="Edit nama">
                <UserPen />
              </button>
            </div>
          )}
          <p className="text-[0.9rem] text-text-secondary">{user?.email}</p>
          <p className="text-[0.8rem] text-text-secondary">Bergabung sejak {joinDate}</p>
          {success && <p className="text-[0.85rem] text-success font-semibold">{success}</p>}
          {error && <p className="text-[0.85rem] text-danger font-semibold">{error}</p>}
        </div>
      </div>

      {/* Stats grid */}
      <div className="flex flex-col gap-4">
        <h3 className="text-base font-bold text-primary uppercase tracking-wider">Statistik Akumulasi</h3>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-4">
          <StatBox icon="🪑" label="Total Sesi" value={totalSessions} />
          <StatBox icon="⏱️" label="Total Duduk" value={`${totalSittingAll} mnt`} />
          <StatBox icon="☕" label="Total Jeda" value={totalBreaks} />
          <StatBox icon="💯" label="Health Score" value={`${healthScore}/100`} />
        </div>
      </div>

      {/* Gamifikasi & Badges */}
      <div className="bg-white rounded-lg p-8 shadow-md border border-border flex flex-col gap-4">
        <h3 className="text-base font-bold text-primary uppercase tracking-wider flex items-center justify-between">
          <span className='flex items-center gap-1 text-[12px] lg:text-lg'><Trophy size={20} /> Lencana Pencapaian</span>
          <span className="text-[0.8rem] text-text-secondary bg-bg px-3 py-1 rounded-full lowercase inline-flex items-center gap-1">
            {totalSessions > 0 ? (
              <>
                <Flame size={14} className="text-orange-500 shrink-0" />
                Aktif
              </>
            ) : (
              <>
                <Snowflake size={14} className="text-sky-500 shrink-0" />
                Belum Mulai
              </>
            )}
          </span>
        </h3>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4 mt-2">
          {/* Badge 1 */}
          <div className={`p-4 rounded-md border text-center flex flex-col gap-2 transition-all ${totalSessions > 0 ? 'border-primary-light bg-teal-50' : 'border-border bg-bg opacity-60 grayscale'}`}>
            <span className="text-[2.5rem]">🌱</span>
            <div>
              <strong className="block text-[0.9rem] text-text font-bold">Posture Rookie</strong>
              <p className="text-[0.75rem] text-text-secondary">Selesaikan sesi pertama</p>
            </div>
          </div>

          {/* Badge 2 */}
          <div className={`p-4 rounded-md border text-center flex flex-col gap-2 transition-all ${totalBreaks >= 5 ? 'border-orange-300 bg-orange-50' : 'border-border bg-bg opacity-60 grayscale'}`}>
            <span className="text-[2.5rem]">☕</span>
            <div>
              <strong className="block text-[0.9rem] text-text font-bold">Break Master</strong>
              <p className="text-[0.75rem] text-text-secondary">Ambil 5x jeda</p>
            </div>
          </div>

          {/* Badge 3 */}
          <div className={`p-4 rounded-md border text-center flex flex-col gap-2 transition-all ${totalSittingAll >= 100 ? 'border-blue-300 bg-blue-50' : 'border-border bg-bg opacity-60 grayscale'}`}>
            <span className="text-[2.5rem]">🛡️</span>
            <div>
              <strong className="block text-[0.9rem] text-text font-bold">Iron Back</strong>
              <p className="text-[0.75rem] text-text-secondary">Duduk &gt; 100 menit</p>
            </div>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-[#FFF5F5] rounded-lg p-8 shadow-md border border-red-200 flex flex-col gap-4">
        <h3 className="flex items-center gap-1 text-[12px] lg:text-lg font-bold text-danger uppercase tracking-wider"><TriangleAlert size={20} /> Zona Berbahaya</h3>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4 flex-wrap p-4 bg-white rounded-md border border-red-200">
            <div>
              <strong className="block text-text text-[0.92rem]">Hapus Riwayat Sesi</strong>
              <p className="text-[0.8rem] text-text-secondary mt-0.5">Semua data sesi akan dihapus permanen dari perangkat ini.</p>
            </div>
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-[0.95rem] font-semibold transition-all bg-danger text-white shadow-[0_4px_14px_rgba(239,68,68,0.3)] hover:bg-[#DC2626] hover:-translate-y-px cursor-pointer border-none" onClick={handleClear}>
              <Trash2 size={20} /> Hapus Data
            </button>
          </div>
          <div className="flex items-center justify-between gap-4 flex-wrap p-4 bg-white rounded-md border border-red-200">
            <div>
              <strong className="block text-text text-[0.92rem]">Keluar dari Akun</strong>
              <p className="text-[0.8rem] text-text-secondary mt-0.5">Sesi login akan dihapus. Kamu perlu masuk kembali.</p>
            </div>
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-[0.95rem] font-semibold transition-all bg-danger text-white shadow-[0_4px_14px_rgba(239,68,68,0.3)] hover:bg-[#DC2626] hover:-translate-y-px cursor-pointer border-none" onClick={handleLogout}>
              <LogOut size={20} /> Logout
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function StatBox({ icon, label, value }) {
  return (
    <div className="bg-card border border-border rounded-lg px-4 py-6 flex flex-col items-center gap-[0.3rem] shadow-sm hover:-translate-y-0.5 transition-transform">
      <span className="text-[1.6rem]">{icon}</span>
      <span className="font-heading text-[1.4rem] font-bold text-primary">{value}</span>
      <span className="text-[0.72rem] uppercase tracking-wide text-text-secondary text-center">{label}</span>
    </div>
  );
}
