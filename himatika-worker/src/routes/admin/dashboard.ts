// src/routes/admin/dashboard.ts
// Pengganti DashboardController.php

import { Hono } from 'hono'
import type { Env, Variables } from '../../types/env'

export const dashboardRouter = new Hono<{ Bindings: Env; Variables: Variables }>()

// GET /admin/dashboard — statistik ringkas
dashboardRouter.get('/', async (c) => {
  const db   = c.env.DB
  const user = c.get('user')

  // Statistik umum (paralel)
  const [totalUsers, totalPosts, totalEvents, totalTasks, pendingForum, unreadNotif] =
    await Promise.all([
      db.prepare(`SELECT COUNT(*) as cnt FROM hmt_users WHERE deleted_at IS NULL AND is_active = 1`).first<{ cnt: number }>(),
      db.prepare(`SELECT COUNT(*) as cnt FROM hmt_posts WHERE status = 'published' AND deleted_at IS NULL`).first<{ cnt: number }>(),
      db.prepare(`SELECT COUNT(*) as cnt FROM hmt_events WHERE deleted_at IS NULL`).first<{ cnt: number }>(),
      db.prepare(`SELECT COUNT(*) as cnt FROM hmt_tasks WHERE deleted_at IS NULL`).first<{ cnt: number }>(),
      db.prepare(`SELECT COUNT(*) as cnt FROM hmt_forum_questions WHERE status = 'pending' AND deleted_at IS NULL`).first<{ cnt: number }>(),
      db.prepare(`SELECT COUNT(*) as cnt FROM hmt_notifications WHERE user_id = ? AND is_read = 0`).bind(user.id).first<{ cnt: number }>(),
    ])

  // Task saya (assigned_to = user saat ini)
  const { results: myTasks } = await db
    .prepare(`
      SELECT t.id, t.title, t.status, t.priority, t.due_date,
             wp.title as work_program_title
      FROM hmt_tasks t
      LEFT JOIN hmt_work_programs wp ON t.work_program_id = wp.id
      WHERE t.assigned_to = ? AND t.status != 'done' AND t.deleted_at IS NULL
      ORDER BY t.due_date ASC
      LIMIT 5
    `)
    .bind(user.id)
    .all()

  // Event mendatang (3 hari ke depan)
  const { results: upcomingEvents } = await db
    .prepare(`
      SELECT id, title, start_datetime, location
      FROM hmt_events
      WHERE start_datetime >= datetime('now')
        AND start_datetime <= datetime('now', '+7 days')
        AND deleted_at IS NULL
      ORDER BY start_datetime ASC
      LIMIT 5
    `)
    .all()

  return c.json({
    success: true,
    data: {
      stats: {
        total_users:    totalUsers?.cnt ?? 0,
        total_posts:    totalPosts?.cnt ?? 0,
        total_events:   totalEvents?.cnt ?? 0,
        total_tasks:    totalTasks?.cnt ?? 0,
        pending_forum:  pendingForum?.cnt ?? 0,
        unread_notif:   unreadNotif?.cnt ?? 0,
      },
      my_tasks:       myTasks,
      upcoming_events: upcomingEvents,
    },
  })
})
