const pool = require("../config/database");

async function record({ action, actorId, targetType, targetId, requestId, ip, metadata }) {
  await pool.query(
    `INSERT INTO audit_log (action, actor_id, target_type, target_id, request_id, ip, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      action,
      actorId ?? null,
      targetType ?? null,
      targetId ?? null,
      requestId ?? null,
      ip ?? null,
      metadata ? JSON.stringify(metadata) : null
    ]
  );
}

async function listRecent({ limit = 50, action, actorId } = {}) {
  const values = [];
  const conditions = [];

  if (action) {
    values.push(action);
    conditions.push(`action = $${values.length}`);
  }
  if (actorId) {
    values.push(actorId);
    conditions.push(`actor_id = $${values.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  values.push(limit);

  const { rows } = await pool.query(
    `SELECT id, action, actor_id, target_type, target_id, request_id, ip, metadata, created_at
     FROM audit_log
     ${where}
     ORDER BY id DESC
     LIMIT $${values.length}`,
    values
  );

  return rows;
}

module.exports = {
  listRecent,
  record
};
