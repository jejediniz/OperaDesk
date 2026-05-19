const AppError = require("../utils/AppError");
const userRepository = require("../repositories/userRepository");
const logger = require("../utils/logger");
const { compareSenha, hashSenha } = require("./authService");

exports.list = async () => {
  return userRepository.list();
};

exports.listTecnicos = async () => {
  return userRepository.listByTipo("ti");
};

exports.findById = async (id) => {
  return userRepository.findById(id);
};

exports.create = async ({ nome, email, senha, tipo, admin, ativo }) => {
  const existente = await userRepository.findByEmail(email);

  if (existente) {
    throw new AppError("Email já cadastrado", 409);
  }

  const senha_hash = await hashSenha(senha);

  const usuario = await userRepository.create({
    nome,
    email,
    senha_hash,
    tipo: tipo ?? "comum",
    admin: admin ?? false,
    ativo: ativo ?? true
  });

  logger.audit("usuario.criado", { usuarioId: usuario.id });

  return usuario;
};

exports.update = async (id, { nome, email, senha, tipo, admin, ativo }) => {
  let senha_hash;

  if (email) {
    const existente = await userRepository.findByEmail(email);
    if (existente && String(existente.id) !== String(id)) {
      throw new AppError("Email já cadastrado", 409);
    }
  }

  if (senha) {
    senha_hash = await hashSenha(senha);
  }

  const usuario = await userRepository.update(id, {
    nome,
    email,
    senha_hash,
    tipo,
    admin,
    ativo
  });

  if (usuario) {
    logger.audit("usuario.atualizado", { usuarioId: usuario.id });
  }

  return usuario;
};

exports.remove = async (id) => {
  const removido = await userRepository.remove(id);

  if (removido) {
    logger.audit("usuario.removido", { usuarioId: removido.id });
  }

  return removido;
};

exports.changeOwnPassword = async (userId, { senhaAtual, senhaNova }) => {
  if (senhaAtual === senhaNova) {
    throw new AppError("A nova senha deve ser diferente da atual", 400);
  }

  const row = await userRepository.findCredentialsForPasswordChange(userId);

  if (!row) {
    throw new AppError("Usuário não encontrado", 404);
  }

  if (row.ativo === false) {
    throw new AppError("Conta inativa", 403);
  }

  const senhaOk = await compareSenha(senhaAtual, row.senha_hash);

  if (!senhaOk) {
    throw new AppError("Senha atual incorreta", 401);
  }

  const senha_hash = await hashSenha(senhaNova);
  await userRepository.update(userId, { senha_hash });

  logger.audit("usuario.senha_alterada_propria", { usuarioId: userId });

  return true;
};
