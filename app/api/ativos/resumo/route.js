const ativosService = require("../../../../src/server/services/ativosService");
const {
  authenticate,
  requireTiOuAdmin,
  run,
  success
} = require("../../../../src/server/http/nextApi");

export async function GET(request) {
  return run(async () => {
    const user = authenticate(request);
    requireTiOuAdmin(user);
    const dados = await ativosService.calcularResumoAtivos();
    return success(dados, "Resumo dos ativos");
  });
}
