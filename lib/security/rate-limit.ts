import { createHash } from 'node:crypto'
import { createAdminClient } from '@/lib/supabase/admin'

const fallback = new Map<string, { count: number; resetAt: number }>()

function fingerprint(value: string) {
  const pepper = process.env.RATE_LIMIT_PEPPER ?? 'opiope-dev-rate-limit'
  return createHash('sha256').update(`${pepper}:${value}`).digest('hex')
}

export function requestIp(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return request.headers.get('cf-connecting-ip')?.trim() || forwarded || 'unknown'
}

export async function enforceRateLimit(input: {
  request: Request
  scope: string
  identifier?: string
  maxHits: number
  windowSeconds: number
}) {
  const raw = `${input.scope}|${requestIp(input.request)}|${input.identifier ?? ''}`
  const key = fingerprint(raw)
  const admin = createAdminClient()

  if (admin) {
    const { data, error } = await admin.rpc('consume_rate_limit', {
      p_key: key,
      p_window_seconds: input.windowSeconds,
      p_max_hits: input.maxHits,
    })
    if (!error && typeof data === 'boolean') return data
  }

  const now = Date.now()
  const current = fallback.get(key)
  if (!current || current.resetAt <= now) {
    fallback.set(key, { count: 1, resetAt: now + input.windowSeconds * 1000 })
    return true
  }
  if (current.count >= input.maxHits) return false
  current.count += 1
  fallback.set(key, current)
  return true
}

