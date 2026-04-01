import jwt from 'jsonwebtoken';

const {
  ACCESS_TOKEN_EXPIRY = 600000,
  REFRESH_TOKEN_EXPIRY = 604800000,
  ACCESS_TOKEN_SECRET = 'access-token-secret',
  REFRESH_TOKEN_SECRET = 'refresh-token-secret',
} = process.env;

const generateTokens = async (userId: string): Promise<{
  accessToken: string;
  refreshToken: string;
}> => {
  const accessToken = jwt.sign(
    { _id: userId, type: 'access' },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY } as jwt.SignOptions,
  );

  const refreshToken = jwt.sign(
    { _id: userId },
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY } as jwt.SignOptions,
  );

  return { accessToken, refreshToken };
};

export default generateTokens;
