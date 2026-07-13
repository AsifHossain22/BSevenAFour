import bcrypt from 'bcryptjs';
import config from '../../config';
import { prisma } from '../../lib/prisma';
import { LoginUserPayload, RegisterUserPayload } from './auth.interface';
import { jwtUtils } from '../../utils/jwt';
import { UserRole } from '../../../generated/prisma/enums';
import AppError from '../../utils/appError';
import httpStatus from 'http-status';

const registerUser = async (payload: RegisterUserPayload) => {
  const { name, email, password, role } = payload;

  const isUserExist = await prisma.user.findUnique({
    where: { email },
  });

  if (isUserExist) {
    throw new Error('User with this email already exists.');
  }

  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  const createdUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,

      technicianProfile:
        role === UserRole.TECHNICIAN
          ? {
              create: {
                bio: 'New technician profile.',
                yearsOfExperience: 0,
                pricePerHour: 0,
              },
            }
          : undefined,
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: createdUser.id },
    omit: { password: true },
  });

  return user;
};

const loginUser = async (payload: LoginUserPayload) => {
  const { email, password } = payload;

  // FindUser
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid email or password.');
  }

  // AccountValidation
  if (user.status === 'BANNED' || user.status === 'BLOCKED') {
    throw new Error('Your account has been deactivated by ADMIN!');
  }

  // VerifyPassword
  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (!isPasswordMatched) {
    throw new Error('Invalid email or password!');
  }

  // AccessToken
  const accessToken = jwtUtils.createToken(
    { id: user.id, email: user.email, role: user.role },
    config.jwt_access_secret as string,
    config.jwt_access_expires_in || '1d',
  );

  // AccessToken
  const refreshToken = jwtUtils.createToken(
    { id: user.id, email: user.email, role: user.role },
    config.jwt_refresh_secret as string,
    config.jwt_access_expires_in || '7d',
  );

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

const getMeFromDB = async (userId: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    omit: { password: true },
  });

  return user;
};

export const authService = {
  registerUser,
  loginUser,
  getMeFromDB,
};
