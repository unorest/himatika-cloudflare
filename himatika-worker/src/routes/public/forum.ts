// src/routes/public/forum.ts

import { Hono } from 'hono'
import {
  getPublicQuestions,
  submitQuestion,
  upvoteQuestion,
} from '../../models/forum.model'
import type { Env } from '../../types/env'

export const forumRouter = new Hono<{ Bindings: Env }>()

// GET /forum — daftar pertanyaan publik
forumRouter.get('/', async (c) => {
  const page          = Number(c.req.query('page') ?? 1)
  const category_slug = c.req.query('category')

  const questions = await getPublicQuestions(c.env.DB, { page, category_slug })
  return c.json({ success: true, data: questions })
})

// GET /forum/:id — detail pertanyaan + jawaban
forumRouter.get('/:id', async (c) => {
  const id = Number(c.req.param('id'))

  const question = await c.env.DB
    .prepare(`
      SELECT q.*,
             CASE WHEN q.is_anonymous = 1 THEN 'Anonim' ELSE q.author_name END as author_display,
             c.name as category_name
      FROM hmt_forum_questions q
      LEFT JOIN hmt_categories c ON q.category_id = c.id
      WHERE q.id = ? AND q.deleted_at IS NULL AND q.status != 'rejected'
    `)
    .bind(id)
    .first()

  if (!question) {
    return c.json({ success: false, message: 'Pertanyaan tidak ditemukan' }, 404)
  }

  const { results: answers } = await c.env.DB
    .prepare(`
      SELECT a.*, u.name as answered_by_name, u.avatar as answered_by_avatar
      FROM hmt_forum_answers a
      JOIN hmt_users u ON a.answered_by = u.id
      WHERE a.question_id = ? AND a.deleted_at IS NULL
      ORDER BY a.created_at ASC
    `)
    .bind(id)
    .all()

  return c.json({ success: true, data: { question, answers } })
})

// POST /forum/tanya — ajukan pertanyaan baru
forumRouter.post('/tanya', async (c) => {
  const body = await c.req.json<{
    title: string
    body: string
    author_name: string
    author_nim?: string
    author_email?: string
    is_anonymous?: boolean
    category_id?: number
  }>()

  if (!body.title?.trim() || !body.body?.trim() || !body.author_name?.trim()) {
    return c.json({ success: false, message: 'Judul, isi, dan nama wajib diisi' }, 422)
  }

  const ip = c.req.header('CF-Connecting-IP') ?? c.req.header('X-Forwarded-For') ?? '0.0.0.0'

  await submitQuestion(c.env.DB, { ...body, ip_address: ip })

  return c.json(
    { success: true, message: 'Pertanyaan terkirim! Menunggu moderasi pengurus.' },
    201
  )
})

// POST /forum/upvote/:id — upvote pertanyaan (1x per IP)
forumRouter.post('/upvote/:id', async (c) => {
  const questionId = Number(c.req.param('id'))
  const ip = c.req.header('CF-Connecting-IP') ?? '0.0.0.0'

  const result = await upvoteQuestion(c.env.DB, questionId, ip)

  if (!result.success) {
    return c.json({ success: false, message: result.message }, 422)
  }

  return c.json({ success: true, message: 'Upvote berhasil!' })
})
