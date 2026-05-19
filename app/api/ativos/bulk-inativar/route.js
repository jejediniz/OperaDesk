const ativosService = require("../../../../src/server/services/ativosService");
const { bulkInativarAtivosSchema } = require("../../../../src/server/validators/ativosSchemas");
const {
  authenticate,
  readBody,
  requireTiOuAdmin,
  run,
  success,
  validate
} = require("../../../../src/server/http/nextApi");

export async function POST(request) {
  return run(async () => {
    const user = authenticate(request);
    requireTiOuAdmin(user);
    const body = validate(bulkInativarAtivosSchema, await readBody(request));
    const resultado = await ativosService.inativarAtivosEmMassa(body.ids);
    return success(resultado, "Inativação em massa concluída");
  });
}
