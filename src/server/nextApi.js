const jwt = require('jsonwebtoken')
const { NextResponse } = require('next/server')

const AppError = require('./utils/AppError')
const logger = require('./utils/logger')
const { getEnv } = require('./config/env')

function json(data, status = 200) {
  return NextResponse.json(data, { status })
}

function success(data, message = 'OK', meta = null) {
  const payload = { success: true, message, data }
  if (meta) payload.meta = meta
  return json(payload)
}

function created(data, message = 'Criado com sucesso') {
  return json({ success: true, message, data }, 201)
}

function noContent() {
  return new NextResponse(null, { status: 204 })
}

function handleError(error) {
  const statusCode = error.statusCode || 500
  const message = statusCode >= 500 ? 'Erro interno do servidor' : error.message
  const payload = { success: false, error: { message } }

  if (error.details && process.env.NODE_ENV !== 'production') {
    payload.error.details = error.details
  }

  if (statusCode >= 500) {
    logger.error('request_error', {
      message: error.message,
      stack: error.stack,
      statusCode
    })
  }

  return json(payload, statusCode)
}

async function run(handler) {
  try {
    return await handler()
  } catch (error) {
    return handleError(error)
  }
}

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
  return Promise.resolve(context?.params || {})
}

function getTokenFromRequest(request) {
  const env = getEnv()
  const cookieToken = request.cookies?.get?.(env.cookieName)?.value

  if (cookieToken) {
    return cookieToken
  }

  const authHeader = request.headers.get('authorization')

  if (!authHeader) return null

  const [scheme, token] = authHeader.split(' ')
  return scheme === 'Bearer' && token ? token : null
}

function authenticate(request) {
  const token = getTokenFromRequest(request)

  if (!token) {
    throw new AppError('Não autenticado', 401)
  }

  try {
    const decoded = jwt.verify(token, getEnv().jwtSecret)

    if (!decoded.id) {
      throw new AppError('Token inválido', 401)
    }

    return {
      id: decoded.id,
      tipo: decoded.tipo,
      admin: decoded.admin
    }
  } catch (error) {
    if (error instanceof AppError) throw error
    throw new AppError('Sessão expirada ou inválida', 401)
  }
}

function requireAdmin(user) {
  if (!user || user.admin !== true) {
    throw new AppError('Acesso permitido apenas para administradores', 403)
  }
}

function requireTiOuAdmin(user) {
  if (!user) {
    throw new AppError('Acesso não autorizado', 401)
  }

  if (user.tipo !== 'ti' && user.admin !== true) {
    throw new AppError('Acesso permitido apenas para técnicos ou administradores', 403)
  }
}

function authCookieOptions() {
  const env = getEnv()

  return {
    name: env.cookieName,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: env.cookieMaxAgeSeconds
  }
}

function setAuthCookie(response, token) {
  const options = authCookieOptions()
  response.cookies.set({ ...options, value: token })
  return response
}

function clearAuthCookie(response) {
  const env = getEnv()
  response.cookies.set({
    name: env.cookieName,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  })
  return response
}

function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  return request.headers.get('x-real-ip') || 'unknown'
}

module.exports = {
  authenticate,
  authCookieOptions,
  clearAuthCookie,
  created,
  getClientIp,
  getTokenFromRequest,
  noContent,
  queryObject,
  requireAdmin,
  requireTiOuAdmin,
  routeParams,
  run,
  readBody,
  setAuthCookie,
  success,
  validate
}
