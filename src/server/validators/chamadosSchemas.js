const Joi = require("joi");

const STATUS_VALUES = ["aberto", "em_andamento", "concluido", "fechado"];
const PRIORIDADE_VALUES = ["baixa", "media", "alta"];

const createChamadoSchema = Joi.object({
  titulo: Joi.string().trim().min(3).max(200).required(),
  descricao: Joi.string().trim().min(3).max(2000).required(),
  prioridade: Joi.string()
    .valid(...PRIORIDADE_VALUES)
    .optional(),
  tecnicoId: Joi.number().integer().min(1).optional(),
  setor: Joi.string().trim().min(2).max(120).optional()
});

const updateChamadoSchema = Joi.object({
  titulo: Joi.string().trim().min(3).max(200).optional(),
  descricao: Joi.string().trim().min(3).max(2000).optional(),
  prioridade: Joi.string()
    .valid(...PRIORIDADE_VALUES)
    .optional(),
  status: Joi.string()
    .valid(...STATUS_VALUES)
    .optional(),
  tecnicoId: Joi.number().integer().min(1).allow(null).optional(),
  setor: Joi.string().trim().min(2).max(120).optional()
}).min(1);

const listChamadosQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(200).default(20),
  status: Joi.string()
    .valid(...STATUS_VALUES)
    .optional(),
  prioridade: Joi.string()
    .valid(...PRIORIDADE_VALUES)
    .optional(),
  usuarioId: Joi.number().integer().min(1).optional(),
  tecnicoId: Joi.alternatives()
    .try(Joi.number().integer().min(1), Joi.string().valid("me", "sem"))
    .optional(),
  q: Joi.string().trim().max(160).optional()
});

const createChamadoInteracaoSchema = Joi.object({
  mensagem: Joi.string().trim().min(1).max(4000).required(),
  tipo: Joi.string().valid("publica", "interna").default("publica")
});

module.exports = {
  PRIORIDADE_VALUES,
  STATUS_VALUES,
  createChamadoInteracaoSchema,
  createChamadoSchema,
  listChamadosQuerySchema,
  updateChamadoSchema
};
