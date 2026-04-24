export function formatDate(value) {
  return value ? new Date(value).toLocaleDateString("pt-BR") : "—";
}
