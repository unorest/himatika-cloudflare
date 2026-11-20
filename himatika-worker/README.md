# HIMATIKA Worker — Cloudflare Workers + D1

Versi TypeScript/Cloudflare dari aplikasi HIMATIKA (sebelumnya: CodeIgniter 4 + MySQL).

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Runtime | Cloudflare Workers (TypeScript) |
| Framework | [Hono.js](https://hono.dev) |
| Database | Cloudflare D1 (SQLite) |
| Session | JWT + Cookie |
| File Upload | Cloudflare R2 |
| Deployment | Wrangler CLI |

## Struktur Folder

```
src/
├── index.ts                    # Entry point
├── types/env.d.ts              # Type definitions
├── middleware/
│   ├── auth.ts                 # JWT auth middleware
│   └── role.ts                 # RBAC middleware (admin/kadiv/staff)
├── lib/
│   ├── auth.ts                 # JWT + password hashing
│   ├── upload.ts               # R2 file upload
│   └── notify.ts               # Notifikasi helper
├── models/
│   ├── user.model.ts
│   ├── post.model.ts
│   ├── task.model.ts
│   ├── event.model.ts
│   └── forum.model.ts
└── routes/
    ├── public/
    │   ├── blog.ts             # GET /blog, /blog/:slug
    │   ├── event.ts            # GET /event, POST /event/:slug/daftar
    │   └── forum.ts            # GET /forum, POST /forum/tanya
    └── admin/
        ├── index.ts            # Registrasi + auth guard
        ├── auth.ts             # POST /admin/auth/login
        ├── dashboard.ts        # GET /admin/dashboard
        └── tasks.ts            # GET/POST /admin/tasks + Kanban

migrations/
├── 0001_create_divisions.sql
├── 0002_create_users.sql
├── 0003_create_categories.sql
├── 0004_create_posts.sql
├── 0005_create_events.sql
├── 0006_create_galleries.sql
├── 0007_create_forum.sql
├── 0008_create_work_programs.sql
├── 0009_create_tasks.sql
├── 0010_create_schedules.sql
├── 0011_create_notifications.sql
└── seed.sql
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Login ke Cloudflare

```bash
npx wrangler login
```

### 3. Buat D1 Database

```bash
npx wrangler d1 create himatika_db
```

Salin `database_id` yang muncul ke `wrangler.toml`.

### 4. Buat KV Namespace

```bash
npx wrangler kv:namespace create SESSIONS
```

Salin `id` ke `wrangler.toml`.

### 5. Buat R2 Bucket

```bash
npx wrangler r2 bucket create himatika-uploads
```

### 6. Jalankan Migrasi

```bash
# Local (development)
npm run db:migrate:local

# Production
npm run db:migrate
```

### 7. Seed data awal

```bash
npm run db:seed
```

> ⚠️ Setelah seed, buat admin user dengan password yang benar menggunakan script `hashPassword()`.

### 8. Dev server

```bash
npm run dev
# → http://localhost:8787
```

### 9. Deploy ke Cloudflare

```bash
npm run deploy
```

## API Endpoints

### Public

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/blog` | Daftar artikel |
| GET | `/blog/:slug` | Detail artikel |
| GET | `/event?start=&end=` | Kalender event (FullCalendar) |
| GET | `/event/:slug` | Detail event |
| POST | `/event/:slug/daftar` | Daftar peserta event |
| GET | `/forum` | Daftar pertanyaan |
| GET | `/forum/:id` | Detail + jawaban |
| POST | `/forum/tanya` | Kirim pertanyaan |
| POST | `/forum/upvote/:id` | Upvote pertanyaan |

### Admin (require JWT)

| Method | Endpoint | Role | Deskripsi |
|--------|----------|------|-----------|
| POST | `/admin/auth/login` | — | Login |
| POST | `/admin/auth/logout` | — | Logout |
| GET | `/admin/auth/me` | All | Info user login |
| GET | `/admin/dashboard` | All | Statistik + ringkasan |
| GET | `/admin/tasks/kanban/:wpId` | All | Papan Kanban |
| POST | `/admin/tasks/move` | All | Drag & drop status |
| GET | `/admin/tasks` | All | Daftar task |
| POST | `/admin/tasks` | admin/kadiv | Buat task |
| POST | `/admin/tasks/:id/log` | All | Tambah progress log |
| GET | `/admin/work-programs` | All | Daftar proker |
| GET | `/admin/schedules/api` | All | FullCalendar JSON |
| GET | `/admin/notifications` | All | Daftar notifikasi |

## Environment Variables

Atur di `wrangler.toml` atau Cloudflare Dashboard:

| Variabel | Keterangan |
|----------|-----------|
| `JWT_SECRET` | Secret signing JWT (min. 32 karakter) |
| `APP_NAME` | Nama aplikasi |
| `APP_ENV` | `development` atau `production` |
