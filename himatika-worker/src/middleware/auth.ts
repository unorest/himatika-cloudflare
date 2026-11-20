// src/middleware/auth.ts
// Pengganti AuthFilter.php — cek JWT dari cookie atau header

import { createMiddleware } from 'hono/factory'
import { verifyToken, getTokenFromRequest } from '../lib/auth'
import type { Env, Variables } from '../types/env'

export const authMiddleware = createMiddleware<{
  Bindings: Env
  Variables: Variables
}>(async (c, next) => {
  const token = getTokenFromRequest(c.req.raw)

  if (!token) {
    // Jika JSON request → 401, jika browser → redirect login
    const accept = c.req.header('Accept') ?? ''
    if (accept.includes('application/json')) {
      return c.json({ success: false, message: 'Belum login' }, 401)
    }
    return c.redirect('/admin/login')
  }

  const payload = await verifyToken(token, c.env.JWT_SECRET)
  if (!payload) {
    const accept = c.req.header('Accept') ?? ''
    if (accept.includes('application/json')) {
      return c.json({ success: false, message: 'Token tidak valid atau kadaluarsa' }, 401)
    }
    return c.redirect('/admin/login')
  }

  // Cek user masih aktif di DB
  const user = await c.env.DB
    .prepare(`SELECT is_active FROM hmt_users WHERE id = ? AND deleted_at IS NULL`)
    .bind(payload.id)
    .first<{ is_active: number }>()

  if (!user || user.is_active === 0) {
    return c.json({ success: false, message: 'Akun dinonaktifkan' }, 403)
  }

  c.set('user', payload)
  await next()
})
