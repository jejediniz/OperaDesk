const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const userRepository = require("../repositories/userRepository");
const { getEnv } = require("../config/env");

const INVALID_CREDENTIALS_MESSAGE = "Credenciais inválidas";

function assinarToken(usuario) {
  const { jwtSecret, jwtExpiresIn } = getEnv();

  return jwt.sign(
    {
      id: usuario.id,
      tipo: usuario.tipo,
      admin: usuario.admin
    },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );
}

function publicUser(usuario) {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    tipo: usuario.tipo,
    admin: usuario.admin,
    ativo: usuario.ativo
  };
}

async function hashSenha(senha) {
  const { bcryptRounds } = getEnv();
  return bcrypt.hash(senha, bcryptRounds);
}

async function compareSenha(senha, senhaHash) {
  return bcrypt.compare(senha, senhaHash);
}

async function registrar({ nome, email, senha, tipo, admin, ativo }) {
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

  return {
    token: assinarToken(usuario),
    usuario: publicUser(usuario)
  };
}

async function login({ email, senha }) {
  const usuario = await userRepository.findByEmail(email);

  if (!usuario || usuario.ativo === false) {
    if (senha) {
      // garante tempo constante de resposta para não vazar existência da conta
      await bcrypt.compare(
        senha,
        "$2b$12$invalidinvalidinvalidinvalidinvalidinvalidinv.invalidinv"
      );
    }
    throw new AppError(INVALID_CREDENTIALS_MESSAGE, 401);
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

  if (!senhaValida) {
    throw new AppError(INVALID_CREDENTIALS_MESSAGE, 401);
  }

  return {
    token: assinarToken(usuario),
    usuario: publicUser(usuario)
  };
}

async function getSessaoAtual(userId) {
  const usuario = await userRepository.findById(userId);

  if (!usuario || usuario.ativo === false) {
    throw new AppError("Sessão inválida", 401);
  }

  return publicUser(usuario);
}

module.exports = {
  INVALID_CREDENTIALS_MESSAGE,
  compareSenha,
  getSessaoAtual,
  hashSenha,
  login,
  registrar
};
