const Joi = require('joi')

const createUserSchema = Joi.object({
  nome: Joi.string().min(2).max(120).required(),
  email: Joi.string().email().max(160).required(),
  senha: Joi.string().min(6).max(120).required(),
  tipo: Joi.string().valid('comum', 'ti').optional(),
  admin: Joi.boolean().optional(),
  ativo: Joi.boolean().optional()
})

const updateUserSchema = Joi.object({
  nome: Joi.string().min(2).max(120).optional(),
  email: Joi.string().email().max(160).optional(),
  senha: Joi.string().min(6).max(120).optional(),
  tipo: Joi.string().valid('comum', 'ti').optional(),
  admin: Joi.boolean().optional(),
  ativo: Joi.boolean().optional()
})

module.exports = {
  createUserSchema,
  updateUserSchema
}
