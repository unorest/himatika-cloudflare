// src/models/forum.model.ts

export type ForumQuestion = {
  id: number
  title: string
  body: string
  author_name: string
  author_nim: string | null
  author_email: string | null
  is_anonymous: number
  category_id: number | null
  status: 'pending' | 'answered' | 'rejected'
  upvotes: number
  ip_address: string | null
  is_pinned: number
  moderated_by: number | null
  moderated_at: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export async function getPublicQuestions(
  db: D1Database,
  params: { page?: number; per_page?: number; status?: string; category_slug?: string }
) {
  const page    = params.page ?? 1
  const perPage = params.per_page ?? 15
  const offset  = (page - 1) * perPage

  const { results } = await db
    .prepare(`
      SELECT q.id, q.title,
             CASE WHEN q.is_anonymous = 1 THEN 'Anonim' ELSE q.author_name END as author_display,
             q.status, q.upvotes, q.is_pinned, q.created_at,
             c.name as category_name, c.color as category_color,
             COUNT(a.id) as answer_count
      FROM hmt_forum_questions q
      LEFT JOIN hmt_categories c ON q.category_id = c.id
      LEFT JOIN hmt_forum_answers a ON q.id = a.question_id AND a.deleted_at IS NULL
      WHERE q.deleted_at IS NULL AND q.status != 'rejected'
      GROUP BY q.id
      ORDER BY q.is_pinned DESC, q.created_at DESC
      LIMIT ? OFFSET ?
    `)
    .bind(perPage, offset)
    .all()

  return results
}

export async function submitQuestion(
  db: D1Database,
  data: {
    title: string
    body: string
    author_name: string
    author_nim?: string
    author_email?: string
    is_anonymous?: boolean
    category_id?: number | null
    ip_address?: string
  }
) {
  return db
    .prepare(`
      INSERT INTO hmt_forum_questions
        (title, body, author_name, author_nim, author_email,
         is_anonymous, category_id, status, ip_address, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, datetime('now'), datetime('now'))
    `)
    .bind(
      data.title, data.body, data.author_name,
      data.author_nim ?? null, data.author_email ?? null,
      data.is_anonymous ? 1 : 0, data.category_id ?? null,
      data.ip_address ?? null
    )
    .run()
}

export async function upvoteQuestion(
  db: D1Database,
  questionId: number,
  ipAddress: string
) {
  // Cek duplikat
  const existing = await db
    .prepare(`SELECT id FROM hmt_forum_upvotes WHERE question_id = ? AND ip_address = ?`)
    .bind(questionId, ipAddress)
    .first()

  if (existing) {
    return { success: false, message: 'Sudah pernah upvote' }
  }

  // Tambah upvote record
  await db
    .prepare(`
      INSERT INTO hmt_forum_upvotes (question_id, ip_address, created_at)
      VALUES (?, ?, datetime('now'))
    `)
    .bind(questionId, ipAddress)
    .run()

  // Increment counter
  await db
    .prepare(`UPDATE hmt_forum_questions SET upvotes = upvotes + 1 WHERE id = ?`)
    .bind(questionId)
    .run()

  return { success: true }
}
