const chamadoInteracoesService = require("../../../../../src/server/services/chamadoInteracoesService");
const {
  createChamadoInteracaoSchema
} = require("../../../../../src/server/validators/chamadosSchemas");
const {
  authenticate,
  created,
  readBody,
  routeParams,
  run,
  success,
  validate
} = require("../../../../../src/server/http/nextApi");

export async function GET(request, context) {
  return run(async () => {
    const user = authenticate(request);
    const { id } = await routeParams(context);
    const interacoes = await chamadoInteracoesService.list(id, user);
    return success(interacoes, "Interações listadas com sucesso");
  });
}

export async function POST(request, context) {
  return run(async () => {
    const user = authenticate(request);
    const { id } = await routeParams(context);
    const body = validate(createChamadoInteracaoSchema, await readBody(request));
    const interacao = await chamadoInteracoesService.create(id, body, user);
    return created(interacao, "Interação criada com sucesso");
  });
}
