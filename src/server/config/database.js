const { Pool } = require('pg')
const { getEnv } = require('./env')

const globalForPg = globalThis

function createPool() {
  const { db } = getEnv()

  return new Pool({
    host: db.host,
    port: db.port,
    user: db.user,
    password: db.password,
    database: db.database,
    max: Number(process.env.DB_POOL_MAX) || 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000
  })
}

const pool = globalForPg.__operadeskPgPool ?? createPool()

if (process.env.NODE_ENV !== 'production') {
  globalForPg.__operadeskPgPool = pool
}

pool.on('error', (err) => {
  console.error(JSON.stringify({
    level: 'error',
    message: 'pg_pool_error',
    error: err.message,
    timestamp: new Date().toISOString()
  }))
})

module.exports = pool
