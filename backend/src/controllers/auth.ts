import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  CookieOptions, NextFunction, Request, Response,
} from 'express';

import mongoose from 'mongoose';
import ConflictError from '../errors/conflict-error';
import User from '../models/user';

import NotFoundError from '../errors/not-found-error';
import UnauthorizedError from '../errors/unauthorized-error';
import BadRequestError from '../errors/bad-request-error';
import generateTokens from '../utils/generateTokens';

const {
  REFRESH_TOKEN_EXPIRY = 604800000,
  REFRESH_TOKEN_SECRET = 'refresh-token-secret',
} = process.env;

// получение информации о текущем пользователе
export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { user } = req;

    if (!user) {
      next(new UnauthorizedError('Требуется авторизация'));
      return;
    }

    const userFromDB = await User.findById(user._id);

    if (!userFromDB) {
      next(new NotFoundError('Пользователь не найден'));
      return;
    }

    res.status(200).json({
      user: {
        name: userFromDB.name,
        email: userFromDB.email,
      },
      success: true,
    });
  } catch (error) {
    const err = error as { name?: string };

    if (err.name === 'CastError') {
      next(new BadRequestError('Некорректный формат ID пользователя'));
      return;
    }
    next(error);
  }
};

// аутентификация пользователя
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password +tokens');

    if (!user || !(await bcrypt.compare(password, user.password))) {
      next(new UnauthorizedError('Неверные учётные данные'));
      return;
    }

    const { accessToken, refreshToken } = await generateTokens(user._id.toString());

    user.tokens.push({ token: refreshToken });
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: REFRESH_TOKEN_EXPIRY,
      path: '/',
    } as CookieOptions);

    res.status(200).json({
      user: {
        name: user.name,
        email: user.email,
      },
      success: true,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

// регистрация пользователя
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      name: name || 'Ё-мое',
    });

    const { accessToken, refreshToken } = await generateTokens(newUser._id.toString());

    newUser.tokens.push({ token: refreshToken });
    await newUser.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: REFRESH_TOKEN_EXPIRY,
      path: '/',
    } as CookieOptions);

    res.status(201).json({
      user: {
        name: newUser.name,
        email: newUser.email,
      },
      success: true,
      accessToken,
    });
  } catch (error) {
    const err = error as { code?: number; name?: string };

    if (error instanceof mongoose.Error.ValidationError) {
      const errors = Object.values(error.errors).map((e) => e.message);
      next(new BadRequestError(`Ошибка валидации: ${errors.join(', ')}`));
      return;
    } if (err.code === 11000) {
      next(new ConflictError('Пользователь с таким email уже существует'));
      return;
    }
    next(error);
  }
};

// выход пользователя
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      next(new BadRequestError('Refresh-токен не предоставлен'));
      return;
    }

    let decoded: { _id: string };
    try {
      decoded = jwt.verify(
        refreshToken,
        REFRESH_TOKEN_SECRET,
      ) as { _id: string };
    } catch (error) {
      next(error);
      return;
    }

    const userId = decoded._id;

    if (!userId || typeof userId !== 'string') {
      next(new BadRequestError('Невалидный идентификатор пользователя'));
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      next(new NotFoundError('Пользователь не найден'));
      return;
    }

    await User.updateOne(
      { _id: userId },
      { $pull: { tokens: { token: refreshToken } } },
    );

    // Устанавливаем куку с истекшим сроком жизни (для удаления на стороне клиента)
    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
    });

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    const err = error as { name?: string };

    if (err.name === 'CastError') {
      next(new BadRequestError('Некорректный формат ID пользователя'));
      return;
    }
    next(error);
  }
};

// выпуск новой пары access- и refresh-токенов, получает httpOnly-куку c именем refreshToken
export const refreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      next(new UnauthorizedError('Refresh-токен не предоставлен'));
      return;
    }

    let decoded: { _id: string };
    try {
      decoded = jwt.verify(
        refreshToken,
        REFRESH_TOKEN_SECRET,
      ) as { _id: string };
    } catch (error) {
      next(error);
      return;
    }

    const userId = decoded._id;

    if (!userId || typeof userId !== 'string') {
      next(new UnauthorizedError('Невалидный идентификатор пользователя'));
      return;
    }

    const user = await User.findById(userId).select('+tokens');

    if (!user) {
      next(new UnauthorizedError('Пользователь не найден'));
      return;
    }

    // Проверяем, что refresh-токен присутствует в массиве токенов пользователя
    const tokenExists = user.tokens.some(
      (tokenObj: { token?: string | null }) => tokenObj.token === refreshToken,
    );

    if (!tokenExists) {
      next(new UnauthorizedError('Refresh-токен недействителен'));
      return;
    }

    const {
      accessToken,
      refreshToken: newRefreshToken,
    } = await generateTokens(user._id.toString());

    await User.updateOne(
      { _id: userId },
      { $pull: { tokens: { token: refreshToken } } },
    );
    user.tokens.push({ token: newRefreshToken });
    await user.save();

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: REFRESH_TOKEN_EXPIRY,
      path: '/',
    } as CookieOptions);

    res.status(200).json({
      user: {
        name: user.name,
        email: user.email,
      },
      success: true,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};
