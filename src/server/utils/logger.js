const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };

const SENSITIVE_KEYS = new Set([
  "password",
  "senha",
  "senha_hash",
  "token",
  "authorization",
  "cookie",
  "jwt",
  "jwtSecret"
]);

function getMinLevel() {
  const fromEnv = (process.env.LOG_LEVEL || "").toLowerCase();
  if (LEVELS[fromEnv] !== undefined) return LEVELS[fromEnv];
  return process.env.NODE_ENV === "production" ? LEVELS.info : LEVELS.debug;
}

function redact(value) {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [
        key,
        SENSITIVE_KEYS.has(key.toLowerCase()) ? "[REDACTED]" : redact(val)
      ])
    );
  }
  return value;
}

function emit(level, message, meta = {}) {
  if (LEVELS[level] < getMinLevel()) return;

  const payload = {
    level,
    message,
    ...redact(meta),
    timestamp: new Date().toISOString()
  };

  const serialized = JSON.stringify(payload);

  if (level === "error") {
    console.error(serialized);
  } else if (level === "warn") {
    console.warn(serialized);
  } else {
    console.info(serialized);
  }
}

function debug(message, meta) {
  emit("debug", message, meta);
}

function info(message, meta) {
  emit("info", message, meta);
}

function warn(message, meta) {
  emit("warn", message, meta);
}

function error(message, meta) {
  emit("error", message, meta);
}

function audit(action, meta = {}) {
  emit("info", "audit", { action, ...meta });
}

module.exports = {
  audit,
  debug,
  error,
  info,
  warn
};
