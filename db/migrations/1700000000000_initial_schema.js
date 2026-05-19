exports.up = (pgm) => {
  pgm.createTable('usuarios', {
    id: 'id',
    nome: { type: 'varchar(120)', notNull: true },
    email: { type: 'varchar(160)', notNull: true, unique: true },
    senha_hash: { type: 'varchar(255)', notNull: true },
    tipo: { type: 'varchar(10)', notNull: true, default: 'comum' },
    admin: { type: 'boolean', notNull: true, default: false },
    ativo: { type: 'boolean', notNull: true, default: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') }
  })

  pgm.createTable('chamados', {
    id: 'id',
    titulo: { type: 'varchar(200)', notNull: true },
    descricao: { type: 'text', notNull: true },
    status: { type: 'varchar(20)', notNull: true, default: 'aberto' },
    prioridade: { type: 'varchar(20)', notNull: true, default: 'media' },
    setor: { type: 'varchar(120)' },
    usuario_id: {
      type: 'integer',
      notNull: true,
      references: '"usuarios"',
      onDelete: 'CASCADE'
    },
    tecnico_id: {
      type: 'integer',
      references: '"usuarios"'
    },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') }
  })

  pgm.createTable('chamado_interacoes', {
    id: 'id',
    chamado_id: {
      type: 'integer',
      notNull: true,
      references: '"chamados"',
      onDelete: 'CASCADE'
    },
    autor_id: {
      type: 'integer',
      notNull: true,
      references: '"usuarios"',
      onDelete: 'CASCADE'
    },
    mensagem: { type: 'text', notNull: true },
    tipo: { type: 'varchar(20)', notNull: true, default: 'publica' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') }
  })

  pgm.createIndex('usuarios', 'email', { name: 'idx_usuarios_email', ifNotExists: true })
  pgm.createIndex('chamados', 'usuario_id', { name: 'idx_chamados_usuario_id', ifNotExists: true })
  pgm.createIndex('chamados', 'tecnico_id', { name: 'idx_chamados_tecnico_id', ifNotExists: true })
  pgm.createIndex('chamados', 'status', { name: 'idx_chamados_status', ifNotExists: true })
  pgm.createIndex('chamados', 'prioridade', { name: 'idx_chamados_prioridade', ifNotExists: true })
  pgm.createIndex('chamados', ['status', 'prioridade'], {
    name: 'idx_chamados_status_prioridade',
    ifNotExists: true
  })
  pgm.createIndex('chamados', [{ name: 'created_at', sort: 'DESC' }], {
    name: 'idx_chamados_created_at',
    ifNotExists: true
  })
  pgm.createIndex('chamado_interacoes', ['chamado_id', 'created_at'], {
    name: 'idx_chamado_interacoes_chamado',
    ifNotExists: true
  })

  pgm.createFunction(
    'set_updated_at',
    [],
    { returns: 'trigger', language: 'plpgsql', replace: true },
    `
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    `
  )

  pgm.createTrigger('usuarios', 'trg_usuarios_updated_at', {
    when: 'BEFORE',
    operation: 'UPDATE',
    level: 'ROW',
    function: 'set_updated_at'
  })

  pgm.createTrigger('chamados', 'trg_chamados_updated_at', {
    when: 'BEFORE',
    operation: 'UPDATE',
    level: 'ROW',
    function: 'set_updated_at'
  })
}

exports.down = (pgm) => {
  pgm.dropTrigger('chamados', 'trg_chamados_updated_at', { ifExists: true })
  pgm.dropTrigger('usuarios', 'trg_usuarios_updated_at', { ifExists: true })
  pgm.dropFunction('set_updated_at', [], { ifExists: true })
  pgm.dropTable('chamado_interacoes', { ifExists: true })
  pgm.dropTable('chamados', { ifExists: true })
  pgm.dropTable('usuarios', { ifExists: true })
}
