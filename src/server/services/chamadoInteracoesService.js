const AppError = require("../utils/AppError");
const logger = require("../utils/logger");
const chamadosRepository = require("../repositories/chamadosRepository");
const chamadoInteracoesRepository = require("../repositories/chamadoInteracoesRepository");

function usuarioPodeVerQualquer(usuario) {
  return usuario?.tipo === "ti" || usuario?.admin === true;
}

async function obterChamadoAcessivel(chamadoId, usuario) {
  const chamado = usuarioPodeVerQualquer(usuario)
    ? await chamadosRepository.buscarPorIdQualquer(chamadoId)
    : await chamadosRepository.buscarPorId(chamadoId, usuario.id);

  if (!chamado) {
    throw new AppError("Chamado não encontrado", 404);
  }

  return chamado;
}

exports.list = async (chamadoId, usuario) => {
  await obterChamadoAcessivel(chamadoId, usuario);

  return chamadoInteracoesRepository.listarPorChamado(chamadoId, {
    incluirInternas: usuarioPodeVerQualquer(usuario)
  });
};

exports.create = async (chamadoId, dados, usuario) => {
  const chamado = await obterChamadoAcessivel(chamadoId, usuario);
  const tipo = dados.tipo || "publica";

  if (tipo === "interna" && !usuarioPodeVerQualquer(usuario)) {
    throw new AppError("Notas internas são restritas a TI e administradores", 403);
  }

  const interacao = await chamadoInteracoesRepository.criar({
    chamadoId: chamado.id,
    autorId: usuario.id,
    mensagem: dados.mensagem,
    tipo
  });

  await chamadosRepository.tocarAtualizacao(chamado.id);

  logger.audit("chamado.interacao.criada", {
    chamadoId: chamado.id,
    interacaoId: interacao?.id,
    usuarioId: usuario.id,
    tipo
  });

  return interacao;
};
