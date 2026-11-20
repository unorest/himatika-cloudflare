// src/routes/public/blog.ts

import { Hono } from 'hono'
import { getPublishedPosts, getPostBySlug } from '../../models/post.model'
import type { Env } from '../../types/env'

export const blogRouter = new Hono<{ Bindings: Env }>()

// GET /blog — daftar artikel published
blogRouter.get('/', async (c) => {
  const page          = Number(c.req.query('page') ?? 1)
  const per_page      = Number(c.req.query('per_page') ?? 10)
  const category_slug = c.req.query('category')

  const { results, total, perPage } = await getPublishedPosts(c.env.DB, {
    page, per_page, category_slug
  })

  return c.json({
    success: true,
    data: results,
    meta: {
      total,
      page,
      per_page: perPage,
      last_page: Math.ceil(total / perPage),
    },
  })
})

// GET /blog/:slug — detail artikel
blogRouter.get('/:slug', async (c) => {
  const slug = c.req.param('slug')
  const post = await getPostBySlug(c.env.DB, slug)

  if (!post) {
    return c.json({ success: false, message: 'Artikel tidak ditemukan' }, 404)
  }

  return c.json({ success: true, data: post })
})
