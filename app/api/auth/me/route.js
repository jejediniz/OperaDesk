const authService = require("../../../../src/server/services/authService");
const { authenticate, run, success } = require("../../../../src/server/http/nextApi");

export async function GET(request) {
  return run(async () => {
    const user = authenticate(request);
    const usuario = await authService.getSessaoAtual(user.id);
    return success(usuario, "Sessão autenticada");
  });
}
