exports.up = (pgm) => {
  // 1. Soltar a FK antiga de tecnico_id (sem ON DELETE) e recriar com SET NULL
  pgm.dropConstraint('chamados', 'chamados_tecnico_id_fkey', { ifExists: true })
  pgm.addConstraint('chamados', 'chamados_tecnico_id_fkey', {
    foreignKeys: {
      columns: 'tecnico_id',
      references: 'usuarios(id)',
      onDelete: 'SET NULL'
    }
  })

  // 2. CHECK constraints para domínios fechados
  pgm.addConstraint('chamados', 'chk_chamados_status', {
    check: "status IN ('aberto', 'em_andamento', 'concluido', 'fechado')"
  })
  pgm.addConstraint('chamados', 'chk_chamados_prioridade', {
    check: "prioridade IN ('baixa', 'media', 'alta')"
  })
  pgm.addConstraint('usuarios', 'chk_usuarios_tipo', {
    check: "tipo IN ('comum', 'ti')"
  })
  pgm.addConstraint('chamado_interacoes', 'chk_chamado_interacoes_tipo', {
    check: "tipo IN ('publica', 'interna')"
  })

  // 3. Busca textual eficiente (titulo + descricao). Requer extensão pg_trgm.
  pgm.createExtension('pg_trgm', { ifNotExists: true })

  pgm.sql(`
    CREATE INDEX IF NOT EXISTS idx_chamados_titulo_trgm
      ON chamados USING gin (titulo gin_trgm_ops);
  `)
  pgm.sql(`
    CREATE INDEX IF NOT EXISTS idx_chamados_descricao_trgm
      ON chamados USING gin (descricao gin_trgm_ops);
  `)
}

exports.down = (pgm) => {
  pgm.sql('DROP INDEX IF EXISTS idx_chamados_descricao_trgm')
  pgm.sql('DROP INDEX IF EXISTS idx_chamados_titulo_trgm')

  pgm.dropConstraint('chamado_interacoes', 'chk_chamado_interacoes_tipo', { ifExists: true })
  pgm.dropConstraint('usuarios', 'chk_usuarios_tipo', { ifExists: true })
  pgm.dropConstraint('chamados', 'chk_chamados_prioridade', { ifExists: true })
  pgm.dropConstraint('chamados', 'chk_chamados_status', { ifExists: true })

  pgm.dropConstraint('chamados', 'chamados_tecnico_id_fkey', { ifExists: true })
  pgm.addConstraint('chamados', 'chamados_tecnico_id_fkey', {
    foreignKeys: {
      columns: 'tecnico_id',
      references: 'usuarios(id)'
    }
  })
}
