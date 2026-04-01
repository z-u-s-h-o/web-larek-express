import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import cookieParser from 'cookie-parser';

import productRoutes from './routes/product';
import orderRoutes from './routes/order';
import authRoutes from './routes/auth';
import uploadRouter from './routes/upload';

import errorHandler from './middleware/error-handler';
import { requestLogger, errorLogger } from './middleware/logger';
import NotFoundError from './errors/not-found-error';

import cleanupOldFiles from './utils/cleanup';

const { 
  PORT = 3000, 
  DB_ADDRESS = 'mongodb://127.0.0.1:27017/weblarek' 
} = process.env;

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(requestLogger);
app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

(async () => {
  try {
    await mongoose.connect(DB_ADDRESS);
  } catch (error) {
    throw new Error('Ошибка подключения к базе данных');
  }
})();

app.use('/product', productRoutes);
app.use('/order', orderRoutes);
app.use('/auth', authRoutes);
app.use('/upload', uploadRouter);

// обработка на несуществующие маршруты
app.use('*', (req, res, next) => {
  next(new NotFoundError('Маршрут не найден'));
});

app.use(errorLogger);
app.use(errorHandler);

app.listen(PORT, () => {
  cleanupOldFiles();
});