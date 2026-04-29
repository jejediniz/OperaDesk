/** Normaliza query string da listagem/exportação de ativos para o Joi. */
function coerceAtivosListQuery(raw) {
  const next = { ...raw }
  if (next.page !== undefined && next.page !== "") {
    next.page = Number(next.page)
  }
  if (next.limit !== undefined && next.limit !== "") {
    next.limit = Number(next.limit)
  }
  if (next.incluirInativos === "true") next.incluirInativos = true
  if (next.incluirInativos === "false") next.incluirInativos = false
  if (next.somenteInativos === "true") next.somenteInativos = true
  if (next.somenteInativos === "false") next.somenteInativos = false
  return next
}

module.exports = { coerceAtivosListQuery }
