const chamadosService = require("../../../src/server/services/chamadosService");
const {
  createChamadoSchema,
  listChamadosQuerySchema
} = require("../../../src/server/validators/chamadosSchemas");
const {
  authenticate,
  created,
  queryObject,
  readBody,
  run,
  success,
  validate
} = require("../../../src/server/http/nextApi");

export async function GET(request) {
  return run(async () => {
    const user = authenticate(request);
    const listarTodos = user.tipo === "ti" || user.admin === true;
    const filtros = validate(listChamadosQuerySchema, queryObject(request));
    const { items, meta } = await chamadosService.list(user.id, {
      listarTodos,
      filtros
    });

    return success(items, "Chamados listados com sucesso", meta);
  });
}

export async function POST(request) {
  return run(async () => {
    const user = authenticate(request);
    const body = validate(createChamadoSchema, await readBody(request));
    const chamado = await chamadosService.create(body, user.id);
    return created(chamado, "Chamado criado com sucesso");
  });
}
