import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { savePersonalization } from '../api';

export default function PersonalizationSetup() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    age: 25,
    weight: 65,
    height: 170,
    sleep_hours: 7.5,
    gender: 'Male',
    work_type: 'Office',
    fitness_level: 'Medium',
    device_preference: 'Laptop'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const computedBmi = (form.weight / ((form.height / 100) ** 2)).toFixed(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        bmi: parseFloat(computedBmi)
      };
      await savePersonalization(payload);
      updateUser({ has_personalized: true, ...payload });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Gagal menyimpan data profil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-70px)] flex flex-col items-center justify-center p-8 px-6 bg-[radial-gradient(ellipse_at_60%_0%,#CCFBF1_0%,var(--color-bg)_60%)]">
      <div className="bg-white rounded-xl shadow-lg border border-border w-full max-w-[500px] p-8 animate-fade-in">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-primary font-heading">Personalisasi Profil</h1>
          <p className="text-sm text-text-secondary mt-1">Kami memerlukan sedikit informasi agar AI kami bisa memberikan analisis postur duduk yang akurat untuk Anda.</p>
        </div>

        {error && <div className="bg-red-50 text-danger text-sm p-3 rounded-md mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-text">Usia</label>
              <input type="number" name="age" value={form.age} onChange={handleChange} required min="10" max="100" className="px-3 py-2 border border-border rounded-md outline-none focus:border-primary-light focus:ring-[2px] focus:ring-primary-light/20 transition-all text-sm" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-text">Berat Badan (kg)</label>
              <input type="number" name="weight" value={form.weight} onChange={handleChange} required min="30" max="200" className="px-3 py-2 border border-border rounded-md outline-none focus:border-primary-light focus:ring-[2px] focus:ring-primary-light/20 transition-all text-sm" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-text">Tinggi Badan (cm)</label>
              <input type="number" name="height" value={form.height} onChange={handleChange} required min="100" max="250" className="px-3 py-2 border border-border rounded-md outline-none focus:border-primary-light focus:ring-[2px] focus:ring-primary-light/20 transition-all text-sm" />
            </div>
          </div>

          <div className="bg-primary/5 p-3 rounded-md border border-primary/20 flex justify-between items-center">
            <span className="text-sm font-medium text-text">Estimasi BMI Anda:</span>
            <span className="text-lg font-bold text-primary">{isNaN(computedBmi) || !isFinite(computedBmi) ? '-' : computedBmi}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-text">Jam Tidur (per hari)</label>
              <input type="number" name="sleep_hours" value={form.sleep_hours} onChange={handleChange} required step="0.5" min="2" max="14" className="px-3 py-2 border border-border rounded-md outline-none focus:border-primary-light focus:ring-[2px] focus:ring-primary-light/20 transition-all text-sm" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-text">Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange} required className="px-3 py-2 border border-border rounded-md outline-none focus:border-primary-light focus:ring-[2px] focus:ring-primary-light/20 transition-all text-sm bg-white">
                <option value="Male">Laki-laki</option>
                <option value="Female">Perempuan</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-text">Tipe Pekerjaan</label>
            <select name="work_type" value={form.work_type} onChange={handleChange} required className="px-3 py-2 border border-border rounded-md outline-none focus:border-primary-light focus:ring-[2px] focus:ring-primary-light/20 transition-all text-sm bg-white">
              <option value="Office">Kantoran (Office)</option>
              <option value="WFH">Work From Home (WFH)</option>
              <option value="Hybrid">Hybrid (Campuran)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-text">Tingkat Kebugaran</label>
              <select name="fitness_level" value={form.fitness_level} onChange={handleChange} required className="px-3 py-2 border border-border rounded-md outline-none focus:border-primary-light focus:ring-[2px] focus:ring-primary-light/20 transition-all text-sm bg-white">
                <option value="Low">Rendah (Jarang olahraga)</option>
                <option value="Medium">Sedang (1-3x seminggu)</option>
                <option value="High">Tinggi (Sering olahraga)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-text">Device Favorit</label>
              <select name="device_preference" value={form.device_preference} onChange={handleChange} required className="px-3 py-2 border border-border rounded-md outline-none focus:border-primary-light focus:ring-[2px] focus:ring-primary-light/20 transition-all text-sm bg-white">
                <option value="Laptop">Laptop</option>
                <option value="Desktop">Desktop</option>
                <option value="Tablet">Tablet</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={loading} className="mt-4 w-full bg-primary text-white py-3 rounded-full text-sm font-semibold shadow-md hover:bg-primary-dark transition-all disabled:opacity-50">
            {loading ? 'Menyimpan...' : 'Selesai & Lanjut'}
          </button>
        </form>
      </div>
    </main>
  );
}
