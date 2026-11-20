// Konstanta base URL Worker dengan Smart Auto-Detection untuk Local & Codespaces
function getApiBase() {
  if (localStorage.getItem('API_BASE')) {
    return localStorage.getItem('API_BASE');
  }
  // Deteksi otomatis jika berjalan di GitHub Codespaces (*-3000.app.github.dev -> *-8787.app.github.dev)
  if (typeof window !== 'undefined' && window.location.hostname.includes('.app.github.dev')) {
    return window.location.origin.replace('-3000.', '-8787.');
  }
  return 'http://localhost:8787';
}

const API_BASE = getApiBase();

// Helper fetch dengan auth header otomatis
async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('hmt_token');
  const base = getApiBase();
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok) throw { status: res.status, ...data };
  return data;
}

// CRUD helpers
const api = {
  get:    (path)         => apiFetch(path),
  post:   (path, body)   => apiFetch(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:    (path, body)   => apiFetch(path, { method: 'PUT',    body: JSON.stringify(body) }),
  patch:  (path, body)   => apiFetch(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  delete: (path)         => apiFetch(path, { method: 'DELETE' }),
};
