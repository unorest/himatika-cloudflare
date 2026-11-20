// src/models/task.model.ts

export type Task = {
  id: number
  work_program_id: number
  title: string
  description: string | null
  status: 'todo' | 'in_progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assigned_to: number | null
  due_date: string | null
  sort_order: number
  created_by: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export async function getKanbanBoard(db: D1Database, workProgramId: number) {
  const { results } = await db
    .prepare(`
      SELECT t.*, u.name as assigned_name, u.avatar as assigned_avatar
      FROM hmt_tasks t
      LEFT JOIN hmt_users u ON t.assigned_to = u.id
      WHERE t.work_program_id = ? AND t.deleted_at IS NULL
      ORDER BY t.sort_order ASC
    `)
    .bind(workProgramId)
    .all<Task & { assigned_name: string; assigned_avatar: string }>()

  // Kelompokkan per kolom kanban
  return {
    todo:        results.filter(t => t.status === 'todo'),
    in_progress: results.filter(t => t.status === 'in_progress'),
    review:      results.filter(t => t.status === 'review'),
    done:        results.filter(t => t.status === 'done'),
  }
}

export async function moveTask(
  db: D1Database,
  taskId: number,
  newStatus: Task['status'],
  newOrder: number
) {
  await db
    .prepare(`
      UPDATE hmt_tasks
      SET status = ?, sort_order = ?, updated_at = datetime('now')
      WHERE id = ? AND deleted_at IS NULL
    `)
    .bind(newStatus, newOrder, taskId)
    .run()

  // Ambil work_program_id lalu recalculate
  const task = await db
    .prepare(`SELECT work_program_id FROM hmt_tasks WHERE id = ?`)
    .bind(taskId)
    .first<{ work_program_id: number }>()

  if (task) {
    await recalculateProgress(db, task.work_program_id)
  }
}

export async function recalculateProgress(db: D1Database, workProgramId: number) {
  const result = await db
    .prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as done
      FROM hmt_tasks
      WHERE work_program_id = ? AND deleted_at IS NULL
    `)
    .bind(workProgramId)
    .first<{ total: number; done: number }>()

  const progress = result && result.total > 0
    ? Math.round((result.done / result.total) * 100)
    : 0

  await db
    .prepare(`UPDATE hmt_work_programs SET progress = ?, updated_at = datetime('now') WHERE id = ?`)
    .bind(progress, workProgramId)
    .run()
}

export async function createTask(
  db: D1Database,
  data: {
    work_program_id: number
    title: string
    description?: string
    priority?: string
    assigned_to?: number | null
    due_date?: string | null
    created_by: number
  }
) {
  // Ambil sort_order berikutnya
  const maxOrder = await db
    .prepare(`SELECT MAX(sort_order) as max FROM hmt_tasks WHERE work_program_id = ?`)
    .bind(data.work_program_id)
    .first<{ max: number }>()

  const sortOrder = (maxOrder?.max ?? 0) + 1

  return db
    .prepare(`
      INSERT INTO hmt_tasks
        (work_program_id, title, description, status, priority,
         assigned_to, due_date, sort_order, created_by, created_at, updated_at)
      VALUES (?, ?, ?, 'todo', ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `)
    .bind(
      data.work_program_id, data.title, data.description ?? null,
      data.priority ?? 'medium', data.assigned_to ?? null,
      data.due_date ?? null, sortOrder, data.created_by
    )
    .run()
}
