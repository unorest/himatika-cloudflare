// src/lib/notify.ts
// Helper notifikasi internal HIMATIKA

export type NotifType =
  | 'task_assigned'
  | 'task_updated'
  | 'forum_answered'
  | 'forum_moderated'
  | 'event_registered'
  | 'schedule_invited'
  | 'work_program_updated'

export async function createNotification(
  db: D1Database,
  params: {
    user_id: number
    type: NotifType
    title: string
    body?: string
    url?: string
    notifiable_type?: string
    notifiable_id?: number
  }
): Promise<void> {
  await db
    .prepare(`
      INSERT INTO hmt_notifications
        (user_id, type, title, body, url, notifiable_type, notifiable_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `)
    .bind(
      params.user_id,
      params.type,
      params.title,
      params.body ?? null,
      params.url ?? null,
      params.notifiable_type ?? null,
      params.notifiable_id ?? null
    )
    .run()
}

export async function markAllRead(db: D1Database, userId: number): Promise<void> {
  await db
    .prepare(`UPDATE hmt_notifications SET is_read = 1 WHERE user_id = ?`)
    .bind(userId)
    .run()
}

export async function getUnreadCount(db: D1Database, userId: number): Promise<number> {
  const result = await db
    .prepare(`SELECT COUNT(*) as cnt FROM hmt_notifications WHERE user_id = ? AND is_read = 0`)
    .bind(userId)
    .first<{ cnt: number }>()
  return result?.cnt ?? 0
}
