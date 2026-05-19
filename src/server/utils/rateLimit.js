const logger = require("./logger");

const KEY_PREFIX = "operadesk:rl:";
const buckets = new Map();

let redisClient = null;

function getRedis() {
  const url = process.env.REDIS_URL;
  if (!url || url.trim() === "") return null;

  if (!redisClient) {
    const Redis = require("ioredis");
    redisClient = new Redis(url, {
      maxRetriesPerRequest: 2,
      enableOfflineQueue: false
    });
    redisClient.on("error", (err) => {
      logger.error("redis_rate_limit_error", { message: err?.message });
    });
  }

  return redisClient;
}

function pruneExpired(now) {
  if (buckets.size < 1000) return;

  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

function consumeMemory(key, { max = 5, windowMs = 60_000 } = {}) {
  const now = Date.now();
  pruneExpired(now);

  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: max - 1, retryAfterMs: 0, resetAt };
  }

  if (existing.count >= max) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: existing.resetAt - now,
      resetAt: existing.resetAt
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: max - existing.count,
    retryAfterMs: 0,
    resetAt: existing.resetAt
  };
}

async function consumeRedis(key, { max, windowMs }) {
  const r = getRedis();
  const redisKey = `${KEY_PREFIX}${key}`;
  const count = await r.incr(redisKey);
  if (count === 1) {
    await r.pexpire(redisKey, windowMs);
  }
  const ttl = await r.pttl(redisKey);
  const effectiveTtl = ttl > 0 ? ttl : windowMs;

  if (count > max) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: effectiveTtl,
      resetAt: Date.now() + effectiveTtl
    };
  }

  return {
    allowed: true,
    remaining: max - count,
    retryAfterMs: 0,
    resetAt: Date.now() + effectiveTtl
  };
}

/**
 * @param {string} key
 * @param {{ max?: number, windowMs?: number }} [options]
 */
async function consume(key, { max = 5, windowMs = 60_000 } = {}) {
  if (!process.env.REDIS_URL || process.env.REDIS_URL.trim() === "") {
    return consumeMemory(key, { max, windowMs });
  }

  try {
    return await consumeRedis(key, { max, windowMs });
  } catch (err) {
    logger.warn?.("redis_rate_limit_fallback", {
      message: err?.message,
      key: key.slice(0, 80)
    });
    return consumeMemory(key, { max, windowMs });
  }
}

async function reset(key) {
  buckets.delete(key);

  const url = process.env.REDIS_URL;
  if (!url || url.trim() === "") return;

  try {
    const r = getRedis();
    await r.del(`${KEY_PREFIX}${key}`);
  } catch (err) {
    logger.warn?.("redis_rate_limit_reset", { message: err?.message });
  }
}

module.exports = { consume, reset };
