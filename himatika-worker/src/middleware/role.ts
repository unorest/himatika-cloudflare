// src/middleware/role.ts
// Pengganti RoleFilter.php — cek role RBAC (admin / kadiv / staff)

import { createMiddleware } from 'hono/factory'
import type { Env, Variables } from '../types/env'

type AllowedRole = 'admin' | 'kadiv' | 'staff'

export const roleMiddleware = (...roles: AllowedRole[]) =>
  createMiddleware<{ Bindings: Env; Variables: Variables }>(async (c, next) => {
    const user = c.get('user')

    if (!user) {
      return c.json({ success: false, message: 'Tidak terautentikasi' }, 401)
    }

    if (!roles.includes(user.role as AllowedRole)) {
      return c.json(
        {
          success: false,
          message: `Akses ditolak. Membutuhkan role: ${roles.join(' atau ')}`,
        },
        403
      )
    }

    await next()
  })

// Shortcut helpers
export const adminOnly    = roleMiddleware('admin')
export const adminKadiv   = roleMiddleware('admin', 'kadiv')
export const allRoles     = roleMiddleware('admin', 'kadiv', 'staff')
