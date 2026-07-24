import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.config';
import { RoleType } from '../models/types';

export interface TokenPayload {
  userId: string;
  email: string;
  role: RoleType;
}

export const JWTService = {
  sign(payload: TokenPayload): string {
    return jwt.sign(payload, ENV.JWT_SECRET, {
      expiresIn: ENV.JWT_EXPIRES_IN,
    });
  },

  verify(token: string): TokenPayload {
    return jwt.verify(token, ENV.JWT_SECRET) as TokenPayload;
  }
};
