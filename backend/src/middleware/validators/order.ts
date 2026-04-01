import { celebrate, Joi, Segments } from 'celebrate';

export const validateOrder = celebrate({
  [Segments.BODY]: Joi.object().keys({
    payment: Joi.string().valid('card', 'online').required().messages({
      'any.only': 'Недопустимый способ оплаты. Допустимые значения: card, online',
      'any.required': 'Способ оплаты обязателен'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Некорректный формат электронной почты',
      'any.required': 'Email обязателен'
    }),
    phone: Joi.string().min(5).required().messages({
      'string.min': 'Номер телефона должен содержать не менее 5 символов',
      'any.required': 'Телефон обязателен'
    }),
    address: Joi.string().min(1).required().messages({
      'string.empty': 'Адрес не может быть пустым',
      'any.required': 'Адрес обязателен'
    }),
    total: Joi.number().positive().required().messages({
      'number.positive': 'Общая сумма должна быть положительной',
      'any.required': 'Общая сумма обязательна'
    }),
    items: Joi.array().items(Joi.string().hex().length(24)).min(1).required().messages({
      'array.includes': 'Каждый ID товара должен быть валидным MongoDB ID',
      'array.min': 'Массив товаров не может быть пустым',
      'any.required': 'Массив товаров обязателен'
    })
  })
});