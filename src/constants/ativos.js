/** Valores persistidos no banco (coluna status) */
export const STATUS_ATIVO = {
  DISPONIVEL: "disponivel",
  EM_USO: "em_uso",
  EM_MANUTENCAO: "em_manutencao",
  DANIFICADO: "danificado",
  EXTRAVIADO: "extraviado",
  BAIXADO: "baixado"
};

export const STATUS_ATIVO_LABEL = {
  disponivel: "Disponível",
  em_uso: "Em uso",
  em_manutencao: "Em manutenção",
  danificado: "Danificado",
  extraviado: "Extraviado",
  baixado: "Baixado / fora de uso"
};

export const STATUS_ATIVO_OPCOES = Object.entries(STATUS_ATIVO_LABEL).map(([value, label]) => ({
  value,
  label
}));

/** Sugestões de categoria no cadastro (campo livre: pode digitar outro). */
export const CATEGORIAS_ATIVO_SUGESTOES = [
  "Notebook",
  "Computador",
  "Monitor",
  "Impressora",
  "Celular corporativo",
  "Roteador",
  "Switch",
  "Nobreak",
  "Projetor",
  "Mesa",
  "Cadeira",
  "Outro equipamento"
];
