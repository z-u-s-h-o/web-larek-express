import { celebrate, Joi, Segments } from 'celebrate';

export const validateRegister = celebrate({
  [Segments.BODY]: Joi.object().keys({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        'string.email': 'Некорректный формат электронной почты',
        'any.required': 'Email обязателен'
      }),
    password: Joi.string()
      .min(6)
      .required()
      .messages({
        'string.min': 'Пароль должен содержать минимум 6 символов',
        'any.required': 'Пароль обязателен'
      }),
    name: Joi.string()
      .min(2)
      .max(30)
      .optional()
      .default('Ё-мое')
      .messages({
        'string.min': 'Имя должно содержать не менее 2 символов',
        'string.max': 'Имя должно содержать не более 30 символов'
      })
  })
});