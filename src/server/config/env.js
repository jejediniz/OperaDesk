const REQUIRED_ENV = ["JWT_SECRET", "DB_HOST", "DB_USER", "DB_NAME"];

const WEAK_SECRETS = new Set([
  "",
  "change_me",
  "changeme",
  "secret",
  "password",
  "troque_essa_chave",
  "troque_essa_chave_em_dev_use_segredo_de_48_bytes_em_prod"
]);

const DEFAULT_BCRYPT_ROUNDS = 12;
const MIN_BCRYPT_ROUNDS_PROD = 12;
const MIN_JWT_SECRET_LENGTH = 32;

let cachedEnv = null;
let weakSecretWarned = false;

function isBuildPhase() {
  return process.env.NEXT_PHASE === "phase-production-build";
}

function isProd() {
  return process.env.NODE_ENV === "production";
}

function parseInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function isWeakSecret(secret) {
  if (!secret) return true;
  if (WEAK_SECRETS.has(secret)) return true;
  if (secret.length < MIN_JWT_SECRET_LENGTH) return true;
  return false;
}

function validateEnv() {
  if (isBuildPhase()) return;

  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Variáveis de ambiente ausentes: ${missing.join(", ")}`);
  }

  const secret = process.env.JWT_SECRET;

  if (isProd()) {
    if (isWeakSecret(secret)) {
      throw new Error(
        `JWT_SECRET inseguro: use um valor aleatório de pelo menos ${MIN_JWT_SECRET_LENGTH} caracteres em produção`
      );
    }

    const rounds = parseInteger(process.env.BCRYPT_ROUNDS, DEFAULT_BCRYPT_ROUNDS);
    if (rounds < MIN_BCRYPT_ROUNDS_PROD) {
      throw new Error(
        `BCRYPT_ROUNDS inseguro: use no mínimo ${MIN_BCRYPT_ROUNDS_PROD} em produção (atual: ${rounds})`
      );
    }
  } else if (!weakSecretWarned && isWeakSecret(secret)) {
    weakSecretWarned = true;
    console.warn(
      `[operadesk] JWT_SECRET fraco detectado. Em produção isso é bloqueado. Gere um valor com: openssl rand -base64 48`
    );
  }
}

function getEnv() {
  if (isBuildPhase()) {
    return {
      nodeEnv: "production",
      jwtSecret: "__build_phase_placeholder__",
      jwtExpiresIn: "8h",
      cookieName: process.env.AUTH_COOKIE_NAME || "operadesk_session",
      cookieMaxAgeSeconds: parseInteger(process.env.AUTH_COOKIE_MAX_AGE, 60 * 60 * 8),
      bcryptRounds: DEFAULT_BCRYPT_ROUNDS,
      db: {
        host: "localhost",
        port: 5432,
        user: "build",
        password: "",
        database: "build"
      }
    };
  }

  if (cachedEnv) return cachedEnv;

  validateEnv();

  cachedEnv = {
    nodeEnv: process.env.NODE_ENV || "development",
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "8h",
    cookieName: process.env.AUTH_COOKIE_NAME || "operadesk_session",
    cookieMaxAgeSeconds: parseInteger(process.env.AUTH_COOKIE_MAX_AGE, 60 * 60 * 8),
    bcryptRounds: parseInteger(process.env.BCRYPT_ROUNDS, DEFAULT_BCRYPT_ROUNDS),
    db: {
      host: process.env.DB_HOST,
      port: parseInteger(process.env.DB_PORT, 5432),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      poolMax: parseInteger(process.env.DB_POOL_MAX, 10)
    }
  };

  return cachedEnv;
}

module.exports = {
  DEFAULT_BCRYPT_ROUNDS,
  MIN_JWT_SECRET_LENGTH,
  getEnv,
  isWeakSecret,
  validateEnv
};
