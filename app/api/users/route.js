const userService = require("../../../src/server/services/userService");
const { createUserSchema } = require("../../../src/server/validators/userSchemas");
const {
  authenticate,
  created,
  readBody,
  requireAdmin,
  run,
  success,
  validate
} = require("../../../src/server/http/nextApi");

export async function GET(request) {
  return run(async () => {
    const user = authenticate(request);
    requireAdmin(user);
    const usuarios = await userService.list();
    return success(usuarios, "Usuários listados com sucesso");
  });
}

export async function POST(request) {
  return run(async () => {
    const user = authenticate(request);
    requireAdmin(user);
    const body = validate(createUserSchema, await readBody(request));
    const usuario = await userService.create(body);
    return created(usuario, "Usuário criado com sucesso");
  });
}
