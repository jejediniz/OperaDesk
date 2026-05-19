const Joi = require("joi");
const { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH } = require("./authSchemas");

const emailRule = Joi.string()
  .email({ tlds: { allow: false } })
  .max(160)
  .lowercase()
  .trim();

const senhaRule = Joi.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH);

const createUserSchema = Joi.object({
  nome: Joi.string().trim().min(2).max(120).required(),
  email: emailRule.required(),
  senha: senhaRule.required(),
  tipo: Joi.string().valid("comum", "ti").optional(),
  admin: Joi.boolean().optional(),
  ativo: Joi.boolean().optional()
});

const updateUserSchema = Joi.object({
  nome: Joi.string().trim().min(2).max(120).optional(),
  email: emailRule.optional(),
  senha: senhaRule.optional(),
  tipo: Joi.string().valid("comum", "ti").optional(),
  admin: Joi.boolean().optional(),
  ativo: Joi.boolean().optional()
}).min(1);

const changeOwnPasswordSchema = Joi.object({
  senhaAtual: senhaRule.required(),
  senhaNova: senhaRule.required()
});

module.exports = {
  changeOwnPasswordSchema,
  createUserSchema,
  updateUserSchema
};
