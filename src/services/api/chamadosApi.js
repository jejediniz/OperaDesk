import http from "./http";

export async function listarChamados(params = {}) {
  const response = await http.get("/chamados", { params });
  return {
    items: response.data,
    meta: response.meta
  };
}

export async function criarChamado(dados) {
  const response = await http.post("/chamados", {
    titulo: dados.titulo,
    descricao: dados.descricao,
    prioridade: dados.prioridade?.toLowerCase() || "media",
    tecnicoId: dados.tecnicoId,
    setor: dados.setor
  });
  return response.data;
}

export async function atualizarChamado(id, dados) {
  const response = await http.put(`/chamados/${id}`, {
    titulo: dados.titulo,
    descricao: dados.descricao,
    prioridade: dados.prioridade,
    status: dados.status,
    tecnicoId: dados.tecnicoId,
    setor: dados.setor
  });
  return response.data;
}

export async function excluirChamado(id) {
  await http.delete(`/chamados/${id}`);
  return true;
}

export async function listarInteracoesChamado(id) {
  const response = await http.get(`/chamados/${id}/interacoes`);
  return response.data;
}

export async function criarInteracaoChamado(id, dados) {
  const response = await http.post(`/chamados/${id}/interacoes`, {
    mensagem: dados.mensagem,
    tipo: dados.tipo || "publica"
  });
  return response.data;
}

export async function obterMetricasChamados() {
  const response = await http.get("/chamados/metrics");
  return response.data;
}
