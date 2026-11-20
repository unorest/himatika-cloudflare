// src/routes/admin/auth.ts
// Pengganti AuthController.php

import { Hono } from 'hono'
import { findUserByEmail, updateLastLogin } from '../../models/user.model'
import { verifyPassword, signToken, setTokenCookie, clearTokenCookie } from '../../lib/auth'
import type { Env, Variables } from '../../types/env'

export const authRouter = new Hono<{ Bindings: Env; Variables: Variables }>()

// POST /admin/login
authRouter.post('/login', async (c) => {
  const body = await c.req.json<{ email: string; password: string }>()

  if (!body.email || !body.password) {
    return c.json({ success: false, message: 'Email dan password wajib diisi' }, 422)
  }

  const user = await findUserByEmail(c.env.DB, body.email)

  if (!user || user.is_active === 0) {
    return c.json({ success: false, message: 'Email atau password salah' }, 401)
  }

  const valid = await verifyPassword(body.password, user.password)
  if (!valid) {
    return c.json({ success: false, message: 'Email atau password salah' }, 401)
  }

  await updateLastLogin(c.env.DB, user.id)

  const token = await signToken(
    {
      id:          user.id,
      name:        user.name,
      email:       user.email,
      nim:         user.nim,
      role:        user.role,
      division_id: user.division_id,
      avatar:      user.avatar,
    },
    c.env.JWT_SECRET
  )

  return c.json(
    {
      success: true,
      message: 'Login berhasil',
      data: {
        token,
        user: {
          id:          user.id,
          name:        user.name,
          email:       user.email,
          role:        user.role,
          division_id: user.division_id,
          avatar:      user.avatar,
        },
      },
    },
    200,
    { 'Set-Cookie': setTokenCookie(token) }
  )
})

// POST /admin/logout
authRouter.post('/logout', (c) => {
  return c.json(
    { success: true, message: 'Logout berhasil' },
    200,
    { 'Set-Cookie': clearTokenCookie() }
  )
})

// GET /admin/me — info user yang sedang login
authRouter.get('/me', async (c) => {
  const user = c.get('user')
  if (!user) return c.json({ success: false, message: 'Belum login' }, 401)

  const dbUser = await c.env.DB
    .prepare(`
      SELECT u.id, u.name, u.nim, u.email, u.avatar, u.role,
             u.division_id, u.last_login, d.name as division_name
      FROM hmt_users u
      LEFT JOIN hmt_divisions d ON u.division_id = d.id
      WHERE u.id = ?
    `)
    .bind(user.id)
    .first()

  return c.json({ success: true, data: dbUser })
})
