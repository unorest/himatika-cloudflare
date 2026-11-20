// src/routes/admin/index.ts
// Registrasi semua admin routes + terapkan authMiddleware

import { Hono } from 'hono'
import { authMiddleware } from '../../middleware/auth'
import { authRouter } from './auth'
import { dashboardRouter } from './dashboard'
import { tasksRouter } from './tasks'
import type { Env, Variables } from '../../types/env'

export const adminRouter = new Hono<{ Bindings: Env; Variables: Variables }>()

// Auth routes — tanpa middleware (login/logout)
adminRouter.route('/auth', authRouter)

// Semua route di bawah ini wajib login
adminRouter.use('/*', authMiddleware)

// ── Dashboard ─────────────────────────────────────────────────
adminRouter.route('/dashboard', dashboardRouter)

// ── Tasks (Kanban) ────────────────────────────────────────────
adminRouter.route('/tasks', tasksRouter)

// ── Users ─────────────────────────────────────────────────────
adminRouter.get('/users', async (c) => {
  const { results } = await c.env.DB
    .prepare(`
      SELECT u.id, u.name, u.nim, u.email, u.role, u.is_active,
             d.name as division_name
      FROM hmt_users u
      LEFT JOIN hmt_divisions d ON u.division_id = d.id
      WHERE u.deleted_at IS NULL
      ORDER BY u.name ASC
    `)
    .all()
  return c.json({ success: true, data: results })
})

// ── Divisions ─────────────────────────────────────────────────
adminRouter.get('/divisions', async (c) => {
  const { results } = await c.env.DB
    .prepare(`
      SELECT d.*, u.name as head_name, COUNT(m.id) as member_count
      FROM hmt_divisions d
      LEFT JOIN hmt_users u ON d.head_user_id = u.id
      LEFT JOIN hmt_users m ON m.division_id = d.id AND m.deleted_at IS NULL
      WHERE d.deleted_at IS NULL
      GROUP BY d.id
      ORDER BY d.name ASC
    `)
    .all()
  return c.json({ success: true, data: results })
})

// ── Work Programs ─────────────────────────────────────────────
adminRouter.get('/work-programs', async (c) => {
  const user = c.get('user')
  let query  = `
    SELECT wp.*, d.name as division_name, u.name as created_by_name,
           COUNT(t.id) as task_count
    FROM hmt_work_programs wp
    LEFT JOIN hmt_divisions d ON wp.division_id = d.id
    LEFT JOIN hmt_users u ON wp.created_by = u.id
    LEFT JOIN hmt_tasks t ON t.work_program_id = wp.id AND t.deleted_at IS NULL
    WHERE wp.deleted_at IS NULL
  `
  if (user.role === 'kadiv' && user.division_id) {
    query += ` AND wp.division_id = ${user.division_id}`
  }
  query += ` GROUP BY wp.id ORDER BY wp.created_at DESC`

  const { results } = await c.env.DB.prepare(query).all()
  return c.json({ success: true, data: results })
})

// ── Schedules (FullCalendar JSON) ─────────────────────────────
adminRouter.get('/schedules/api', async (c) => {
  const user = c.get('user')
  const from = c.req.query('start')
  const to   = c.req.query('end')

  let query = `
    SELECT s.id, s.title, s.start_datetime as start, s.end_datetime as end,
           s.color, s.location, s.is_recurring, s.recurrence_rule,
           d.name as division_name
    FROM hmt_schedules s
    LEFT JOIN hmt_divisions d ON s.division_id = d.id
    WHERE s.deleted_at IS NULL
      AND (s.division_id IS NULL OR s.division_id = ?)
  `
  const binds: (string | number)[] = [user.division_id ?? 0]

  if (from) { query += ` AND s.end_datetime >= ?`;   binds.push(from) }
  if (to)   { query += ` AND s.start_datetime <= ?`; binds.push(to) }

  const { results } = await c.env.DB.prepare(query).bind(...binds).all()
  return c.json(results) // FullCalendar expects array langsung
})

// ── Notifications ─────────────────────────────────────────────
adminRouter.get('/notifications', async (c) => {
  const user = c.get('user')
  const { results } = await c.env.DB
    .prepare(`
      SELECT * FROM hmt_notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `)
    .bind(user.id)
    .all()

  return c.json({ success: true, data: results })
})

adminRouter.post('/notifications/read-all', async (c) => {
  const user = c.get('user')
  await c.env.DB
    .prepare(`UPDATE hmt_notifications SET is_read = 1 WHERE user_id = ?`)
    .bind(user.id)
    .run()

  return c.json({ success: true, message: 'Semua notifikasi ditandai sudah dibaca' })
})
