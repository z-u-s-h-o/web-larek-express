import winston from 'winston';
import expressWinston from 'express-winston';

// логгер запросов
export const requestLogger = expressWinston.logger({
  transports: [
    new winston.transports.File({
      filename: 'request.log',
      level: 'info',
    }),
  ],
  format: winston.format.json(),
  msg: 'HTTP {{req.method}} {{req.url}}',
  expressFormat: true,
});

// логгер ошибок
export const errorLogger = expressWinston.errorLogger({
  transports: [
    new winston.transports.File({
      filename: 'error.log',
      level: 'error',
    }),
  ],
  format: winston.format.json(),
});
