const pool = require('../config/database')

const BASE_SELECT = `
  SELECT
    c.*,
    solicitante.nome AS solicitante_nome,
    solicitante.email AS solicitante_email,
    solicitante.tipo AS solicitante_tipo,
    tecnico.nome AS tecnico_nome,
    tecnico.email AS tecnico_email
  FROM chamados c
  JOIN usuarios solicitante ON solicitante.id = c.usuario_id
  LEFT JOIN usuarios tecnico ON tecnico.id = c.tecnico_id
`

function mapChamado(row) {
  if (!row) return null

  const {
    solicitante_nome,
    solicitante_email,
    solicitante_tipo,
    tecnico_nome,
    tecnico_email,
    ...rest
  } = row

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
  }
}

function buildWhereClause(filters, values) {
  const conditions = []

  if (filters.status) {
    values.push(filters.status)
    conditions.push(`c.status = $${values.length}`)
  }

  if (filters.prioridade) {
    values.push(filters.prioridade)
    conditions.push(`c.prioridade = $${values.length}`)
  }

  if (filters.usuarioId) {
    values.push(filters.usuarioId)
    conditions.push(`c.usuario_id = $${values.length}`)
  }

  return conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
}

async function listWithFilters({ status, prioridade, usuarioId, page, limit }) {
  const values = []
  const whereClause = buildWhereClause({ status, prioridade, usuarioId }, values)

  const countQuery = `
    SELECT COUNT(*)::int AS total
    FROM chamados c
    ${whereClause}
  `

  const listQuery = `
    ${BASE_SELECT}
    ${whereClause}
    ORDER BY c.id DESC
    LIMIT $${values.length + 1}
    OFFSET $${values.length + 2}
  `

  const offset = (page - 1) * limit
  const listValues = [...values, limit, offset]

  const [countResult, listResult] = await Promise.all([
    pool.query(countQuery, values),
    pool.query(listQuery, listValues)
  ])

  const total = countResult.rows[0]?.total || 0
  const items = listResult.rows.map(mapChamado)

  return { items, total }
}

async function buscarPorId(id, usuarioId) {
  const { rows } = await pool.query(
    `${BASE_SELECT} WHERE c.id = $1 AND c.usuario_id = $2`,
    [id, usuarioId]
  )
  return mapChamado(rows[0])
}

async function buscarPorIdQualquer(id) {
  const { rows } = await pool.query(`${BASE_SELECT} WHERE c.id = $1`, [id])
  return mapChamado(rows[0])
}

async function criarComDetalhes(dados, usuarioId) {
  const query = `
    WITH novo AS (
      INSERT INTO chamados (titulo, descricao, status, prioridade, usuario_id, tecnico_id, setor)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    )
    SELECT
      novo.*,
      solicitante.nome AS solicitante_nome,
      solicitante.email AS solicitante_email,
      solicitante.tipo AS solicitante_tipo,
      tecnico.nome AS tecnico_nome,
      tecnico.email AS tecnico_email
    FROM novo
    JOIN usuarios solicitante ON solicitante.id = novo.usuario_id
    LEFT JOIN usuarios tecnico ON tecnico.id = novo.tecnico_id
  `

  const { rows } = await pool.query(query, [
    dados.titulo,
    dados.descricao,
    dados.status,
    dados.prioridade,
    usuarioId,
    dados.tecnicoId ?? null,
    dados.setor ?? null
  ])

  return mapChamado(rows[0])
}

async function atualizarComDetalhes(id, dados, { usuarioId = null } = {}) {
  const values = [
    dados.titulo ?? null,
    dados.descricao ?? null,
    dados.status ?? null,
    dados.prioridade ?? null,
    dados.tecnicoId ?? null,
    dados.setor ?? null,
    id
  ]

  let whereClause = 'WHERE id = $7'

  if (usuarioId !== null) {
    values.push(usuarioId)
    whereClause = `WHERE id = $7 AND usuario_id = $${values.length}`
  }

  const query = `
    WITH atualizado AS (
      UPDATE chamados
      SET
        titulo = COALESCE($1, titulo),
        descricao = COALESCE($2, descricao),
        status = COALESCE($3, status),
        prioridade = COALESCE($4, prioridade),
        tecnico_id = COALESCE($5, tecnico_id),
        setor = COALESCE($6, setor)
      ${whereClause}
      RETURNING *
    )
    SELECT
      atualizado.*,
      solicitante.nome AS solicitante_nome,
      solicitante.email AS solicitante_email,
      solicitante.tipo AS solicitante_tipo,
      tecnico.nome AS tecnico_nome,
      tecnico.email AS tecnico_email
    FROM atualizado
    JOIN usuarios solicitante ON solicitante.id = atualizado.usuario_id
    LEFT JOIN usuarios tecnico ON tecnico.id = atualizado.tecnico_id
  `

  const { rows } = await pool.query(query, values)
  return mapChamado(rows[0])
}

async function tocarAtualizacao(id) {
  await pool.query('UPDATE chamados SET updated_at = NOW() WHERE id = $1', [id])
}

async function deletar(id, usuarioId) {
  const { rowCount } = await pool.query(
    'DELETE FROM chamados WHERE id = $1 AND usuario_id = $2',
    [id, usuarioId]
  )
  return rowCount > 0
}

async function deletarQualquer(id) {
  const { rowCount } = await pool.query('DELETE FROM chamados WHERE id = $1', [id])
  return rowCount > 0
}

module.exports = {
  listWithFilters,
  buscarPorId,
  buscarPorIdQualquer,
  criarComDetalhes,
  atualizarComDetalhes,
  tocarAtualizacao,
  deletar,
  deletarQualquer
}
