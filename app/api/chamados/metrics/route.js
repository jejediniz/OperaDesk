const chamadosService = require("../../../../src/server/services/chamadosService");
const { authenticate, run, success } = require("../../../../src/server/http/nextApi");

export const dynamic = "force-dynamic";

export async function GET(request) {
  return run(async () => {
    const user = authenticate(request);
    const metrics = await chamadosService.getMetrics(user);
    return success(metrics, "Métricas calculadas com sucesso");
  });
}
