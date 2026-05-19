import { describe, it, expect, beforeEach, vi } from "vitest";

const rateLimit = require("../../src/server/utils/rateLimit");

beforeEach(async () => {
  await rateLimit.reset("chave-teste");
  vi.useRealTimers();
});

describe("rateLimit", () => {
  it("permite até max requisições e bloqueia depois", async () => {
    const opts = { max: 3, windowMs: 1000 };
    expect((await rateLimit.consume("chave-teste", opts)).allowed).toBe(true);
    expect((await rateLimit.consume("chave-teste", opts)).allowed).toBe(true);
    expect((await rateLimit.consume("chave-teste", opts)).allowed).toBe(true);
    const fourth = await rateLimit.consume("chave-teste", opts);
    expect(fourth.allowed).toBe(false);
    expect(fourth.retryAfterMs).toBeGreaterThan(0);
  });

  it("reset limpa o bucket", async () => {
    const opts = { max: 1, windowMs: 60_000 };
    await rateLimit.consume("chave-teste", opts);
    expect((await rateLimit.consume("chave-teste", opts)).allowed).toBe(false);
    await rateLimit.reset("chave-teste");
    expect((await rateLimit.consume("chave-teste", opts)).allowed).toBe(true);
  });

  it("libera após a janela expirar", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1, 12, 0, 0));
    const opts = { max: 1, windowMs: 1000 };
    expect((await rateLimit.consume("chave-teste", opts)).allowed).toBe(true);
    expect((await rateLimit.consume("chave-teste", opts)).allowed).toBe(false);
    vi.advanceTimersByTime(1500);
    expect((await rateLimit.consume("chave-teste", opts)).allowed).toBe(true);
  });
});
