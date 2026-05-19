import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const logger = require("../../src/server/utils/logger");

let consoleInfoSpy;
let consoleErrorSpy;
let consoleWarnSpy;

beforeEach(() => {
  consoleInfoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
  consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  process.env.LOG_LEVEL = "debug";
});

afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.LOG_LEVEL;
});

describe("logger", () => {
  it("redige campos sensíveis (senha, token)", () => {
    logger.info("login_attempt", {
      email: "foo@bar.com",
      senha: "super-secreto",
      token: "jwt.value.here"
    });

    expect(consoleInfoSpy).toHaveBeenCalledOnce();
    const payload = JSON.parse(consoleInfoSpy.mock.calls[0][0]);
    expect(payload.email).toBe("foo@bar.com");
    expect(payload.senha).toBe("[REDACTED]");
    expect(payload.token).toBe("[REDACTED]");
  });

  it("redige recursivamente objetos aninhados", () => {
    logger.info("event", { user: { senha: "x", name: "João" } });
    const payload = JSON.parse(consoleInfoSpy.mock.calls[0][0]);
    expect(payload.user.senha).toBe("[REDACTED]");
    expect(payload.user.name).toBe("João");
  });

  it("respeita nível mínimo via LOG_LEVEL", () => {
    process.env.LOG_LEVEL = "warn";
    logger.info("skip me");
    logger.warn("keep me");
    expect(consoleInfoSpy).not.toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalledOnce();
  });

  it("audit emite no nível info com action", () => {
    logger.audit("user.login", { actorId: 1 });
    const payload = JSON.parse(consoleInfoSpy.mock.calls[0][0]);
    expect(payload.message).toBe("audit");
    expect(payload.action).toBe("user.login");
    expect(payload.actorId).toBe(1);
  });

  it("logger.error usa console.error", () => {
    logger.error("boom", { code: "X" });
    expect(consoleErrorSpy).toHaveBeenCalledOnce();
  });
});
