export const STATUS_LABEL = {
  aberto: "Aberto",
  em_andamento: "Em andamento",
  concluido: "Concluído",
  fechado: "Concluído"
};

export const PRIORIDADE_LABEL = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta"
};

export const STATUS_FILTERS = [
  { label: "Todos", value: "todos" },
  { label: "Abertos", value: "aberto" },
  { label: "Em andamento", value: "em_andamento" },
  { label: "Concluídos", value: "concluido" }
];

export const STATUS_FECHADOS = ["concluido", "fechado"];

export function isStatusFechado(status) {
  return STATUS_FECHADOS.includes(status);
}
