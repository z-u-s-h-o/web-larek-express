import { celebrate, Joi, Segments } from 'celebrate';

export const validateLogin = celebrate({
  [Segments.BODY]: Joi.object().keys({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        'string.email': 'Некорректный формат электронной почты',
        'any.required': 'Email обязателен'
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Пароль обязателен'
      })
  })
});