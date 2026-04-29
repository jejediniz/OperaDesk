const AppError = require('../utils/AppError')
const logger = require('../utils/logger')
const { prisma } = require('../../lib/prisma')

const STATUS_VALUES = [
  'disponivel',
  'em_uso',
  'em_manutencao',
  'danificado',
  'extraviado',
  'baixado'
]

function mapAtivo(row) {
  if (!row) return null
  return {
    id: row.id,
    empresaId: row.empresaId,
    nome: row.nome,
    numeroPatrimonio: row.numeroPatrimonio,
    numeroSerie: row.numeroSerie,
    categoria: row.categoria,
    marca: row.marca,
    modelo: row.modelo,
    descricao: row.descricao,
    status: row.status,
    setor: row.setor,
    localizacao: row.localizacao,
    responsavel: row.responsavel,
    observacoes: row.observacoes,
    ativo: row.ativo,
    criadoEm: row.criadoEm,
    atualizadoEm: row.atualizadoEm
  }
}

function parseBoolish(v) {
  return v === true || v === 'true' || v === 1
}

const SORTABLE_COLUMNS = ['nome', 'numeroPatrimonio', 'categoria', 'atualizadoEm', 'status']

function buildWhereAtivos(filtros = {}) {
  const q = filtros.q?.trim()
  const status = filtros.status
  const categoria = filtros.categoria
  const incluirInativos = parseBoolish(filtros.incluirInativos)
  const somenteInativos = parseBoolish(filtros.somenteInativos)

  const whereParts = []
  if (somenteInativos) {
    whereParts.push({ ativo: false })
  } else if (!incluirInativos) {
    whereParts.push({ ativo: true })
  }
  if (status) whereParts.push({ status })
  if (categoria) {
    whereParts.push({
      categoria: { contains: categoria.trim(), mode: 'insensitive' }
    })
  }
  if (q) {
    whereParts.push({
      OR: [
        { nome: { contains: q, mode: 'insensitive' } },
        { numeroPatrimonio: { contains: q, mode: 'insensitive' } },
        { marca: { contains: q, mode: 'insensitive' } },
        { modelo: { contains: q, mode: 'insensitive' } }
      ]
    })
  }

  if (whereParts.length === 0) return {}
  if (whereParts.length === 1) return whereParts[0]
  return { AND: whereParts }
}

function buildOrderByAtivos(filtros = {}) {
  const field = SORTABLE_COLUMNS.includes(filtros.ordenar) ? filtros.ordenar : 'atualizadoEm'
  const dir = filtros.ordem === 'asc' ? 'asc' : 'desc'
  return { [field]: dir }
}

function csvEscape(val) {
  if (val === null || val === undefined) return ''
  const s = String(val)
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

const EXPORT_MAX_ROWS = 8000

exports.listarAtivos = async (filtros = {}) => {
  const page = Number(filtros.page || 1)
  const limit = Math.min(Number(filtros.limit || 20), 200)
  const skip = (page - 1) * limit

  const where = buildWhereAtivos(filtros)
  const orderBy = buildOrderByAtivos(filtros)

  const [total, rows] = await prisma.$transaction([
    prisma.ativo.count({ where }),
    prisma.ativo.findMany({
      where,
      skip,
      take: limit,
      orderBy: [orderBy]
    })
  ])

  return {
    items: rows.map(mapAtivo),
    meta: {
      page,
      limit,
      total,
      totalPages: limit > 0 ? Math.ceil(total / limit) : 1
    }
  }
}

/** Exporta até EXPORT_MAX_ROWS linhas com os mesmos filtros da listagem (sem paginação). */
exports.exportarAtivosCsv = async (filtros = {}) => {
  const where = buildWhereAtivos(filtros)
  const orderBy = buildOrderByAtivos(filtros)

  const rows = await prisma.ativo.findMany({
    where,
    orderBy: [orderBy],
    take: EXPORT_MAX_ROWS
  })
  const items = rows.map(mapAtivo)

  const header = [
    'nome',
    'numeroPatrimonio',
    'categoria',
    'marca',
    'modelo',
    'status',
    'registroAtivo',
    'setor',
    'localizacao',
    'responsavel',
    'atualizadoEm'
  ]
  const lines = [header.join(',')]
  for (const r of items) {
    lines.push(
      [
        csvEscape(r.nome),
        csvEscape(r.numeroPatrimonio),
        csvEscape(r.categoria),
        csvEscape(r.marca),
        csvEscape(r.modelo),
        csvEscape(r.status),
        csvEscape(r.ativo ? 'sim' : 'nao'),
        csvEscape(r.setor),
        csvEscape(r.localizacao),
        csvEscape(r.responsavel),
        csvEscape(r.atualizadoEm ? new Date(r.atualizadoEm).toISOString() : '')
      ].join(',')
    )
  }

  return {
    csv: lines.join('\n'),
    truncado: rows.length >= EXPORT_MAX_ROWS,
    total: rows.length
  }
}

exports.buscarAtivoPorId = async (id, { incluirInativos = false } = {}) => {
  const where = incluirInativos ? { id } : { id, ativo: true }
  const row = await prisma.ativo.findFirst({ where })
  return mapAtivo(row)
}

exports.buscarAtivoCompletoPorId = async (id) => {
  const row = await prisma.ativo.findFirst({ where: { id } })
  return mapAtivo(row)
}

async function buscarAtivoPorIdOuErro(id, { incluirInativos = true } = {}) {
  const row = await prisma.ativo.findFirst({
    where: incluirInativos ? { id } : { id, ativo: true }
  })
  if (!row) throw new AppError('Ativo não encontrado', 404)
  return row
}

exports.criarAtivo = async (dados) => {
  try {
    const criado = await prisma.ativo.create({
      data: {
        empresaId: dados.empresaId ?? null,
        nome: dados.nome,
        numeroPatrimonio: dados.numeroPatrimonio,
        numeroSerie: dados.numeroSerie ?? null,
        categoria: dados.categoria ?? null,
        marca: dados.marca ?? null,
        modelo: dados.modelo ?? null,
        descricao: dados.descricao ?? null,
        status: dados.status,
        setor: dados.setor ?? null,
        localizacao: dados.localizacao ?? null,
        responsavel: dados.responsavel ?? null,
        observacoes: dados.observacoes ?? null
      }
    })

    logger.audit('ativo.criado', { ativoId: criado.id })
    return mapAtivo(criado)
  } catch (err) {
    if (err.code === 'P2002') {
      throw new AppError('Já existe um ativo com este número de patrimônio', 409)
    }
    throw err
  }
}

exports.atualizarAtivo = async (id, dados) => {
  await buscarAtivoPorIdOuErro(id, { incluirInativos: true })

  const payload = {}
  if (dados.empresaId !== undefined) payload.empresaId = dados.empresaId
  if (dados.nome !== undefined) payload.nome = dados.nome
  if (dados.numeroPatrimonio !== undefined) payload.numeroPatrimonio = dados.numeroPatrimonio
  if (dados.numeroSerie !== undefined) payload.numeroSerie = dados.numeroSerie
  if (dados.categoria !== undefined) payload.categoria = dados.categoria
  if (dados.marca !== undefined) payload.marca = dados.marca
  if (dados.modelo !== undefined) payload.modelo = dados.modelo
  if (dados.descricao !== undefined) payload.descricao = dados.descricao
  if (dados.status !== undefined) payload.status = dados.status
  if (dados.setor !== undefined) payload.setor = dados.setor
  if (dados.localizacao !== undefined) payload.localizacao = dados.localizacao
  if (dados.responsavel !== undefined) payload.responsavel = dados.responsavel
  if (dados.observacoes !== undefined) payload.observacoes = dados.observacoes

  try {
    const atualizado = await prisma.ativo.update({
      where: { id },
      data: payload
    })

    logger.audit('ativo.atualizado', { ativoId: id })
    return mapAtivo(atualizado)
  } catch (err) {
    if (err.code === 'P2002') {
      throw new AppError('Já existe um ativo com este número de patrimônio', 409)
    }
    throw err
  }
}

exports.inativarAtivo = async (id) => {
  await buscarAtivoPorIdOuErro(id, { incluirInativos: true })
  const row = await prisma.ativo.update({
    where: { id },
    data: { ativo: false }
  })
  logger.audit('ativo.inativado', { ativoId: id })
  return mapAtivo(row)
}

/** Inativa vários registros ativos numa única operação (até 200 ids por pedido). */
exports.inativarAtivosEmMassa = async (ids) => {
  const unique = [...new Set((ids || []).filter((id) => typeof id === 'string' && id.trim()))]
  if (unique.length === 0) {
    return { alterados: 0, solicitados: 0 }
  }
  const result = await prisma.ativo.updateMany({
    where: { id: { in: unique }, ativo: true },
    data: { ativo: false }
  })
  if (result.count > 0) {
    logger.audit('ativo.inativar_massa', { alterados: result.count, solicitados: unique.length })
  }
  return { alterados: result.count, solicitados: unique.length }
}

exports.buscarParaEdicao = async (id) => {
  const row = await prisma.ativo.findFirst({ where: { id } })
  if (!row) return null
  return mapAtivo(row)
}

exports.calcularResumoAtivos = async () => {
  const [totalAtivosCadastrados, totalInativados] = await prisma.$transaction([
    prisma.ativo.count({ where: { ativo: true } }),
    prisma.ativo.count({ where: { ativo: false } })
  ])

  const porStatus = await prisma.ativo.groupBy({
    by: ['status'],
    where: { ativo: true },
    _count: { _all: true }
  })

  const counts = {}
  for (const s of STATUS_VALUES) {
    counts[s] = 0
  }

  for (const row of porStatus) {
    counts[row.status] = row._count._all
  }

  return {
    totalCadastrados: totalAtivosCadastrados,
    totalInativados,
    disponivel: counts.disponivel,
    emUso: counts.em_uso,
    emManutencao: counts.em_manutencao,
    danificado: counts.danificado,
    extraviado: counts.extraviado,
    baixado: counts.baixado
  }
}
