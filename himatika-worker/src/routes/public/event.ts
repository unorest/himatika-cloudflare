// src/routes/public/event.ts

import { Hono } from 'hono'
import { getPublicEvents, registerToEvent } from '../../models/event.model'
import type { Env } from '../../types/env'

export const eventRouter = new Hono<{ Bindings: Env }>()

// GET /event — daftar/kalender event publik (FullCalendar JSON)
eventRouter.get('/', async (c) => {
  const from = c.req.query('start')
  const to   = c.req.query('end')

  const events = await getPublicEvents(c.env.DB, { from, to })
  return c.json({ success: true, data: events })
})

// GET /event/:slug — detail event
eventRouter.get('/:slug', async (c) => {
  const slug = c.req.param('slug')
  const event = await c.env.DB
    .prepare(`
      SELECT e.*, c.name as category_name, d.name as division_name
      FROM hmt_events e
      LEFT JOIN hmt_categories c ON e.category_id = c.id
      LEFT JOIN hmt_divisions d ON e.division_id = d.id
      WHERE e.slug = ? AND e.is_public = 1 AND e.deleted_at IS NULL
    `)
    .bind(slug)
    .first()

  if (!event) {
    return c.json({ success: false, message: 'Event tidak ditemukan' }, 404)
  }

  return c.json({ success: true, data: event })
})

// POST /event/:slug/daftar — pendaftaran peserta
eventRouter.post('/:slug/daftar', async (c) => {
  const slug = c.req.param('slug')

  // Ambil event ID
  const event = await c.env.DB
    .prepare(`SELECT id FROM hmt_events WHERE slug = ? AND deleted_at IS NULL`)
    .bind(slug)
    .first<{ id: number }>()

  if (!event) {
    return c.json({ success: false, message: 'Event tidak ditemukan' }, 404)
  }

  const body = await c.req.json<{
    name: string
    nim?: string
    email?: string
    phone?: string
    notes?: string
  }>()

  if (!body.name?.trim()) {
    return c.json({ success: false, message: 'Nama wajib diisi' }, 422)
  }

  const result = await registerToEvent(c.env.DB, event.id, body)

  if (!result.success) {
    return c.json({ success: false, message: result.message }, 422)
  }

  return c.json({ success: true, message: 'Pendaftaran berhasil!' }, 201)
})
