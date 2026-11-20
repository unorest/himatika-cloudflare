// src/lib/auth.ts
// Helper JWT + bcrypt (Web Crypto API)

import { sign, verify } from 'hono/jwt'
import type { JWTPayload } from '../types/env'

const TOKEN_EXPIRES = 60 * 60 * 24 * 7 // 7 hari

// ── Password Hashing (PBKDF2 via Web Crypto) ─────────────────
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  const hash = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    keyMaterial,
    256
  )
  const saltHex = Buffer.from(salt).toString('hex')
  const hashHex = Buffer.from(hash).toString('hex')
  return `${saltHex}:${hashHex}`
}

export async function verifyPassword(
  password: string,
  stored: string
): Promise<boolean> {
  const encoder = new TextEncoder()
  const [saltHex, hashHex] = stored.split(':')
  const salt = Buffer.from(saltHex, 'hex')
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  const hash = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    keyMaterial,
    256
  )
  return Buffer.from(hash).toString('hex') === hashHex
}

// ── JWT ───────────────────────────────────────────────────────
export async function signToken(
  payload: Omit<JWTPayload, 'exp' | 'iat'>,
  secret: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  return await sign(
    {
      ...payload,
      iat: now,
      exp: now + TOKEN_EXPIRES,
    },
    secret,
    'HS256'
  )
}

export async function verifyToken(
  token: string,
  secret: string
): Promise<JWTPayload | null> {
  try {
    const payload = await verify(token, secret, 'HS256')
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

// ── Cookie helper ─────────────────────────────────────────────
export function getTokenFromRequest(request: Request): string | null {
  // Cek Authorization header
  const authHeader = request.headers.get('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }
  // Cek cookie
  const cookieHeader = request.headers.get('Cookie') ?? ''
  const match = cookieHeader.match(/hmt_token=([^;]+)/)
  return match ? match[1] : null
}

export function setTokenCookie(token: string): string {
  return `hmt_token=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${TOKEN_EXPIRES}`
}

export function clearTokenCookie(): string {
  return `hmt_token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`
}
