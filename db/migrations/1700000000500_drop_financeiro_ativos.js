exports.up = (pgm) => {
  pgm.dropColumn('ativos', 'valor_compra')
  pgm.dropColumn('ativos', 'data_compra')
  pgm.dropColumn('ativos', 'fornecedor')
  pgm.dropColumn('ativos', 'data_fim_garantia')
}

exports.down = (pgm) => {
  pgm.addColumn('ativos', {
    valor_compra: { type: 'numeric(14, 2)', notNull: false },
    data_compra: { type: 'timestamptz', notNull: false },
    fornecedor: { type: 'varchar(200)', notNull: false },
    data_fim_garantia: { type: 'timestamptz', notNull: false }
  })
}
