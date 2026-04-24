import { describe, it, expect, beforeEach } from 'vitest'

const rateLimit = require('../../src/server/utils/rateLimit')

describe('rateLimit.consume', () => {
  beforeEach(() => {
    rateLimit.reset('k')
  })

  it('permite requisições até o limite', () => {
    for (let i = 0; i < 3; i += 1) {
      const r = rateLimit.consume('k', { max: 3, windowMs: 1000 })
      expect(r.allowed).toBe(true)
    }
  })

  it('bloqueia quando excede e expõe retryAfterMs', () => {
    for (let i = 0; i < 3; i += 1) {
      rateLimit.consume('k', { max: 3, windowMs: 1000 })
    }

    const r = rateLimit.consume('k', { max: 3, windowMs: 1000 })
    expect(r.allowed).toBe(false)
    expect(r.retryAfterMs).toBeGreaterThan(0)
  })

  it('reseta via função reset()', () => {
    for (let i = 0; i < 3; i += 1) {
      rateLimit.consume('k', { max: 3, windowMs: 1000 })
    }
    rateLimit.reset('k')
    const r = rateLimit.consume('k', { max: 3, windowMs: 1000 })
    expect(r.allowed).toBe(true)
  })
})
