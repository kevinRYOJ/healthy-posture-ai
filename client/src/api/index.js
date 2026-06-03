// API — semua network call ke backend Express

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const BASE_AUTH = `${BASE_URL}/api/auth`;
const BASE_PREDICT = `${BASE_URL}/predict`;
const BASE_SESSIONS = `${BASE_URL}/api/sessions`;

function authHeaders() {
  const token = localStorage.getItem('hpr_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleRes(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request gagal');
  return data;
}

// ── Auth ─────────────────────────────────────────────────────
export async function register(name, email, password, confirmPassword) {
  const res = await fetch(`${BASE_AUTH}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, confirmPassword }),
  });
  return handleRes(res);
}

export async function login(email, password) {
  const res = await fetch(`${BASE_AUTH}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleRes(res);
}

export async function getMe() {
  const res = await fetch(`${BASE_AUTH}/me`, { headers: authHeaders() });
  return handleRes(res);
}

export async function updateProfile(name) {
  const res = await fetch(`${BASE_AUTH}/profile`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ name }),
  });
  return handleRes(res);
}

export async function savePersonalization(data) {
  const res = await fetch(`${BASE_AUTH}/profile`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleRes(res);
}

// ── Sessions ─────────────────────────────────────────────────
export async function getSessions() {
  const res = await fetch(BASE_SESSIONS, {
    method: 'GET',
    headers: authHeaders(),
  });
  return handleRes(res);
}

export async function createSession(session) {
  const res = await fetch(BASE_SESSIONS, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(session),
  });
  return handleRes(res);
}

export async function deleteAllSessions() {
  const res = await fetch(BASE_SESSIONS, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleRes(res);
}

// ── Prediction ───────────────────────────────────────────────
export async function predictRisk(totalSittingMinutes) {
  const res = await fetch(BASE_PREDICT, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ total_sitting: totalSittingMinutes }),
  });
  return handleRes(res);
}

export async function checkHealth() {
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    return res.ok;
  } catch {
    return false;
  }
}
