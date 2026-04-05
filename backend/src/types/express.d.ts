import { JwtPayload } from 'jsonwebtoken';

interface UserJwtPayload extends JwtPayload {
  _id: string;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserJwtPayload;
    }
  }
}
