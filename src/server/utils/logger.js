function log(level, message, meta = {}) {
  const payload = {
    level,
    message,
    ...meta,
    timestamp: new Date().toISOString()
  }

  if (level === 'error') {
    console.error(JSON.stringify(payload))
    return
  }

  console.log(JSON.stringify(payload))
}

function info(message, meta) {
  log('info', message, meta)
}

function error(message, meta) {
  log('error', message, meta)
}

function audit(action, meta = {}) {
  log('info', 'audit', {
    action,
    ...meta
  })
}

module.exports = {
  info,
  error,
  audit
}
