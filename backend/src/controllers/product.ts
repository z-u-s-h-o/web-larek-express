import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';

import Product from '../models/product';

import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';
import NotFoundError from '../errors/not-found-error';
import moveFileFromTemp from '../utils/file-mover';

// возвращает все товары
export const getProducts = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const products = await Product.find({});

    res.status(200).json({
      items: products,
      total: products.length,
    });
  } catch (error) {
    next(error);
  }
};

// создаёт товар
export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // cоздаём копию, чтобы не мутировать оригинал
    const createData = { ...req.body };

    if (createData.image && createData.image.fileName) {
      const tempPath = createData.image.fileName;
      const finalPath = createData.image.originalName;

      try {
        // перемещаем загруженный во временную директорию файл в финальную
        await moveFileFromTemp(tempPath, finalPath);
        createData.image.fileName = finalPath;
      } catch (error) {
        next(error);
        return;
      }
    }

    const newProduct = await Product.create(createData);

    res.status(201).json(newProduct);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      const errors = Object.values(error.errors).map((err) => err.message);
      next(new BadRequestError(`Ошибка валидации: ${errors.join(', ')}`));
      return;
    } if (error instanceof Error && error.message.includes('E11000')) {
      next(new ConflictError('Товар с таким названием уже существует'));
      return;
    }
    next(error);
  }
};

// обновляет товар
export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { productId } = req.params;
    // cоздаём копию, чтобы не мутировать оригинал
    const updateData = { ...req.body };

    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      next(new NotFoundError('Товар не найден'));
      return;
    }

    if (updateData.image && updateData.image.fileName) {
      const tempPath = updateData.image.fileName;
      const finalPath = updateData.image.originalName;

      try {
        await moveFileFromTemp(tempPath, finalPath);
        updateData.image.fileName = finalPath;
      } catch (error) {
        next(error);
        return;
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updateData,
      { new: true, runValidators: true },
    );

    if (!updatedProduct) {
      next(new NotFoundError('Товар не найден после обновления'));
      return;
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      const errors = Object.values(error.errors).map((err) => err.message);
      next(new BadRequestError(`Ошибка валидации: ${errors.join(', ')}`));
    } else {
      next(error);
    }
  }
};

// удаляет товар
export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { productId } = req.params;

    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      next(new NotFoundError('Товар не найден'));
      return;
    }

    res.status(200).json(deletedProduct);
  } catch (error) {
    next(error);
  }
};
