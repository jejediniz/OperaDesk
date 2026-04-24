export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { validateEnv } = require('./src/server/config/env')
    validateEnv()
  }
}
