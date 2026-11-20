// src/models/user.model.ts

export type User = {
  id: number
  name: string
  nim: string
  email: string
  password: string
  avatar: string | null
  role: 'admin' | 'kadiv' | 'staff'
  division_id: number | null
  is_active: number
  last_login: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type UserPublic = Omit<User, 'password' | 'remember_token'>

export async function findUserByEmail(db: D1Database, email: string) {
  return db
    .prepare(`SELECT * FROM hmt_users WHERE email = ? AND deleted_at IS NULL`)
    .bind(email)
    .first<User>()
}

export async function findUserById(db: D1Database, id: number) {
  return db
    .prepare(`SELECT * FROM hmt_users WHERE id = ? AND deleted_at IS NULL`)
    .bind(id)
    .first<User>()
}

export async function getAllUsers(
  db: D1Database,
  params: { page?: number; per_page?: number; role?: string; division_id?: number }
) {
  const page     = params.page ?? 1
  const perPage  = params.per_page ?? 20
  const offset   = (page - 1) * perPage

  let query = `
    SELECT u.id, u.name, u.nim, u.email, u.avatar, u.role,
           u.is_active, u.last_login, u.created_at,
           d.name as division_name
    FROM hmt_users u
    LEFT JOIN hmt_divisions d ON u.division_id = d.id
    WHERE u.deleted_at IS NULL
  `
  const bindings: (string | number)[] = []

  if (params.role) {
    query += ` AND u.role = ?`
    bindings.push(params.role)
  }
  if (params.division_id) {
    query += ` AND u.division_id = ?`
    bindings.push(params.division_id)
  }

  query += ` ORDER BY u.name ASC LIMIT ? OFFSET ?`
  bindings.push(perPage, offset)

  const { results } = await db.prepare(query).bind(...bindings).all()

  const countResult = await db
    .prepare(`SELECT COUNT(*) as total FROM hmt_users WHERE deleted_at IS NULL`)
    .first<{ total: number }>()

  return { results, total: countResult?.total ?? 0, page, perPage }
}

export async function createUser(
  db: D1Database,
  data: {
    name: string
    nim: string
    email: string
    password: string
    role: string
    division_id?: number | null
  }
) {
  return db
    .prepare(`
      INSERT INTO hmt_users (name, nim, email, password, role, division_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `)
    .bind(data.name, data.nim, data.email, data.password, data.role, data.division_id ?? null)
    .run()
}

export async function updateUser(
  db: D1Database,
  id: number,
  data: Partial<Omit<User, 'id' | 'created_at' | 'deleted_at'>>
) {
  const fields = Object.keys(data).map(k => `${k} = ?`).join(', ')
  const values = Object.values(data)
  return db
    .prepare(`UPDATE hmt_users SET ${fields}, updated_at = datetime('now') WHERE id = ?`)
    .bind(...values, id)
    .run()
}

export async function softDeleteUser(db: D1Database, id: number) {
  return db
    .prepare(`UPDATE hmt_users SET deleted_at = datetime('now') WHERE id = ?`)
    .bind(id)
    .run()
}

export async function updateLastLogin(db: D1Database, id: number) {
  return db
    .prepare(`UPDATE hmt_users SET last_login = datetime('now') WHERE id = ?`)
    .bind(id)
    .run()
}
