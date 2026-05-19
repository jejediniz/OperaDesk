-- Snapshot de referência. A criação real é feita via node-pg-migrate.
-- Comando: npm run db:migrate

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(160) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  tipo VARCHAR(10) NOT NULL DEFAULT 'comum'
    CHECK (tipo IN ('comum', 'ti')),
  admin BOOLEAN NOT NULL DEFAULT false,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chamados (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'aberto'
    CHECK (status IN ('aberto', 'em_andamento', 'concluido', 'fechado')),
  prioridade VARCHAR(20) NOT NULL DEFAULT 'media'
    CHECK (prioridade IN ('baixa', 'media', 'alta')),
  setor VARCHAR(120),
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tecnico_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chamado_interacoes (
  id SERIAL PRIMARY KEY,
  chamado_id INTEGER NOT NULL REFERENCES chamados(id) ON DELETE CASCADE,
  autor_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  mensagem TEXT NOT NULL,
  tipo VARCHAR(20) NOT NULL DEFAULT 'publica'
    CHECK (tipo IN ('publica', 'interna')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_chamados_usuario_id ON chamados(usuario_id);
CREATE INDEX IF NOT EXISTS idx_chamados_tecnico_id ON chamados(tecnico_id);
CREATE INDEX IF NOT EXISTS idx_chamados_status ON chamados(status);
CREATE INDEX IF NOT EXISTS idx_chamados_prioridade ON chamados(prioridade);
CREATE INDEX IF NOT EXISTS idx_chamados_status_prioridade ON chamados(status, prioridade);
CREATE INDEX IF NOT EXISTS idx_chamados_created_at ON chamados(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chamados_titulo_trgm
  ON chamados USING gin (titulo gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_chamados_descricao_trgm
  ON chamados USING gin (descricao gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_chamado_interacoes_chamado
  ON chamado_interacoes(chamado_id, created_at ASC);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_usuarios_updated_at ON usuarios;
CREATE TRIGGER trg_usuarios_updated_at
BEFORE UPDATE ON usuarios
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_chamados_updated_at ON chamados;
CREATE TRIGGER trg_chamados_updated_at
BEFORE UPDATE ON chamados
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
