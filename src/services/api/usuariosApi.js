import http from "./http";

export async function listarUsuarios() {
  const response = await http.get("/users");
  return response.data;
}

export async function criarUsuario(dados) {
  const response = await http.post("/users", {
    nome: dados.nome,
    email: dados.email,
    senha: dados.senha,
    tipo: dados.tipo,
    admin: dados.admin,
    ativo: dados.ativo
  });
  return response.data;
}

export async function listarTecnicos() {
  const response = await http.get("/users/tecnicos");
  return response.data;
}

export async function excluirUsuario(id) {
  await http.delete(`/users/${id}`);
  return true;
}

export async function alterarMinhaSenha({ senhaAtual, senhaNova }) {
  await http.patch("/users/me", { senhaAtual, senhaNova });
  return true;
}
