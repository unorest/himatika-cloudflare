// src/models/event.model.ts

export type Event = {
  id: number
  title: string
  slug: string
  description: string | null
  location: string | null
  start_datetime: string
  end_datetime: string
  category_id: number | null
  division_id: number | null
  color: string | null
  is_public: number
  allow_registration: number
  max_participants: number | null
  registration_deadline: string | null
  created_by: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export async function getPublicEvents(
  db: D1Database,
  params: { from?: string; to?: string }
) {
  let query = `
    SELECT e.id, e.title, e.slug, e.start_datetime, e.end_datetime,
           e.location, e.color, e.allow_registration, e.max_participants,
           e.registration_deadline,
           c.name as category_name, d.name as division_name, d.color as division_color
    FROM hmt_events e
    LEFT JOIN hmt_categories c ON e.category_id = c.id
    LEFT JOIN hmt_divisions d ON e.division_id = d.id
    WHERE e.is_public = 1 AND e.deleted_at IS NULL
  `
  const bindings: string[] = []

  if (params.from) {
    query += ` AND e.end_datetime >= ?`
    bindings.push(params.from)
  }
  if (params.to) {
    query += ` AND e.start_datetime <= ?`
    bindings.push(params.to)
  }

  query += ` ORDER BY e.start_datetime ASC`

  const { results } = await db.prepare(query).bind(...bindings).all()
  return results
}

export async function registerToEvent(
  db: D1Database,
  eventId: number,
  data: {
    name: string
    nim?: string
    email?: string
    phone?: string
    notes?: string
  }
) {
  // Cek batas peserta
  const event = await db
    .prepare(`
      SELECT max_participants, allow_registration, registration_deadline
      FROM hmt_events WHERE id = ?
    `)
    .bind(eventId)
    .first<{ max_participants: number | null; allow_registration: number; registration_deadline: string | null }>()

  if (!event || !event.allow_registration) {
    return { success: false, message: 'Pendaftaran tidak dibuka' }
  }

  if (event.registration_deadline && new Date(event.registration_deadline) < new Date()) {
    return { success: false, message: 'Batas waktu pendaftaran sudah lewat' }
  }

  if (event.max_participants) {
    const count = await db
      .prepare(`SELECT COUNT(*) as cnt FROM hmt_event_registrations WHERE event_id = ? AND status != 'cancelled'`)
      .bind(eventId)
      .first<{ cnt: number }>()

    if ((count?.cnt ?? 0) >= event.max_participants) {
      return { success: false, message: 'Kuota peserta sudah penuh' }
    }
  }

  await db
    .prepare(`
      INSERT INTO hmt_event_registrations
        (event_id, name, nim, email, phone, notes, status, registered_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', datetime('now'), datetime('now'), datetime('now'))
    `)
    .bind(eventId, data.name, data.nim ?? null, data.email ?? null, data.phone ?? null, data.notes ?? null)
    .run()

  return { success: true }
}
