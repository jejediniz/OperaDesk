const DEFAULT_ADMIN_HASH = '$2b$10$LLZnxHdT2o/kEwEmCMk.cugMC/TbpdjSf/.8rxDTrdzTVV2klDmzS'

exports.up = (pgm) => {
  if (process.env.NODE_ENV === 'production') {
    return
  }

  pgm.sql(`
    INSERT INTO usuarios (nome, email, senha_hash, tipo, admin, ativo)
    VALUES ('Administrador', 'admin@operadesk.local', '${DEFAULT_ADMIN_HASH}', 'ti', true, true)
    ON CONFLICT (email) DO NOTHING;
  `)
}

exports.down = (pgm) => {
  pgm.sql("DELETE FROM usuarios WHERE email = 'admin@operadesk.local'")
}
