import { NextFunction, Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import httpStatus from 'http-status';
import { UserRole } from '../../generated/prisma/enums';
import config from '../config';
import { prisma } from '../lib/prisma';
import { catchAsync } from '../utils/catchAsync';
import { jwtUtils } from '../utils/jwt';
import AppError from '../utils/appError';

declare global {
  namespace Express {
    interface Request {
      user?: {
        email: string;
        name: string;
        id: string;
        role: UserRole;
      };
    }
  }
}

export const auth = (...requiredRoles: UserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.accessToken
      ? req.cookies.accessToken
      : req.headers.authorization?.startsWith('Bearer')
        ? req.headers.authorization?.split(' ')[1]
        : req.headers.authorization;

    if (!token) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        'You are not logged in. Please log in to access this resource.',
      );
    }

    const verifiedToken = jwtUtils.verifyToken(
      token,
      config.jwt_access_secret as string,
    );

    if (!verifiedToken.success || !verifiedToken.data) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        verifiedToken.error || 'Token validation failed.',
      );
    }

    const { email, id, role } = verifiedToken.data as JwtPayload;

    if (requiredRoles.length && !requiredRoles.includes(role as UserRole)) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Forbidden. You don't have permission to access this resource.",
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id,
        email,
        role: role as UserRole,
      },
    });

    if (!user) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        'User not found. Please log in again.',
      );
    }

    if (user.status === 'BLOCKED') {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'Your account has been blocked. Please contact support.',
      );
    }

    req.user = {
      email,
      name: user.name,
      id: user.id,
      role: user.role,
    };

    next();
  });
};
