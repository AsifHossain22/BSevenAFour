import { Request, Response } from 'express';
import { userService } from './user.service';
import httpStatus from 'http-status';

// RegisterUser
const registerUser = async (req: Request, res: Response) => {
  const payload = req.body;

  const user = await userService.registerUserIntoDB(payload);

  res.status(httpStatus.CREATED).json({
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'User registered successfully!',
    data: {
      user,
    },
  });
};

export const userController = {
  registerUser,
};
