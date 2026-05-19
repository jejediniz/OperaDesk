import { describe, it, expect } from "vitest";

const {
  createChamadoSchema,
  updateChamadoSchema,
  listChamadosQuerySchema
} = require("../../../src/server/validators/chamadosSchemas");

describe("chamadosSchemas", () => {
  it("createChamadoSchema exige titulo e descricao", () => {
    const { error } = createChamadoSchema.validate({});
    expect(error).toBeDefined();
  });

  it("createChamadoSchema aceita payload mínimo", () => {
    const { error, value } = createChamadoSchema.validate({
      titulo: "Impressora travada",
      descricao: "A impressora do RH parou de imprimir"
    });
    expect(error).toBeUndefined();
    expect(value.titulo).toBe("Impressora travada");
  });

  it("updateChamadoSchema exige ao menos um campo", () => {
    const { error } = updateChamadoSchema.validate({});
    expect(error).toBeDefined();
  });

  it("updateChamadoSchema permite tecnicoId nulo (desatribuir)", () => {
    const { error, value } = updateChamadoSchema.validate({ tecnicoId: null });
    expect(error).toBeUndefined();
    expect(value.tecnicoId).toBeNull();
  });

  it('listChamadosQuerySchema aceita "me" e "sem" para tecnicoId', () => {
    const me = listChamadosQuerySchema.validate({ tecnicoId: "me" });
    const sem = listChamadosQuerySchema.validate({ tecnicoId: "sem" });
    const id = listChamadosQuerySchema.validate({ tecnicoId: 7 });
    expect(me.error).toBeUndefined();
    expect(sem.error).toBeUndefined();
    expect(id.error).toBeUndefined();
  });

  it("listChamadosQuerySchema rejeita tecnicoId inválido", () => {
    const { error } = listChamadosQuerySchema.validate({ tecnicoId: "xyz" });
    expect(error).toBeDefined();
  });

  it("listChamadosQuerySchema aceita q para busca textual", () => {
    const { error, value } = listChamadosQuerySchema.validate({ q: "impressora" });
    expect(error).toBeUndefined();
    expect(value.q).toBe("impressora");
  });

  it("listChamadosQuerySchema aplica defaults de page/limit", () => {
    const { value } = listChamadosQuerySchema.validate({});
    expect(value.page).toBe(1);
    expect(value.limit).toBe(20);
  });
});
