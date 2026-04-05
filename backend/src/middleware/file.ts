import multer from 'multer';
import path from 'path';
import fs from 'fs';
import type { Request } from 'express';

import MulterFile from '../types/multer';

const {
  UPLOAD_PATH_TEMP = 'temp',
} = process.env;

const tempDir = path.join(process.cwd(), UPLOAD_PATH_TEMP);

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// настройка хранилища для библиотеки Multer
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, tempDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const extension = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${extension}`);
  },
});

const allowedMimes = [
  'image/png',
  'image/jpg',
  'image/jpeg',
  'image/gif',
  'image/svg+xml',
];

const fileFilter = (
  _req: Request,
  file: MulterFile,
  cb: multer.FileFilterCallback,
) => {
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Недопустимый тип файла'));
  }
};

const uploadSingleFile = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
}).single('file');

export default uploadSingleFile;
