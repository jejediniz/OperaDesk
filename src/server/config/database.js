const { Pool } = require("pg");
const { getEnv } = require("./env");
const logger = require("../utils/logger");

const globalForPg = globalThis;

function createPool() {
  const { db } = getEnv();

  return new Pool({
    host: db.host,
    port: db.port,
    user: db.user,
    password: db.password,
    database: db.database,
    max: db.poolMax,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000
  });
}

const pool = globalForPg.__operadeskPgPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalForPg.__operadeskPgPool = pool;
}

pool.on("error", (err) => {
  logger.error("pg_pool_error", { error: err?.message, code: err?.code });
});

module.exports = pool;
