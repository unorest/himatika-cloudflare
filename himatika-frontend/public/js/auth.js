// ============================================================
// auth.js — Auth state management untuk HIMATIKA Frontend
// ============================================================

const AUTH_TOKEN_KEY = 'hmt_token';
const AUTH_USER_KEY  = 'hmt_user';

/**
 * Ambil data user yang sedang login dari localStorage.
 * @returns {Object|null}
 */
function getUser() {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Simpan token dan data user ke localStorage.
 * @param {string} token  — JWT / opaque token dari Worker
 * @param {Object} user   — object user (id, name, email, role, dsb.)
 */
function setToken(token, user) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

/**
 * Hapus token & user, lalu redirect ke halaman login.
 */
function logout() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  window.location.href = '/admin/login.html';
}

/**
 * Pastikan user sudah login. Jika belum, redirect ke login.
 * Kembalikan data user jika sudah login.
 * @returns {Object} user
 */
function requireAuth() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const user  = getUser();
  if (!token || !user) {
    window.location.href = '/admin/login.html';
    throw new Error('Unauthenticated');
  }
  return user;
}

/**
 * Pastikan user sudah login DAN memiliki salah satu role yang diizinkan.
 * Jika token tidak ada → redirect ke login.
 * Jika role tidak sesuai → redirect ke /admin/dashboard.html dengan pesan error.
 *
 * @param {...string} roles  — daftar role yang diizinkan, misal: 'admin', 'moderator'
 * @returns {Object} user
 */
function requireRole(...roles) {
  const user = requireAuth(); // sudah handle redirect jika belum login
  if (!roles.includes(user.role)) {
    alert(`Akses ditolak. Halaman ini hanya untuk: ${roles.join(', ')}.`);
    window.location.href = '/admin/dashboard.html';
    throw new Error('Forbidden');
  }
  return user;
}

// ============================================================
// Alpine.js store — bisa dipakai di komponen Alpine
// Contoh pemakaian: $store.auth.user.name
// ============================================================
document.addEventListener('alpine:init', () => {
  if (typeof Alpine !== 'undefined') {
    Alpine.store('auth', {
      token: localStorage.getItem(AUTH_TOKEN_KEY),
      user:  getUser(),

      setToken(token, user) {
        setToken(token, user);
        this.token = token;
        this.user  = user;
      },

      logout() {
        logout();
      },

      get isLoggedIn() {
        return !!this.token && !!this.user;
      },
    });
  }
});
