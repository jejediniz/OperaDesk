const authService = require("../../../../src/server/services/authService");
const { registerSchema } = require("../../../../src/server/validators/authSchemas");
const {
  authenticate,
  created,
  readBody,
  requireAdmin,
  run,
  validate
} = require("../../../../src/server/http/nextApi");

export async function POST(request) {
  return run(async () => {
    const user = authenticate(request);
    requireAdmin(user);
    const body = validate(registerSchema, await readBody(request));
    const resultado = await authService.registrar(body);
    return created(resultado, "Usuário registrado com sucesso");
  });
}
