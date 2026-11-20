// src/routes/admin/tasks.ts
// Pengganti TaskController.php + TaskLogController.php

import { Hono } from 'hono'
import { getKanbanBoard, moveTask, createTask, recalculateProgress } from '../../models/task.model'
import { createNotification } from '../../lib/notify'
import { adminKadiv, allRoles } from '../../middleware/role'
import type { Env, Variables } from '../../types/env'

export const tasksRouter = new Hono<{ Bindings: Env; Variables: Variables }>()

// GET /admin/tasks/kanban/:workProgramId — Papan Kanban
tasksRouter.get('/kanban/:workProgramId', allRoles, async (c) => {
  const wpId  = Number(c.req.param('workProgramId'))
  const board = await getKanbanBoard(c.env.DB, wpId)
  return c.json({ success: true, data: board })
})

// POST /admin/tasks/move — Drag & drop status (AJAX)
tasksRouter.post('/move', allRoles, async (c) => {
  const body = await c.req.json<{
    task_id: number
    status: 'todo' | 'in_progress' | 'review' | 'done'
    sort_order: number
  }>()

  await moveTask(c.env.DB, body.task_id, body.status, body.sort_order)

  return c.json({ success: true, message: 'Status tugas diperbarui' })
})

// GET /admin/tasks — semua task
tasksRouter.get('/', allRoles, async (c) => {
  const user = c.get('user')
  let query  = `
    SELECT t.*, u.name as assigned_name, wp.title as work_program_title
    FROM hmt_tasks t
    LEFT JOIN hmt_users u ON t.assigned_to = u.id
    LEFT JOIN hmt_work_programs wp ON t.work_program_id = wp.id
    WHERE t.deleted_at IS NULL
  `
  // Staff hanya lihat task miliknya
  if (user.role === 'staff') {
    query += ` AND t.assigned_to = ${user.id}`
  }
  query += ` ORDER BY t.created_at DESC`

  const { results } = await c.env.DB.prepare(query).all()
  return c.json({ success: true, data: results })
})

// POST /admin/tasks — buat task baru
tasksRouter.post('/', adminKadiv, async (c) => {
  const user = c.get('user')
  const body = await c.req.json<{
    work_program_id: number
    title: string
    description?: string
    priority?: string
    assigned_to?: number
    due_date?: string
  }>()

  if (!body.title?.trim() || !body.work_program_id) {
    return c.json({ success: false, message: 'Judul dan work program wajib diisi' }, 422)
  }

  const result = await createTask(c.env.DB, { ...body, created_by: user.id })

  // Notif ke assignee
  if (body.assigned_to) {
    await createNotification(c.env.DB, {
      user_id:          body.assigned_to,
      type:             'task_assigned',
      title:            `Tugas baru diberikan: ${body.title}`,
      url:              `/admin/tasks/${result.meta?.last_row_id}`,
      notifiable_type:  'Task',
      notifiable_id:    result.meta?.last_row_id,
    })
  }

  return c.json({ success: true, message: 'Tugas berhasil dibuat' }, 201)
})

// GET /admin/tasks/:id — detail task
tasksRouter.get('/:id', allRoles, async (c) => {
  const id = Number(c.req.param('id'))
  const task = await c.env.DB
    .prepare(`
      SELECT t.*, u.name as assigned_name, wp.title as work_program_title,
             cb.name as created_by_name
      FROM hmt_tasks t
      LEFT JOIN hmt_users u ON t.assigned_to = u.id
      LEFT JOIN hmt_work_programs wp ON t.work_program_id = wp.id
      LEFT JOIN hmt_users cb ON t.created_by = cb.id
      WHERE t.id = ? AND t.deleted_at IS NULL
    `)
    .bind(id)
    .first()

  if (!task) return c.json({ success: false, message: 'Tugas tidak ditemukan' }, 404)

  const { results: logs } = await c.env.DB
    .prepare(`
      SELECT tpl.*, u.name as user_name, u.avatar
      FROM hmt_task_progress_logs tpl
      JOIN hmt_users u ON tpl.user_id = u.id
      WHERE tpl.task_id = ?
      ORDER BY tpl.logged_date DESC
    `)
    .bind(id)
    .all()

  return c.json({ success: true, data: { task, logs } })
})

// POST /admin/tasks/:id/log — tambah progress log
tasksRouter.post('/:id/log', allRoles, async (c) => {
  const user   = c.get('user')
  const taskId = Number(c.req.param('id'))
  const body   = await c.req.json<{
    body: string
    status_snapshot: string
    logged_date: string
  }>()

  if (!body.body?.trim()) {
    return c.json({ success: false, message: 'Isi log tidak boleh kosong' }, 422)
  }

  await c.env.DB
    .prepare(`
      INSERT INTO hmt_task_progress_logs
        (task_id, user_id, body, status_snapshot, logged_date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `)
    .bind(taskId, user.id, body.body, body.status_snapshot, body.logged_date)
    .run()

  return c.json({ success: true, message: 'Log progress ditambahkan' }, 201)
})

// DELETE /admin/tasks/:id — soft delete
tasksRouter.delete('/:id', adminKadiv, async (c) => {
  const id = Number(c.req.param('id'))
  await c.env.DB
    .prepare(`UPDATE hmt_tasks SET deleted_at = datetime('now') WHERE id = ?`)
    .bind(id)
    .run()

  return c.json({ success: true, message: 'Tugas dihapus' })
})
