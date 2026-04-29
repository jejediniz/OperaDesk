const Joi = require('joi')

const STATUS_VALUES = [
  'disponivel',
  'em_uso',
  'em_manutencao',
  'danificado',
  'extraviado',
  'baixado'
]

const createAtivoSchema = Joi.object({
  empresaId: Joi.string().trim().max(64).allow(null, '').optional(),
  nome: Joi.string().trim().min(1).max(200).required(),
  numeroPatrimonio: Joi.string().trim().min(1).max(80).required(),
  numeroSerie: Joi.string().trim().max(120).allow(null, '').optional(),
  categoria: Joi.string().trim().max(120).allow(null, '').optional(),
  marca: Joi.string().trim().max(120).allow(null, '').optional(),
  modelo: Joi.string().trim().max(160).allow(null, '').optional(),
  descricao: Joi.string().trim().max(4000).allow(null, '').optional(),
  status: Joi.string()
    .valid(...STATUS_VALUES)
    .required(),
  setor: Joi.string().trim().max(120).allow(null, '').optional(),
  localizacao: Joi.string().trim().max(200).allow(null, '').optional(),
  responsavel: Joi.string().trim().max(160).allow(null, '').optional(),
  observacoes: Joi.string().trim().max(8000).allow(null, '').optional()
})

const updateAtivoSchema = Joi.object({
  empresaId: Joi.string().trim().max(64).allow(null),
  nome: Joi.string().trim().min(1).max(200),
  numeroPatrimonio: Joi.string().trim().min(1).max(80),
  numeroSerie: Joi.string().trim().max(120).allow(null, ''),
  categoria: Joi.string().trim().max(120).allow(null, ''),
  marca: Joi.string().trim().max(120).allow(null, ''),
  modelo: Joi.string().trim().max(160).allow(null, ''),
  descricao: Joi.string().trim().max(4000).allow(null, ''),
  status: Joi.string().valid(...STATUS_VALUES),
  setor: Joi.string().trim().max(120).allow(null, ''),
  localizacao: Joi.string().trim().max(200).allow(null, ''),
  responsavel: Joi.string().trim().max(160).allow(null, ''),
  observacoes: Joi.string().trim().max(8000).allow(null, '')
}).min(1)

const listAtivosQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(200).default(50),
  q: Joi.string().trim().max(160).optional().allow(''),
  status: Joi.string().valid(...STATUS_VALUES).optional(),
  categoria: Joi.string().trim().max(120).optional().allow(''),
  incluirInativos: Joi.alternatives()
    .try(Joi.boolean(), Joi.string().valid('true', 'false'))
    .optional(),
  somenteInativos: Joi.alternatives()
    .try(Joi.boolean(), Joi.string().valid('true', 'false'))
    .optional(),
  ordenar: Joi.string()
    .valid('nome', 'numeroPatrimonio', 'categoria', 'atualizadoEm', 'status')
    .default('atualizadoEm'),
  ordem: Joi.string().valid('asc', 'desc').default('desc')
})

const uuidParamSchema = Joi.object({
  id: Joi.string().uuid().required()
})

const bulkInativarAtivosSchema = Joi.object({
  ids: Joi.array().items(Joi.string().uuid()).min(1).max(200).required()
})

module.exports = {
  createAtivoSchema,
  updateAtivoSchema,
  listAtivosQuerySchema,
  uuidParamSchema,
  bulkInativarAtivosSchema,
  STATUS_VALUES
}
