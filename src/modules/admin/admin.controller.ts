import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { adminService } from './admin.service';

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
  createServiceCategory,
  getAllServiceCategories,
};
