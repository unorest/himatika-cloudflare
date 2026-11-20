// src/index.ts — Entry point utama Cloudflare Worker
// Pengganti public/index.php CI4

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'

import { blogRouter }   from './routes/public/blog'
import { eventRouter }  from './routes/public/event'
import { forumRouter }  from './routes/public/forum'
import { adminRouter }  from './routes/admin'
import { serveFile }    from './lib/upload'

import type { Env, Variables } from './types/env'

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

// ── Global Middleware ─────────────────────────────────────────
app.use('*', logger())
app.use('*', prettyJSON())
app.use('*', cors({
  origin: (origin) => origin || '*',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}))

// ── Health Check ──────────────────────────────────────────────
app.get('/', (c) => {
  return c.json({
    app:     c.env.APP_NAME,
    version: '1.0.0',
    status:  'running',
    runtime: 'Cloudflare Workers',
    db:      'D1 (SQLite)',
  })
})

// ── Serve R2 Uploads ──────────────────────────────────────────
// GET /uploads/* — file yang diupload (avatar, gambar, dsb)
app.get('/uploads/*', async (c) => {
  const key = c.req.path.replace('/uploads/', '')
  return serveFile(c.env.UPLOADS, key)
})

// ── Public Routes ─────────────────────────────────────────────
app.route('/blog',   blogRouter)
app.route('/event',  eventRouter)
app.route('/forum',  forumRouter)

// ── Admin Routes (protected) ──────────────────────────────────
app.route('/admin',  adminRouter)

// ── 404 Handler ───────────────────────────────────────────────
app.notFound((c) => {
  return c.json({ success: false, message: `Route ${c.req.path} tidak ditemukan` }, 404)
})

// ── Error Handler ─────────────────────────────────────────────
app.onError((err, c) => {
  console.error(`[ERROR] ${err.message}`, err.stack)
  return c.json(
    { success: false, message: 'Terjadi kesalahan server', error: err.message },
    500
  )
})

export default app
