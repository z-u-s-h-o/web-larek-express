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
    const {
      title, image, category, description, price,
    } = req.body;

    if (image && image.fileName) {
      const tempPath = image.fileName;
      const finalPath = image.originalName;

      try {
        // перемещаем загруженный во временную директорию файл в финальную
        await moveFileFromTemp(tempPath, finalPath);
        image.fileName = finalPath;
      } catch (error) {
        next(error);
        return;
      }
    }

    const newProduct = await Product.create({
      title,
      image,
      category,
      description,
      price,
    });

    res.status(201).json(newProduct);
  } catch (error) {
    const err = error as { code?: number};

    if (error instanceof mongoose.Error.ValidationError) {
      const errors = Object.values(error.errors).map((e) => e.message);
      next(new BadRequestError(`Ошибка валидации: ${errors.join(', ')}`));
      return;
    } if (err.code === 11000) {
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
    const {
      title, image, category, description, price,
    } = req.body;

    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      next(new NotFoundError('Товар не найден'));
      return;
    }

    if (image && image.fileName) {
      const tempPath = image.fileName;
      const finalPath = image.originalName;

      try {
        await moveFileFromTemp(tempPath, finalPath);
        image.fileName = finalPath;
      } catch (error) {
        next(error);
        return;
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        title,
        image,
        category,
        description,
        price,
      },
      { new: true, runValidators: true },
    );

    if (!updatedProduct) {
      next(new NotFoundError('Товар не найден после обновления'));
      return;
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    const err = error as { code?: number; name?: string };
    if (error instanceof mongoose.Error.ValidationError) {
      const errors = Object.values(error.errors).map((e) => e.message);
      next(new BadRequestError(`Ошибка валидации: ${errors.join(', ')}`));
    } if (err.code === 11000) {
      next(new ConflictError('Товар с таким названием уже существует'));
      return;
    } if (err.name === 'CastError') {
      next(new BadRequestError('Некорректный ID товара'));
      return;
    }
    next(error);
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
    const err = error as {name?: string };
    if (err.name === 'CastError') {
      next(new BadRequestError('Некорректный ID товара'));
      return;
    }
    next(error);
  }
};
