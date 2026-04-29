exports.up = (pgm) => {
  pgm.createTable('ativos', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()')
    },
    empresa_id: { type: 'varchar(64)', notNull: false },
    nome: { type: 'varchar(200)', notNull: true },
    numero_patrimonio: { type: 'varchar(80)', notNull: true, unique: true },
    numero_serie: { type: 'varchar(120)', notNull: false },
    categoria: { type: 'varchar(120)', notNull: false },
    marca: { type: 'varchar(120)', notNull: false },
    modelo: { type: 'varchar(160)', notNull: false },
    descricao: { type: 'text', notNull: false },
    status: { type: 'varchar(32)', notNull: true, default: 'disponivel' },
    setor: { type: 'varchar(120)', notNull: false },
    localizacao: { type: 'varchar(200)', notNull: false },
    responsavel: { type: 'varchar(160)', notNull: false },
    valor_compra: { type: 'numeric(14, 2)', notNull: false },
    data_compra: { type: 'timestamptz', notNull: false },
    fornecedor: { type: 'varchar(200)', notNull: false },
    data_fim_garantia: { type: 'timestamptz', notNull: false },
    observacoes: { type: 'text', notNull: false },
    ativo: { type: 'boolean', notNull: true, default: true },
    criado_em: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    atualizado_em: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') }
  })

  pgm.addConstraint('ativos', 'chk_ativos_status', {
    check:
      "status IN ('disponivel', 'em_uso', 'em_manutencao', 'danificado', 'extraviado', 'baixado')"
  })

  pgm.createIndex('ativos', 'status', { name: 'idx_ativos_status' })
  pgm.createIndex('ativos', 'categoria', { name: 'idx_ativos_categoria' })
  pgm.createIndex('ativos', 'ativo', { name: 'idx_ativos_ativo' })
}

exports.down = (pgm) => {
  pgm.dropTable('ativos', { ifExists: true })
}
