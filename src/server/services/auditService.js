const auditRepository = require("../repositories/auditRepository");
const logger = require("../utils/logger");

const SHOULD_PERSIST = process.env.AUDIT_LOG_PERSIST !== "false";

async function record(event) {
  const { action, actorId, targetType, targetId, requestId, ip, metadata } = event;

  logger.audit(action, {
    actorId,
    targetType,
    targetId,
    requestId,
    ip,
    ...metadata
  });

  if (!SHOULD_PERSIST) return;

  try {
    await auditRepository.record({
      action,
      actorId,
      targetType,
      targetId,
      requestId,
      ip,
      metadata
    });
  } catch (error) {
    logger.error("audit_log_persist_failed", {
      action,
      requestId,
      message: error?.message
    });
  }
}

module.exports = {
  record
};
