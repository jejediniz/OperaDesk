const Joi = require("joi");

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 120;

const emailRule = Joi.string()
  .email({ tlds: { allow: false } })
  .max(160)
  .lowercase()
  .trim();

const senhaRule = Joi.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH);

const registerSchema = Joi.object({
  nome: Joi.string().trim().min(2).max(120).required(),
  email: emailRule.required(),
  senha: senhaRule.required(),
  tipo: Joi.string().valid("comum", "ti").optional(),
  admin: Joi.boolean().optional(),
  ativo: Joi.boolean().optional()
});

const loginSchema = Joi.object({
  email: emailRule.required(),
  // login mantém min 6 para retrocompat com usuários já cadastrados;
  // a política nova vale para criação/atualização
  senha: Joi.string().min(6).max(MAX_PASSWORD_LENGTH).required()
});

module.exports = {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  loginSchema,
  registerSchema
};
