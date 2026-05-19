const AppError = require("../utils/AppError");
const logger = require("../utils/logger");
const chamadosRepository = require("../repositories/chamadosRepository");

exports.create = async (dados, usuarioId) => {
  const chamado = await chamadosRepository.criarComDetalhes(
    {
      titulo: dados.titulo,
      descricao: dados.descricao,
      prioridade: dados.prioridade ?? "media",
      status: "aberto",
      setor: dados.setor,
      tecnicoId: dados.tecnicoId
    },
    usuarioId
  );

  logger.audit("chamado.criado", {
    chamadoId: chamado.id,
    usuarioId
  });

  return chamado;
};

function resolveTecnicoFilter(value, usuarioId) {
  if (value === undefined) return undefined;
  if (value === "me") return usuarioId;
  if (value === "sem") return null;
  return Number(value);
}

exports.list = async (usuarioId, { listarTodos = false, filtros = {} } = {}) => {
  const page = Number(filtros.page || 1);
  const limit = Number(filtros.limit || 20);

  if (!listarTodos && filtros.usuarioId && Number(filtros.usuarioId) !== Number(usuarioId)) {
    throw new AppError("Permissão negada", 403);
  }

  const tecnicoId = listarTodos ? resolveTecnicoFilter(filtros.tecnicoId, usuarioId) : undefined;

  const queryFilters = {
    status: filtros.status,
    prioridade: filtros.prioridade,
    q: filtros.q,
    tecnicoId,
    page,
    limit,
    usuarioId: listarTodos ? filtros.usuarioId : usuarioId
  };

  const { items, total } = await chamadosRepository.listWithFilters(queryFilters);

  return {
    items,
    meta: {
      page,
      limit,
      total,
      totalPages: limit > 0 ? Math.ceil(total / limit) : 1
    }
  };
};

exports.findById = async (id, usuarioId, { buscarQualquer = false } = {}) => {
  return buscarQualquer
    ? chamadosRepository.buscarPorIdQualquer(id)
    : chamadosRepository.buscarPorId(id, usuarioId);
};

exports.update = async (
  id,
  dados,
  usuarioId,
  { atualizarQualquer = false, podeAtribuir = false } = {}
) => {
  if (dados.tecnicoId !== undefined && !podeAtribuir) {
    throw new AppError("Atribuição de técnico restrita a TI ou administradores", 403);
  }

  const chamadoAtualizado = await chamadosRepository.atualizarComDetalhes(id, dados, {
    usuarioId: atualizarQualquer ? null : usuarioId
  });

  if (!chamadoAtualizado) {
    return null;
  }

  logger.audit("chamado.atualizado", {
    chamadoId: chamadoAtualizado.id,
    usuarioId
  });

  if (chamadoAtualizado.status === "concluido") {
    logger.audit("chamado.concluido", {
      chamadoId: chamadoAtualizado.id,
      usuarioId
    });
  }

  return chamadoAtualizado;
};

exports.remove = async (id, usuarioId, { deletarQualquer = false } = {}) => {
  const removido = deletarQualquer
    ? await chamadosRepository.deletarQualquer(id)
    : await chamadosRepository.deletar(id, usuarioId);

  if (removido) {
    logger.audit("chamado.removido", {
      chamadoId: Number(id),
      usuarioId
    });
  }

  return removido;
};

exports.getMetrics = async (user) => {
  const isTiOuAdmin = user?.admin === true || user?.tipo === "ti";

  if (isTiOuAdmin) {
    return chamadosRepository.getMetrics();
  }

  return chamadosRepository.getMetrics({ usuarioId: user.id });
};
