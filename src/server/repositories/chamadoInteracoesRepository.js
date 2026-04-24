const pool = require('../config/database')

function mapInteracao(row) {
  if (!row) return null

  const {
    autor_nome,
    autor_email,
    autor_tipo,
    autor_admin,
    ...rest
  } = row

  return {
    ...rest,
    autor: {
      id: rest.autor_id,
      nome: autor_nome,
      email: autor_email,
      tipo: autor_tipo,
      admin: autor_admin
    }
  }
}

async function listarPorChamado(chamadoId, { incluirInternas = false } = {}) {
  const values = [chamadoId]
  let filtroTipo = ''

  if (!incluirInternas) {
    values.push('interna')
    filtroTipo = `AND ci.tipo <> $${values.length}`
  }

  const query = `
    SELECT
      ci.*,
      autor.nome AS autor_nome,
      autor.email AS autor_email,
      autor.tipo AS autor_tipo,
      autor.admin AS autor_admin
    FROM chamado_interacoes ci
    JOIN usuarios autor ON autor.id = ci.autor_id
    WHERE ci.chamado_id = $1
    ${filtroTipo}
    ORDER BY ci.created_at ASC, ci.id ASC
  `

  const { rows } = await pool.query(query, values)
  return rows.map(mapInteracao)
}

async function criar({ chamadoId, autorId, mensagem, tipo = 'publica' }) {
  const query = `
    WITH nova AS (
      INSERT INTO chamado_interacoes (chamado_id, autor_id, mensagem, tipo)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    )
    SELECT
      nova.*,
      autor.nome AS autor_nome,
      autor.email AS autor_email,
      autor.tipo AS autor_tipo,
      autor.admin AS autor_admin
    FROM nova
    JOIN usuarios autor ON autor.id = nova.autor_id
  `

  const { rows } = await pool.query(query, [chamadoId, autorId, mensagem, tipo])
  return mapInteracao(rows[0])
}

module.exports = {
  criar,
  listarPorChamado
}
