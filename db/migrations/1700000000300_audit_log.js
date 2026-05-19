exports.up = (pgm) => {
  pgm.createTable('audit_log', {
    id: 'id',
    action: { type: 'varchar(80)', notNull: true },
    actor_id: {
      type: 'integer',
      references: '"usuarios"',
      onDelete: 'SET NULL'
    },
    target_type: { type: 'varchar(40)' },
    target_id: { type: 'integer' },
    request_id: { type: 'varchar(64)' },
    ip: { type: 'varchar(64)' },
    metadata: { type: 'jsonb' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') }
  })

  pgm.createIndex('audit_log', 'action', { name: 'idx_audit_log_action' })
  pgm.createIndex('audit_log', 'actor_id', { name: 'idx_audit_log_actor' })
  pgm.createIndex('audit_log', ['target_type', 'target_id'], {
    name: 'idx_audit_log_target'
  })
  pgm.createIndex('audit_log', [{ name: 'created_at', sort: 'DESC' }], {
    name: 'idx_audit_log_created_at'
  })
}

exports.down = (pgm) => {
  pgm.dropTable('audit_log', { ifExists: true })
}
