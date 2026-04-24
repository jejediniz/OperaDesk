const authService = require('../../../../src/server/services/authService')
const { loginSchema } = require('../../../../src/server/validators/authSchemas')
const rateLimit = require('../../../../src/server/utils/rateLimit')
const AppError = require('../../../../src/server/utils/AppError')
const logger = require('../../../../src/server/utils/logger')
const {
  getClientIp,
  readBody,
  run,
  setAuthCookie,
  success,
  validate
} = require('../../../../src/server/nextApi')

export async function POST(request) {
  return run(async () => {
    const ip = getClientIp(request)
    const body = validate(loginSchema, await readBody(request))

    const ipKey = `login:ip:${ip}`
    const emailKey = `login:email:${body.email.toLowerCase()}`

    const ipCheck = rateLimit.consume(ipKey, { max: 20, windowMs: 60_000 })
    const emailCheck = rateLimit.consume(emailKey, { max: 5, windowMs: 60_000 })

    if (!ipCheck.allowed || !emailCheck.allowed) {
      const retryMs = Math.max(ipCheck.retryAfterMs, emailCheck.retryAfterMs)
      logger.audit('auth.login.rate_limited', { ip, email: body.email })
      throw new AppError(
        `Muitas tentativas de login. Tente novamente em ${Math.ceil(retryMs / 1000)}s`,
        429
      )
    }

    const { token, usuario } = await authService.login(body)

    rateLimit.reset(emailKey)

    logger.audit('auth.login.sucesso', { usuarioId: usuario.id, ip })

    const response = success(usuario, 'Login realizado com sucesso')
    setAuthCookie(response, token)
    return response
  })
}
