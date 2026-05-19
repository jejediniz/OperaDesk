import { describe, it, expect } from "vitest";

const { success, created, noContent, run } = require("../../../src/server/http/response");
const AppError = require("../../../src/server/utils/AppError");

async function readJson(response) {
  return JSON.parse(await response.text());
}

describe("http/response", () => {
  it("success retorna envelope padrão com data e meta", async () => {
    const response = success({ ok: 1 }, "tudo certo", { page: 1 });
    expect(response.status).toBe(200);
    const body = await readJson(response);
    expect(body).toEqual({
      success: true,
      message: "tudo certo",
      data: { ok: 1 },
      meta: { page: 1 }
    });
  });

  it("created retorna 201", async () => {
    const response = created({ id: 1 });
    expect(response.status).toBe(201);
  });

  it("noContent retorna 204 sem body", () => {
    const response = noContent();
    expect(response.status).toBe(204);
  });

  it("run captura AppError e produz envelope de erro 4xx", async () => {
    const response = await run(async () => {
      throw new AppError("Não autorizado", 401);
    });
    expect(response.status).toBe(401);
    const body = await readJson(response);
    expect(body.success).toBe(false);
    expect(body.error.message).toBe("Não autorizado");
  });

  it("run mascara mensagens 5xx", async () => {
    const response = await run(async () => {
      throw new Error("coisa interna sensível");
    });
    expect(response.status).toBe(500);
    const body = await readJson(response);
    expect(body.error.message).toBe("Erro interno do servidor");
  });

  it("run injeta x-request-id na resposta de sucesso", async () => {
    const response = await run(async () => success({ ok: true }));
    expect(response.headers.get("x-request-id")).toBeTruthy();
  });
});
