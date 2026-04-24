import api from "./api";

/**
 * LISTAR CHAMADOS
 */
export async function listarChamados(params = {}) {
  const response = await api.get("/chamados", { params });
  return {
    items: response.data.data,
    meta: response.data.meta,
  };
}

/**
 * CRIAR CHAMADO
 */
export async function criarChamado(dados) {
  const response = await api.post("/chamados", {
    titulo: dados.titulo,
    descricao: dados.descricao,
    prioridade: dados.prioridade?.toLowerCase() || "media",
    tecnicoId: dados.tecnicoId,
    setor: dados.setor,
  });

  return response.data.data;
}

/**
 * ATUALIZAR STATUS
 */
export async function atualizarChamado(id, dados) {
  const response = await api.put(`/chamados/${id}`, {
    titulo: dados.titulo,
    descricao: dados.descricao,
    prioridade: dados.prioridade,
    status: dados.status,
    tecnicoId: dados.tecnicoId,
    setor: dados.setor,
  });

  return response.data.data;
}

/**
 * DELETAR CHAMADO
 */
export async function excluirChamado(id) {
  await api.delete(`/chamados/${id}`);
  return true;
}

export async function listarInteracoesChamado(id) {
  const response = await api.get(`/chamados/${id}/interacoes`);
  return response.data.data;
}

export async function criarInteracaoChamado(id, dados) {
  const response = await api.post(`/chamados/${id}/interacoes`, {
    mensagem: dados.mensagem,
    tipo: dados.tipo || "publica",
  });

  return response.data.data;
}
