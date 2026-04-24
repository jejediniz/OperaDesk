const bcrypt = require('bcrypt')
const AppError = require('../utils/AppError')
const userRepository = require('../repositories/userRepository')
const logger = require('../utils/logger')

exports.list = async () => {
  return userRepository.list()
}

exports.listTecnicos = async () => {
  return userRepository.listByTipo('ti')
}

exports.findById = async (id) => {
  return userRepository.findById(id)
}

exports.create = async ({ nome, email, senha, tipo, admin, ativo }) => {
  const existente = await userRepository.findByEmail(email)

  if (existente) {
    throw new AppError('Email já cadastrado', 409)
  }

  const senha_hash = await bcrypt.hash(senha, 10)

  const usuario = await userRepository.create({
    nome,
    email,
    senha_hash,
    tipo: tipo ?? 'comum',
    admin: admin ?? false,
    ativo: ativo ?? true
  })

  logger.audit('usuario.criado', {
    usuarioId: usuario.id
  })

  return usuario
}

exports.update = async (id, { nome, email, senha, tipo, admin, ativo }) => {
  let senha_hash = null

  if (email) {
    const existente = await userRepository.findByEmail(email)
    if (existente && String(existente.id) !== String(id)) {
      throw new AppError('Email já cadastrado', 409)
    }
  }

  if (senha) {
    senha_hash = await bcrypt.hash(senha, 10)
  }

  const usuario = await userRepository.update(id, {
    nome,
    email,
    senha_hash,
    tipo,
    admin,
    ativo
  })

  if (usuario) {
    logger.audit('usuario.atualizado', {
      usuarioId: usuario.id
    })
  }

  return usuario
}

exports.remove = async (id) => {
  const removido = await userRepository.remove(id)

  if (removido) {
    logger.audit('usuario.removido', {
      usuarioId: removido.id
    })
  }

  return removido
}
