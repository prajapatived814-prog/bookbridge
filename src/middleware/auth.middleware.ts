import { Request, Response, NextFunction } from 'express';
import { JWTService } from '../auth/jwt.service';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { RoleType } from '../models/types';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: RoleType;
  };
}

export const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // For public endpoints where token is optional, proceed without error
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = JWTService.verify(token);
    req.user = decoded;
    next();
  } catch (err) {
    next(new UnauthorizedError('Invalid or expired authentication token'));
  }
};

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication token is required to access this endpoint'));
  }
  next();
};

export const requireRoles = (...roles: RoleType[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError(`Access denied. Requires one of roles: ${roles.join(', ')}`));
    }
    next();
  };
};
