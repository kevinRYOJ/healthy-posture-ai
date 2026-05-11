// API — semua network call ke backend Express


const BASE_AUTH    = '/api/auth';
const BASE_PREDICT = '/predict';

// ── Helper: tambah Authorization header jika ada token ──────
function authHeaders() {
  const token = localStorage.getItem('hpr_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleRes(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request gagal');
  return data;
}

// ── Auth ─────────────────────────────────────────────────────

/** POST /api/auth/register  →  { token, user } */
export async function register(name, email, password) {
  const res = await fetch(`${BASE_AUTH}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  return handleRes(res);
}

/** POST /api/auth/login  →  { token, user } */
export async function login(email, password) {
  const res = await fetch(`${BASE_AUTH}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleRes(res);
}

/** GET /api/auth/me  →  { user }  (butuh token) */
export async function getMe() {
  const res = await fetch(`${BASE_AUTH}/me`, { headers: authHeaders() });
  return handleRes(res);
}

/** PUT /api/auth/profile  →  { user }  (butuh token) */
export async function updateProfile(name) {
  const res = await fetch(`${BASE_AUTH}/profile`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ name }),
  });
  return handleRes(res);
}

// ── Prediction ───────────────────────────────────────────────

/** POST /predict  →  { risk: 'Low'|'Medium'|'High' } */
export async function predictRisk(totalSittingMinutes) {
  const res = await fetch(BASE_PREDICT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ total_sitting: totalSittingMinutes }),
  });
  return handleRes(res);
}

/** Cek apakah backend aktif */
export async function checkHealth() {
  try {
    const res = await fetch('/api/');
    return res.ok;
  } catch { return false; }
}
