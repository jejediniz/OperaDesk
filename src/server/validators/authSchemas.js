const Joi = require('joi')

const emailRule = Joi.string().email({ tlds: { allow: false } }).max(160)

const registerSchema = Joi.object({
  nome: Joi.string().min(2).max(120).required(),
  email: emailRule.required(),
  senha: Joi.string().min(6).max(120).required(),
  tipo: Joi.string().valid('comum', 'ti').optional(),
  admin: Joi.boolean().optional(),
  ativo: Joi.boolean().optional()
})

const loginSchema = Joi.object({
  email: emailRule.required(),
  senha: Joi.string().min(6).max(120).required()
})

module.exports = {
  registerSchema,
  loginSchema
}
