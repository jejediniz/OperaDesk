import { describe, expect, it } from "vitest";

const {
  bulkInativarAtivosSchema,
  createAtivoSchema,
  listAtivosQuerySchema,
  updateAtivoSchema,
  uuidParamSchema
} = require("../../../src/server/validators/ativosSchemas");

const uuid = "123e4567-e89b-12d3-a456-426614174000";

describe("ativosSchemas", () => {
  it("createAtivoSchema exige nome, patrimônio e status", () => {
    const { error } = createAtivoSchema.validate({});
    expect(error).toBeDefined();
  });

  it("createAtivoSchema aceita payload mínimo válido", () => {
    const { error, value } = createAtivoSchema.validate({
      nome: "Notebook Dell",
      numeroPatrimonio: "PAT-001",
      status: "disponivel"
    });

    expect(error).toBeUndefined();
    expect(value.nome).toBe("Notebook Dell");
    expect(value.numeroPatrimonio).toBe("PAT-001");
  });

  it("updateAtivoSchema exige ao menos um campo", () => {
    const { error } = updateAtivoSchema.validate({});
    expect(error).toBeDefined();
  });

  it("updateAtivoSchema permite limpar campos opcionais com string vazia ou null", () => {
    const { error, value } = updateAtivoSchema.validate({
      numeroSerie: "",
      responsavel: null
    });

    expect(error).toBeUndefined();
    expect(value.numeroSerie).toBe("");
    expect(value.responsavel).toBeNull();
  });

  it("listAtivosQuerySchema aplica defaults de paginação e ordenação", () => {
    const { error, value } = listAtivosQuerySchema.validate({});

    expect(error).toBeUndefined();
    expect(value.page).toBe(1);
    expect(value.limit).toBe(50);
    expect(value.ordenar).toBe("atualizadoEm");
    expect(value.ordem).toBe("desc");
  });

  it("listAtivosQuerySchema rejeita status inválido", () => {
    const { error } = listAtivosQuerySchema.validate({ status: "em_estoque" });
    expect(error).toBeDefined();
  });

  it("uuidParamSchema valida id como UUID", () => {
    expect(uuidParamSchema.validate({ id: uuid }).error).toBeUndefined();
    expect(uuidParamSchema.validate({ id: "123" }).error).toBeDefined();
  });

  it("bulkInativarAtivosSchema limita ids a UUIDs válidos", () => {
    expect(bulkInativarAtivosSchema.validate({ ids: [uuid] }).error).toBeUndefined();
    expect(bulkInativarAtivosSchema.validate({ ids: ["123"] }).error).toBeDefined();
    expect(bulkInativarAtivosSchema.validate({ ids: [] }).error).toBeDefined();
  });
});
