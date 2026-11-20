// src/models/post.model.ts

export type Post = {
  id: number
  title: string
  slug: string
  body: string
  excerpt: string | null
  thumbnail: string | null
  author_id: number
  category_id: number | null
  status: 'draft' | 'published' | 'archived'
  read_time: number
  views: number
  published_at: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export async function getPublishedPosts(
  db: D1Database,
  params: { page?: number; per_page?: number; category_slug?: string; tag?: string }
) {
  const page    = params.page ?? 1
  const perPage = params.per_page ?? 10
  const offset  = (page - 1) * perPage

  let query = `
    SELECT p.id, p.title, p.slug, p.excerpt, p.thumbnail,
           p.read_time, p.views, p.published_at,
           u.name as author_name, u.avatar as author_avatar,
           c.name as category_name, c.slug as category_slug, c.color as category_color
    FROM hmt_posts p
    LEFT JOIN hmt_users u ON p.author_id = u.id
    LEFT JOIN hmt_categories c ON p.category_id = c.id
    WHERE p.status = 'published' AND p.deleted_at IS NULL
  `
  const bindings: (string | number)[] = []

  if (params.category_slug) {
    query += ` AND c.slug = ?`
    bindings.push(params.category_slug)
  }

  query += ` ORDER BY p.published_at DESC LIMIT ? OFFSET ?`
  bindings.push(perPage, offset)

  const { results } = await db.prepare(query).bind(...bindings).all()

  const total = await db
    .prepare(`SELECT COUNT(*) as cnt FROM hmt_posts WHERE status = 'published' AND deleted_at IS NULL`)
    .first<{ cnt: number }>()

  return { results, total: total?.cnt ?? 0, page, perPage }
}

export async function getPostBySlug(db: D1Database, slug: string) {
  // Increment views
  await db
    .prepare(`UPDATE hmt_posts SET views = views + 1 WHERE slug = ?`)
    .bind(slug)
    .run()

  return db
    .prepare(`
      SELECT p.*, u.name as author_name, u.avatar as author_avatar,
             c.name as category_name, c.slug as category_slug
      FROM hmt_posts p
      LEFT JOIN hmt_users u ON p.author_id = u.id
      LEFT JOIN hmt_categories c ON p.category_id = c.id
      WHERE p.slug = ? AND p.status = 'published' AND p.deleted_at IS NULL
    `)
    .bind(slug)
    .first<Post & { author_name: string; category_name: string }>()
}

export async function createPost(
  db: D1Database,
  data: {
    title: string
    slug: string
    body: string
    excerpt?: string
    thumbnail?: string
    author_id: number
    category_id?: number | null
    status?: string
    read_time?: number
    published_at?: string | null
  }
) {
  return db
    .prepare(`
      INSERT INTO hmt_posts
        (title, slug, body, excerpt, thumbnail, author_id, category_id,
         status, read_time, published_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `)
    .bind(
      data.title, data.slug, data.body,
      data.excerpt ?? null, data.thumbnail ?? null,
      data.author_id, data.category_id ?? null,
      data.status ?? 'draft', data.read_time ?? 1,
      data.published_at ?? null
    )
    .run()
}

export async function slugify(text: string): Promise<string> {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}
