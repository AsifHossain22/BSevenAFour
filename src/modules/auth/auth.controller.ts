import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { authService } from './auth.service';

const registerUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const user = await authService.registerUser(payload);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: 'User registered successfully!',
      data: { user },
    });
  },
);

const loginUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const result = await authService.loginUser(payload);

    const { user, accessToken, refreshToken } = result;

    // AccessToken
    res.cookie('accessToken', result.accessToken, {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    });

    // RefreshToken
    res.cookie('refreshToken', result.refreshToken, {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    });

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'User logged in successfully!',
      data: {
        user,
        accessToken,
        refreshToken,
      },
    });
  },
);

const getMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;
    const profile = await authService.getMeFromDB(userId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Current authenticated user retrieved successfully!',
      data: { profile },
    });
  },
);

export const authController = {
  registerUser,
  loginUser,
  getMe,
};
