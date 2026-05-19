const AppError = require("../../../../src/server/utils/AppError");
const ativosService = require("../../../../src/server/services/ativosService");
const {
  updateAtivoSchema,
  uuidParamSchema
} = require("../../../../src/server/validators/ativosSchemas");
const {
  authenticate,
  readBody,
  requireTiOuAdmin,
  routeParams,
  run,
  success,
  validate
} = require("../../../../src/server/http/nextApi");

async function resolverId(context) {
  const params = await routeParams(context);
  const { id } = validate(uuidParamSchema, params);
  return id;
}

export async function GET(request, context) {
  return run(async () => {
    const user = authenticate(request);
    requireTiOuAdmin(user);
    const id = await resolverId(context);
    const ativo = await ativosService.buscarAtivoCompletoPorId(id);
    if (!ativo) throw new AppError("Ativo não encontrado", 404);
    return success(ativo, "Ativo encontrado");
  });
}

export async function PUT(request, context) {
  return run(async () => {
    const user = authenticate(request);
    requireTiOuAdmin(user);
    const id = await resolverId(context);
    const body = validate(updateAtivoSchema, await readBody(request));
    const ativo = await ativosService.atualizarAtivo(id, body);
    return success(ativo, "Ativo atualizado com sucesso");
  });
}

export async function DELETE(request, context) {
  return run(async () => {
    const user = authenticate(request);
    requireTiOuAdmin(user);
    const id = await resolverId(context);
    const ativo = await ativosService.inativarAtivo(id);
    return success(ativo, "Ativo inativado com sucesso");
  });
}
