import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { adminService } from './admin.service';
import AppError from '../../utils/appError';

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.getAllUsers();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'All registered users retrieved successfully.',
    data: result,
  });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Please provide the user operational status.',
    );
  }

  const result = await adminService.updateUserStatus(id as string, status);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: `User status changed to ${status} successfully!`,
    data: result,
  });
});

const getAllBookings = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.getAllBookings();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'All booking retrieved successfully.',
    data: result,
  });
});

const createServiceCategory = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminService.createServiceCategoryInDB(req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: 'Service category created successfully!',
      data: result,
    });
  },
);

const getAllServiceCategories = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminService.getAllServiceCategoriesFromDB();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'All categories fetched successfully!',
      data: result,
    });
  },
);

export const adminController = {
  getAllUsers,
  updateUserStatus,
  getAllBookings,
  createServiceCategory,
  getAllServiceCategories,
};
