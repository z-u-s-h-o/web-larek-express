import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import UnauthorizedError from '../errors/unauthorized-error';

const { ACCESS_TOKEN_SECRET = 'access-token-secret' } = process.env;

interface UserJwtPayload extends JwtPayload {
  _id: string;
  iat?: number;
  exp?: number;
}

export default (req: Request, _res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    next(new UnauthorizedError('Требуется авторизация'));
    return;
  }

  const token = authorization.replace('Bearer ', '').trim();

  let payload: UserJwtPayload | undefined;

  try {
    payload = jwt.verify(token, ACCESS_TOKEN_SECRET) as UserJwtPayload;

    if (!payload._id) {
      next(new UnauthorizedError('Требуется авторизация'));
      return;
    }
  } catch (error) {
    next(new UnauthorizedError('Требуется авторизация'));
    return;
  }

  req.user = payload;
  next();
};
