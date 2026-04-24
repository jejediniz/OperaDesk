const REQUIRED_ENV = ['JWT_SECRET', 'DB_HOST', 'DB_USER', 'DB_NAME']

let cachedEnv = null

function isBuildPhase() {
  return process.env.NEXT_PHASE === 'phase-production-build'
}

function validateEnv() {
  if (isBuildPhase()) {
    return
  }

  const missing = REQUIRED_ENV.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(`Variáveis de ambiente ausentes: ${missing.join(', ')}`)
  }

  if (process.env.NODE_ENV === 'production') {
    const weakSecrets = new Set(['troque_essa_chave', 'change_me', 'secret', ''])

    if (weakSecrets.has(process.env.JWT_SECRET) || process.env.JWT_SECRET.length < 32) {
      throw new Error(
        'JWT_SECRET inseguro: use um valor aleatório de pelo menos 32 caracteres em produção'
      )
    }
  }
}

function getEnv() {
  if (isBuildPhase()) {
    return {
      nodeEnv: 'production',
      jwtSecret: '__build_phase_placeholder__',
      jwtExpiresIn: '8h',
      cookieName: process.env.AUTH_COOKIE_NAME || 'operadesk_session',
      cookieMaxAgeSeconds: Number(process.env.AUTH_COOKIE_MAX_AGE) || 60 * 60 * 8,
      db: {
        host: 'localhost',
        port: 5432,
        user: 'build',
        password: '',
        database: 'build'
      }
    }
  }

  if (cachedEnv) {
    return cachedEnv
  }

  validateEnv()

  cachedEnv = {
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
    cookieName: process.env.AUTH_COOKIE_NAME || 'operadesk_session',
    cookieMaxAgeSeconds: Number(process.env.AUTH_COOKIE_MAX_AGE) || 60 * 60 * 8,
    db: {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    }
  }

  return cachedEnv
}

module.exports = {
  validateEnv,
  getEnv
}
