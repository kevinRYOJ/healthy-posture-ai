// ============================================================
// API — semua network call ke backend Express (port 5000)
// Vite proxy: /predict  →  http://localhost:5000/predict
//             /api/...  →  http://localhost:5000/...
// ============================================================

const BASE = '/predict';

/**
 * Kirim total duduk (menit) ke backend → dapat prediksi risiko
 * @param {number} totalSittingMinutes
 * @returns {Promise<{risk: 'Low'|'Medium'|'High'}>}
 */
export async function predictRisk(totalSittingMinutes) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ total_sitting: totalSittingMinutes }),
  });
  if (!res.ok) throw new Error('Gagal menghubungi server prediksi');
  return res.json();
}

/**
 * Cek apakah backend aktif
 * @returns {Promise<boolean>}
 */
export async function checkHealth() {
  try {
    const res = await fetch('/api/');
    return res.ok;
  } catch {
    return false;
  }
}
