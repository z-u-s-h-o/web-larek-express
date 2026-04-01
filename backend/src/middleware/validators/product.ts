import { celebrate, Joi, Segments } from 'celebrate';

export const validateProduct = celebrate({
  [Segments.BODY]: Joi.object().keys({
    title: Joi.string()
      .min(2)
      .max(30)
      .messages({
        'string.base': 'Название товара должно быть строкой',
        'string.min': 'Название товара должно содержать не менее 2 символов',
        'string.max': 'Название товара должно содержать не более 30 символов'
      }),
    image: Joi.object().keys({
      fileName: Joi.string().required().messages({
        'string.base': 'Имя файла изображения должно быть строкой',
        'any.required': 'Имя файла обязательно'
      }),
      originalName: Joi.string().required().messages({
        'string.base': 'Оригинальное имя файла должно быть строкой',
        'any.required': 'Оригинальное имя файла обязательно'
      })
    }).optional().messages({
      'object.base': 'Изображение должно быть объектом'
    }),
    category: Joi.string().messages({
      'string.base': 'Категория должна быть строкой'
    }),
    description: Joi.string(),
    price: Joi.number().allow(null).min(0).messages({
      'number.base': 'Цена должна быть числом',
      'number.min': 'Цена не может быть отрицательной'
    })
  }).min(1) // хотя бы одно поле для обновления
});

export const validateProductId = celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    productId: Joi.string().hex().required().messages({
      'string.hex': 'ID товара должен быть валидной hex-строкой',
      'any.required': 'ID товара обязателен'
    })
  })
});