import Joi from 'joi';

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const taskSchema = Joi.object({
  title: Joi.string().required().max(200),
  description: Joi.string().optional().allow(null, ''),
  effortDays: Joi.number().integer().positive().optional().allow(null),
  dueDate: Joi.date().iso().required()
});

const updateTaskSchema = Joi.object({
  title: Joi.string().optional().max(200),
  description: Joi.string().optional().allow(null, ''),
  effortDays: Joi.number().integer().positive().optional().allow(null),
  dueDate: Joi.date().iso().optional()
});

export {
  registerSchema,
  loginSchema,
  taskSchema,
  updateTaskSchema
};