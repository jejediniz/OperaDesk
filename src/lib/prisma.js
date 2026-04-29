const { getEnv } = require('../server/config/env')

function resolveDatabaseUrl() {
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim()) {
    return process.env.DATABASE_URL.trim()
  }

  const { db } = getEnv()
  const password = encodeURIComponent(db.password ?? '')
  const user = encodeURIComponent(db.user ?? '')
  return `postgresql://${user}:${password}@${db.host}:${db.port}/${db.database}`
}

if (!process.env.DATABASE_URL?.trim()) {
  process.env.DATABASE_URL = resolveDatabaseUrl()
}

const { PrismaClient } = require('@prisma/client')

const globalForPrisma = globalThis

const prisma = globalForPrisma.__prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__prisma = prisma
}

module.exports = { prisma }
