const ativosService = require("../../../src/server/services/ativosService");
const {
  createAtivoSchema,
  listAtivosQuerySchema
} = require("../../../src/server/validators/ativosSchemas");
const {
  authenticate,
  created,
  queryObject,
  readBody,
  requireTiOuAdmin,
  run,
  success,
  validate
} = require("../../../src/server/http/nextApi");
const { coerceAtivosListQuery } = require("../../../src/server/http/coerceAtivosListQuery");

export async function GET(request) {
  return run(async () => {
    const user = authenticate(request);
    requireTiOuAdmin(user);
    const filtros = validate(listAtivosQuerySchema, coerceAtivosListQuery(queryObject(request)));
    const result = await ativosService.listarAtivos(filtros);

    return success(result.items, "Ativos listados com sucesso", result.meta);
  });
}

export async function POST(request) {
  return run(async () => {
    const user = authenticate(request);
    requireTiOuAdmin(user);
    const body = validate(createAtivoSchema, await readBody(request));
    const ativo = await ativosService.criarAtivo(body);

    return created(ativo, "Ativo criado com sucesso");
  });
}
