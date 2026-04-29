const AppError = require('../utils/AppError')

async function readBody(request) {
  try {
    return await request.json()
  } catch {
    return {}
  }
}

function validate(schema, value) {
  const { error, value: validated } = schema.validate(value, {
    abortEarly: false,
    stripUnknown: true
  })

  if (error) {
    const details = error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message
    }))

    throw new AppError('Dados inválidos', 400, details)
  }

  return validated
}

function queryObject(request) {
  return Object.fromEntries(request.nextUrl.searchParams.entries())
}

async function routeParams(context) {
  if (!context?.params) return {}
  const raw = context.params
  return typeof raw?.then === 'function' ? await raw : raw
}

function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return request.headers.get('x-real-ip') || 'unknown'
}

module.exports = {
  getClientIp,
  queryObject,
  readBody,
  routeParams,
  validate
}
