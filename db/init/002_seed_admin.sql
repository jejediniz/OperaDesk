INSERT INTO usuarios (nome, email, senha_hash, tipo, admin, ativo)
VALUES (
  'Administrador',
  'admin@operadesk.local',
  '$2b$10$LLZnxHdT2o/kEwEmCMk.cugMC/TbpdjSf/.8rxDTrdzTVV2klDmzS',
  'ti',
  true,
  true
)
ON CONFLICT (email) DO NOTHING;
