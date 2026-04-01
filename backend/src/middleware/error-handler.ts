import { Request, Response } from 'express';
import ApiError from '../errors/api-error';

const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
): void => {
  // ошибка по умолчанию
  let statusCode = 500;
  let message = 'Internal Server Error';

  // если ошибка - экземпляр базового класса ApiError, берём statusCode и message из неё
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  res.status(statusCode).json({
    message,
  });
};

export default errorHandler;
