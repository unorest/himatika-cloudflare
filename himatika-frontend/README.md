# HIMATIKA Frontend

Frontend statis untuk **Himpunan Mahasiswa Matematika (HIMATIKA)** — dibangun dengan HTML, Tailwind CSS CDN, dan Alpine.js CDN. Di-deploy ke **Cloudflare Pages** dan berkomunikasi dengan **Cloudflare Worker** sebagai API backend.

---

## Struktur Folder

```
himatika-frontend/
├── public/                    ← Folder yang di-deploy ke Cloudflare Pages
│   ├── index.html             ← Halaman Beranda
│   ├── _redirects             ← SPA routing Cloudflare Pages
│   ├── css/
│   │   └── app.css            ← Custom styles (scrollbar, kanban, badge, toast)
│   ├── js/
│   │   ├── api.js             ← API client wrapper (fetch ke Worker)
│   │   └── auth.js            ← Auth state management
│   ├── components/
│   │   ├── navbar-public.html ← Navbar publik (snippet)
│   │   └── navbar-admin.html  ← Navbar + sidebar admin (snippet)
│   ├── blog/
│   │   ├── index.html
│   │   └── detail.html
│   ├── event/
│   │   ├── index.html
│   │   └── daftar.html
│   ├── forum/
│   │   ├── index.html
│   │   └── tanya.html
│   └── admin/
│       ├── login.html
│       ├── dashboard.html
│       ├── posts.html
│       ├── tasks.html
│       ├── forum.html
│       ├── schedules.html
│       └── work-programs.html
├── package.json
├── .gitignore
└── README.md
```

---

## Cara Deploy ke Cloudflare Pages

### 1. Push ke GitHub

```bash
git init
git add .
git commit -m "init: HIMATIKA frontend"
git remote add origin https://github.com/<username>/himatika-frontend.git
git push -u origin main
```

### 2. Buat Project di Cloudflare Pages

1. Buka [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Pages** → **Create a project**
2. Hubungkan ke repository GitHub `himatika-frontend`
3. Konfigurasi build:
   - **Framework preset**: `None`
   - **Build command**: `npm run build` (atau kosongkan)
   - **Build output directory**: `public`
4. Klik **Save and Deploy**

### 3. Custom Domain (opsional)

Di Cloudflare Pages → **Custom domains** → tambahkan domain kamu (misal `himatika.example.com`).

---

## Ganti API_BASE ke Production URL

Setelah Worker di-deploy, buka file [`public/js/api.js`](public/js/api.js) dan ganti baris pertama:

```js
// Sebelum (development):
const API_BASE = 'http://localhost:8787';

// Sesudah (production):
const API_BASE = 'https://himatika-worker.YOUR_SUBDOMAIN.workers.dev';
```

> **Tips:** Jika menggunakan custom domain untuk Worker, ganti dengan URL custom domain tersebut, misal `https://api.himatika.example.com`.

Lalu commit dan push — Cloudflare Pages akan otomatis redeploy.

---

## Development Lokal

```bash
# Install serve (satu kali)
npm install

# Jalankan dev server di http://localhost:3000
npm run dev
```

Pastikan Cloudflare Worker juga berjalan di `http://localhost:8787` (via `wrangler dev`).

---

## Tech Stack

| Layer     | Teknologi                        |
|-----------|----------------------------------|
| Hosting   | Cloudflare Pages                 |
| Styling   | Tailwind CSS (CDN)               |
| JS        | Alpine.js (CDN)                  |
| Calendar  | FullCalendar (CDN, halaman event)|
| Drag&Drop | SortableJS (CDN, Kanban)         |
| API       | Cloudflare Worker (REST JSON)    |
| Auth      | JWT disimpan di localStorage     |

---

## Catatan Keamanan

- Token JWT disimpan di `localStorage` dengan key `hmt_token`.
- Semua request ke endpoint `/admin/*` membutuhkan header `Authorization: Bearer <token>`.
- Jangan commit file `.env` ke repository (sudah ada di `.gitignore`).
