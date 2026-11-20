// src/types/env.d.ts
// Definisi binding Cloudflare (D1, KV, R2) untuk TypeScript

export type Env = {
  // D1 Database
  DB: D1Database

  // KV Namespace untuk session
  SESSIONS: KVNamespace

  // R2 Bucket untuk file upload
  UPLOADS: R2Bucket

  // Environment variables
  JWT_SECRET: string
  APP_NAME: string
  APP_ENV: string
}

// User payload yang tersimpan di JWT
export type JWTPayload = {
  id: number
  name: string
  email: string
  nim: string
  role: 'admin' | 'kadiv' | 'staff'
  division_id: number | null
  avatar: string | null
  exp: number
  iat: number
}

// Context variables Hono
export type Variables = {
  user: JWTPayload
}

// Type untuk response standar API
export type ApiResponse<T = unknown> = {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string>
  meta?: {
    total: number
    page: number
    per_page: number
    last_page: number
  }
}
