const pool = require('../config/database')

async function list() {
  const result = await pool.query(
    'SELECT id, nome, email, tipo, admin, ativo FROM usuarios ORDER BY id DESC'
  )
  return result.rows
}

async function listByTipo(tipo) {
  const result = await pool.query(
    'SELECT id, nome, email, tipo, admin, ativo FROM usuarios WHERE tipo = $1 ORDER BY id DESC',
    [tipo]
  )
  return result.rows
}

async function findById(id) {
  const result = await pool.query(
    'SELECT id, nome, email, tipo, admin, ativo FROM usuarios WHERE id = $1',
    [id]
  )
  return result.rows[0]
}

async function findByEmail(email) {
  const result = await pool.query(
    'SELECT id, nome, email, senha_hash, tipo, admin, ativo FROM usuarios WHERE email = $1',
    [email]
  )
  return result.rows[0]
}

async function create({ nome, email, senha_hash, tipo, admin, ativo }) {
  const result = await pool.query(
    'INSERT INTO usuarios (nome, email, senha_hash, tipo, admin, ativo) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, nome, email, tipo, admin, ativo',
    [nome, email, senha_hash, tipo, admin, ativo]
  )
  return result.rows[0]
}

async function update(id, { nome, email, senha_hash, tipo, admin, ativo }) {
  const result = await pool.query(
    `
      UPDATE usuarios
      SET
        nome = COALESCE($1, nome),
        email = COALESCE($2, email),
        senha_hash = COALESCE($3, senha_hash),
        tipo = COALESCE($4, tipo),
        admin = COALESCE($5, admin),
        ativo = COALESCE($6, ativo)
      WHERE id = $7
      RETURNING id, nome, email, tipo, admin, ativo
    `,
    [nome ?? null, email ?? null, senha_hash, tipo ?? null, admin ?? null, ativo ?? null, id]
  )
  return result.rows[0]
}

async function remove(id) {
  const result = await pool.query(
    'DELETE FROM usuarios WHERE id = $1 RETURNING id',
    [id]
  )
  return result.rows[0]
}

module.exports = {
  list,
  listByTipo,
  findById,
  findByEmail,
  create,
  update,
  remove
}
