const { NextResponse } = require('next/server')
const logger = require('../utils/logger')

const SAFE_5XX_MESSAGE = 'Erro interno do servidor'

function json(data, status = 200) {
  return NextResponse.json(data, { status })
}

function success(data, message = 'OK', meta = null) {
  // JSON.stringify omite propriedades `undefined`; o cliente sempre precisa poder ler `data`.
  const payload = { success: true, message, data: data === undefined ? null : data }
  if (meta) payload.meta = meta
  return json(payload)
}

function created(data, message = 'Criado com sucesso') {
  return json({ success: true, message, data: data === undefined ? null : data }, 201)
}

function noContent() {
  return new NextResponse(null, { status: 204 })
}

function handleError(error, context = {}) {
  const statusCode = error?.statusCode || 500
  const isServerError = statusCode >= 500
  const message = isServerError ? SAFE_5XX_MESSAGE : error?.message || SAFE_5XX_MESSAGE

  const payload = { success: false, error: { message } }

  /* Detalhes de validação (400) devem aparecer também em produção — não expõem segredos. */
  if (error?.details) {
    payload.error.details = error.details
  }

  if (isServerError) {
    logger.error('request_error', {
      requestId: context.requestId,
      message: error?.message,
      stack: error?.stack,
      statusCode
    })
  } else if (statusCode === 429) {
    logger.warn?.('request_rate_limited', {
      requestId: context.requestId,
      message: error?.message
    })
  }

  const response = json(payload, statusCode)
  if (context.requestId) {
    response.headers.set('x-request-id', context.requestId)
  }
  return response
}

function generateRequestId() {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID()
  }
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

async function run(handler) {
  const requestId = generateRequestId()
  try {
    const response = await handler({ requestId })
    if (response && typeof response.headers?.set === 'function') {
      response.headers.set('x-request-id', requestId)
    }
    return response
  } catch (error) {
    return handleError(error, { requestId })
  }
}

module.exports = {
  created,
  generateRequestId,
  handleError,
  json,
  noContent,
  run,
  success
}
