const buckets = new Map()

function pruneExpired(now) {
  if (buckets.size < 1000) return

  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key)
    }
  }
}

function consume(key, { max = 5, windowMs = 60_000 } = {}) {
  const now = Date.now()
  pruneExpired(now)

  const existing = buckets.get(key)

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: max - 1, retryAfterMs: 0 }
  }

  if (existing.count >= max) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: existing.resetAt - now
    }
  }

  existing.count += 1
  return { allowed: true, remaining: max - existing.count, retryAfterMs: 0 }
}

function reset(key) {
  buckets.delete(key)
}

module.exports = { consume, reset }
