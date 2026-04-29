export function formatMoedaBr(value) {
  if (value === undefined || value === null || value === "") return "—";
  const n = typeof value === "string" ? Number(value.replace(",", ".")) : Number(value);
  if (!Number.isFinite(n)) return String(value);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDate(value) {
  return value ? new Date(value).toLocaleDateString("pt-BR") : "—";
}

export function formatDateTime(value) {
  if (!value) return "—";
  const data = new Date(value);
  return `${data.toLocaleDateString("pt-BR")} ${data.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

const UNIDADES = [
  { limite: 60, divisor: 1, nome: "segundo" },
  { limite: 3600, divisor: 60, nome: "minuto" },
  { limite: 86400, divisor: 3600, nome: "hora" },
  { limite: 2592000, divisor: 86400, nome: "dia" },
  { limite: 31536000, divisor: 2592000, nome: "mês" },
  { limite: Infinity, divisor: 31536000, nome: "ano" },
];

export function formatRelative(value, agora = new Date()) {
  if (!value) return "—";

  const data = new Date(value);
  if (Number.isNaN(data.getTime())) return "—";

  const diffSegundos = Math.round((agora.getTime() - data.getTime()) / 1000);
  const futuro = diffSegundos < 0;
  const abs = Math.abs(diffSegundos);

  if (abs < 30) return "agora há pouco";

  const unidade = UNIDADES.find((u) => abs < u.limite) || UNIDADES[UNIDADES.length - 1];
  const valor = Math.floor(abs / unidade.divisor);
  const nome = valor === 1 ? unidade.nome : pluralizar(unidade.nome);
  return futuro ? `em ${valor} ${nome}` : `há ${valor} ${nome}`;
}

function pluralizar(nome) {
  if (nome === "mês") return "meses";
  return `${nome}s`;
}
