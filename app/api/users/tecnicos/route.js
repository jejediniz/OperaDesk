const userService = require("../../../../src/server/services/userService");
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
    const tecnicos = await userService.listTecnicos();
    return success(tecnicos, "Técnicos listados com sucesso");
  });
}
