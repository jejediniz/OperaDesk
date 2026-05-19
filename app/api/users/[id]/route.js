const userService = require("../../../../src/server/services/userService");
const AppError = require("../../../../src/server/utils/AppError");
const { updateUserSchema } = require("../../../../src/server/validators/userSchemas");
const {
  authenticate,
  noContent,
  readBody,
  requireAdmin,
  routeParams,
  run,
  success,
  validate
} = require("../../../../src/server/http/nextApi");

export async function GET(request, context) {
  return run(async () => {
    const user = authenticate(request);
    requireAdmin(user);
    const { id } = await routeParams(context);
    const usuario = await userService.findById(id);

    if (!usuario) {
      throw new AppError("Usuário não encontrado", 404);
    }

    return success(usuario, "Usuário encontrado");
  });
}

export async function PUT(request, context) {
  return run(async () => {
    const user = authenticate(request);
    requireAdmin(user);
    const { id } = await routeParams(context);
    const body = validate(updateUserSchema, await readBody(request));
    const usuario = await userService.update(id, body);

    if (!usuario) {
      throw new AppError("Usuário não encontrado", 404);
    }

    return success(usuario, "Usuário atualizado com sucesso");
  });
}

export async function DELETE(request, context) {
  return run(async () => {
    const user = authenticate(request);
    requireAdmin(user);
    const { id } = await routeParams(context);
    const removido = await userService.remove(id);

    if (!removido) {
      throw new AppError("Usuário não encontrado", 404);
    }

    return noContent();
  });
}
