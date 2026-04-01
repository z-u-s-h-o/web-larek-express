import { faker } from '@faker-js/faker';
import { Request, Response, NextFunction } from 'express';

import Product from '../models/product';

import BadRequestError from '../errors/bad-request-error';

// создаёт заказ
const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const {
      total, items,
    } = req.body;

    const productIds: string[] = items
      .map((id: string) => id.trim())
      .filter((id: string) => id.length > 0);

    if (productIds.length === 0) {
      next(new BadRequestError('В списке товаров не указаны корректные ID товаров'));
      return;
    }

    // получаем товары из базы данных: ищем по ID, отбираем только товары где есть цена
    const products = await Product.find({
      _id: { $in: productIds },
      price: { $ne: null },
    }).select('price');

    // проверяем, что все запрошенные товары существуют и доступны для продажи
    if (products.length !== productIds.length) {
      next(new BadRequestError('Один или несколько товаров не существуют либо недоступны для продажи'));
      return;
    }

    const calculatedTotal = products.reduce((sum, product) => sum + (product.price || 0), 0);

    if (calculatedTotal !== total) {
      next(new BadRequestError(`Несоответствие общей суммы. Ожидалось ${calculatedTotal}, получено ${total}`));
      return;
    }
    const orderId = faker.string.uuid();

    res.status(201).json({
      id: orderId,
      total,
    });
  } catch (error) {
    next(error);
  }
};

export default createOrder;
