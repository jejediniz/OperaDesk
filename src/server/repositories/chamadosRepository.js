const pool = require("../config/database");

const CHAMADO_COLUMNS = [
  "id",
  "titulo",
  "descricao",
  "status",
  "prioridade",
  "setor",
  "usuario_id",
  "tecnico_id",
  "created_at",
  "updated_at"
];

const SELECT_CHAMADO_FIELDS = CHAMADO_COLUMNS.map((col) => `c.${col}`).join(", ");

const BASE_SELECT = `
  SELECT
    ${SELECT_CHAMADO_FIELDS},
    solicitante.nome AS solicitante_nome,
    solicitante.email AS solicitante_email,
    solicitante.tipo AS solicitante_tipo,
    tecnico.nome AS tecnico_nome,
    tecnico.email AS tecnico_email
  FROM chamados c
  JOIN usuarios solicitante ON solicitante.id = c.usuario_id
  LEFT JOIN usuarios tecnico ON tecnico.id = c.tecnico_id
`;

const RETURNING_DETAILS_TEMPLATE = (cteName) => `
  SELECT
    ${CHAMADO_COLUMNS.map((col) => `${cteName}.${col}`).join(", ")},
    solicitante.nome AS solicitante_nome,
    solicitante.email AS solicitante_email,
    solicitante.tipo AS solicitante_tipo,
    tecnico.nome AS tecnico_nome,
    tecnico.email AS tecnico_email
  FROM ${cteName}
  JOIN usuarios solicitante ON solicitante.id = ${cteName}.usuario_id
  LEFT JOIN usuarios tecnico ON tecnico.id = ${cteName}.tecnico_id
`;

function mapChamado(row) {
  if (!row) return null;

  const {
    solicitante_nome,
    solicitante_email,
    solicitante_tipo,
    tecnico_nome,
    tecnico_email,
    ...rest
  } = row;

  return {
    ...rest,
    solicitante: {
      id: rest.usuario_id,
      nome: solicitante_nome,
      email: solicitante_email,
      tipo: solicitante_tipo
    },
    tecnico: rest.tecnico_id
      ? {
          id: rest.tecnico_id,
          nome: tecnico_nome,
          email: tecnico_email
        }
      : null
  };
}

function buildWhereClause(filters, values) {
  const conditions = [];

  if (filters.status) {
    values.push(filters.status);
    conditions.push(`c.status = $${values.length}`);
  }

  if (filters.prioridade) {
    values.push(filters.prioridade);
    conditions.push(`c.prioridade = $${values.length}`);
  }

  if (filters.usuarioId) {
    values.push(filters.usuarioId);
    conditions.push(`c.usuario_id = $${values.length}`);
  }

  if (filters.tecnicoId === null) {
    conditions.push("c.tecnico_id IS NULL");
  } else if (filters.tecnicoId !== undefined) {
    values.push(filters.tecnicoId);
    conditions.push(`c.tecnico_id = $${values.length}`);
  }

  if (filters.q) {
    values.push(filters.q);
    const idx = values.length;
    // ILIKE com pg_trgm GIN nos campos textuais; id também aceita match exato
    conditions.push(`(
      c.titulo ILIKE '%' || $${idx} || '%'
      OR c.descricao ILIKE '%' || $${idx} || '%'
      OR c.setor ILIKE '%' || $${idx} || '%'
      OR solicitante.nome ILIKE '%' || $${idx} || '%'
      OR tecnico.nome ILIKE '%' || $${idx} || '%'
      OR c.id::text = $${idx}
    )`);
  }

  return conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
}

async function listWithFilters({ status, prioridade, usuarioId, tecnicoId, q, page, limit }) {
  const values = [];
  const whereClause = buildWhereClause({ status, prioridade, usuarioId, tecnicoId, q }, values);

  // JOIN em ambas para que filtros que tocam solicitante/tecnico funcionem
  // tanto no count quanto na listagem
  const countQuery = `
    SELECT COUNT(*)::int AS total
    FROM chamados c
    JOIN usuarios solicitante ON solicitante.id = c.usuario_id
    LEFT JOIN usuarios tecnico ON tecnico.id = c.tecnico_id
    ${whereClause}
  `;

  const listQuery = `
    ${BASE_SELECT}
    ${whereClause}
    ORDER BY c.id DESC
    LIMIT $${values.length + 1}
    OFFSET $${values.length + 2}
  `;

  const offset = (page - 1) * limit;
  const listValues = [...values, limit, offset];

  const [countResult, listResult] = await Promise.all([
    pool.query(countQuery, values),
    pool.query(listQuery, listValues)
  ]);

  const total = countResult.rows[0]?.total || 0;
  const items = listResult.rows.map(mapChamado);

  return { items, total };
}

async function buscarPorId(id, usuarioId) {
  const { rows } = await pool.query(`${BASE_SELECT} WHERE c.id = $1 AND c.usuario_id = $2`, [
    id,
    usuarioId
  ]);
  return mapChamado(rows[0]);
}

async function buscarPorIdQualquer(id) {
  const { rows } = await pool.query(`${BASE_SELECT} WHERE c.id = $1`, [id]);
  return mapChamado(rows[0]);
}

async function criarComDetalhes(dados, usuarioId) {
  const query = `
    WITH novo AS (
      INSERT INTO chamados (titulo, descricao, status, prioridade, usuario_id, tecnico_id, setor)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING ${CHAMADO_COLUMNS.join(", ")}
    )
    ${RETURNING_DETAILS_TEMPLATE("novo")}
  `;

  const { rows } = await pool.query(query, [
    dados.titulo,
    dados.descricao,
    dados.status,
    dados.prioridade,
    usuarioId,
    dados.tecnicoId ?? null,
    dados.setor ?? null
  ]);

  return mapChamado(rows[0]);
}

const UPDATE_FIELD_MAP = {
  titulo: "titulo",
  descricao: "descricao",
  status: "status",
  prioridade: "prioridade",
  tecnicoId: "tecnico_id",
  setor: "setor"
};

function buildUpdateSet(dados) {
  const sets = [];
  const values = [];

  for (const [key, column] of Object.entries(UPDATE_FIELD_MAP)) {
    if (dados[key] !== undefined) {
      values.push(dados[key]);
      sets.push(`${column} = $${values.length}`);
    }
  }

  return { sets, values };
}

async function atualizarComDetalhes(id, dados, { usuarioId = null } = {}) {
  const { sets, values } = buildUpdateSet(dados);

  if (sets.length === 0) {
    return usuarioId === null ? buscarPorIdQualquer(id) : buscarPorId(id, usuarioId);
  }

  values.push(id);
  const idPlaceholder = `$${values.length}`;

  let whereClause = `WHERE id = ${idPlaceholder}`;

  if (usuarioId !== null) {
    values.push(usuarioId);
    whereClause = `WHERE id = ${idPlaceholder} AND usuario_id = $${values.length}`;
  }

  const query = `
    WITH atualizado AS (
      UPDATE chamados
      SET ${sets.join(", ")}
      ${whereClause}
      RETURNING ${CHAMADO_COLUMNS.join(", ")}
    )
    ${RETURNING_DETAILS_TEMPLATE("atualizado")}
  `;

  const { rows } = await pool.query(query, values);
  return mapChamado(rows[0]);
}

async function tocarAtualizacao(id) {
  await pool.query("UPDATE chamados SET updated_at = NOW() WHERE id = $1", [id]);
}

async function deletar(id, usuarioId) {
  const { rowCount } = await pool.query("DELETE FROM chamados WHERE id = $1 AND usuario_id = $2", [
    id,
    usuarioId
  ]);
  return rowCount > 0;
}

async function deletarQualquer(id) {
  const { rowCount } = await pool.query("DELETE FROM chamados WHERE id = $1", [id]);
  return rowCount > 0;
}

async function getMetrics({ usuarioId = null, tecnicoId = null } = {}) {
  const conditions = [];
  const values = [];

  if (usuarioId !== null) {
    values.push(usuarioId);
    conditions.push(`usuario_id = $${values.length}`);
  }

  if (tecnicoId !== null) {
    values.push(tecnicoId);
    conditions.push(`tecnico_id = $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const query = `
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 'aberto')::int AS abertos,
      COUNT(*) FILTER (WHERE status = 'em_andamento')::int AS em_andamento,
      COUNT(*) FILTER (WHERE status IN ('concluido', 'fechado'))::int AS concluidos,
      COUNT(*) FILTER (
        WHERE prioridade = 'alta' AND status NOT IN ('concluido', 'fechado')
      )::int AS alta_prioridade_pendentes,
      COUNT(*) FILTER (WHERE tecnico_id IS NULL)::int AS sem_tecnico
    FROM chamados
    ${whereClause}
  `;

  const { rows } = await pool.query(query, values);
  return rows[0];
}

module.exports = {
  atualizarComDetalhes,
  buscarPorId,
  buscarPorIdQualquer,
  criarComDetalhes,
  deletar,
  deletarQualquer,
  getMetrics,
  listWithFilters,
  tocarAtualizacao
};
