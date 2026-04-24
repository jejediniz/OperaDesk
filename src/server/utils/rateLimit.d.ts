export interface RateLimitOptions {
  max?: number
  windowMs?: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterMs: number
  resetAt: number
}

export function consume(key: string, options?: RateLimitOptions): RateLimitResult
export function reset(key: string): void
