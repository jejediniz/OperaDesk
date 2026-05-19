const authService = require("../../../../src/server/services/authService");
const userService = require("../../../../src/server/services/userService");
const { changeOwnPasswordSchema } = require("../../../../src/server/validators/userSchemas");
const {
  authenticate,
  readBody,
  run,
  success,
  validate
} = require("../../../../src/server/http/nextApi");

export async function GET(request) {
  return run(async () => {
    const user = authenticate(request);
    const usuario = await authService.getSessaoAtual(user.id);
    return success(usuario, "Acesso autorizado");
  });
}

export async function PATCH(request) {
  return run(async () => {
    const user = authenticate(request);
    const body = validate(changeOwnPasswordSchema, await readBody(request));

    await userService.changeOwnPassword(user.id, {
      senhaAtual: body.senhaAtual,
      senhaNova: body.senhaNova
    });

    return success(null, "Senha atualizada com sucesso");
  });
}
