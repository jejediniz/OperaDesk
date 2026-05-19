const authService = require("../../../../src/server/services/authService");
const auditService = require("../../../../src/server/services/auditService");
const { loginSchema } = require("../../../../src/server/validators/authSchemas");
const rateLimit = require("../../../../src/server/utils/rateLimit");
const AppError = require("../../../../src/server/utils/AppError");
const {
  getClientIp,
  readBody,
  run,
  setAuthCookie,
  success,
  validate
} = require("../../../../src/server/http/nextApi");

export async function POST(request) {
  return run(async ({ requestId }) => {
    const ip = getClientIp(request);
    const body = validate(loginSchema, await readBody(request));

    const ipKey = `login:ip:${ip}`;
    const emailKey = `login:email:${body.email.toLowerCase()}`;

    const [ipCheck, emailCheck] = await Promise.all([
      rateLimit.consume(ipKey, { max: 20, windowMs: 60_000 }),
      rateLimit.consume(emailKey, { max: 5, windowMs: 60_000 })
    ]);

    if (!ipCheck.allowed || !emailCheck.allowed) {
      const retryMs = Math.max(ipCheck.retryAfterMs, emailCheck.retryAfterMs);
      await auditService.record({
        action: "auth.login.rate_limited",
        ip,
        requestId,
        metadata: { email: body.email }
      });
      throw new AppError(
        `Muitas tentativas de login. Tente novamente em ${Math.ceil(retryMs / 1000)}s`,
        429
      );
    }

    try {
      const { token, usuario } = await authService.login(body);

      await rateLimit.reset(emailKey);

      await auditService.record({
        action: "auth.login.sucesso",
        actorId: usuario.id,
        ip,
        requestId,
        targetType: "usuario",
        targetId: usuario.id
      });

      const response = success(usuario, "Login realizado com sucesso");
      setAuthCookie(response, token);
      return response;
    } catch (error) {
      await auditService.record({
        action: "auth.login.falha",
        ip,
        requestId,
        metadata: { email: body.email }
      });
      throw error;
    }
  });
}
