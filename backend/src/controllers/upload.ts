import { Request, Response, NextFunction } from 'express';
import MulterFile from '../types/multer';

import BadRequestError from '../errors/bad-request-error';

const handleFileUpload = (
  req: Request & { file?: MulterFile },
  res: Response,
  next: NextFunction,
): void => {
  try {
    if (!req.file) {
      next(new BadRequestError('Файл не загружен'));
      return;
    }

    const response = {
      fileName: req.file.filename,
      originalName: req.file.originalname,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export default handleFileUpload;
