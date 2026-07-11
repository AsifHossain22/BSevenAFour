import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { categoryService } from './category.service';

// CreateCategory
const createCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.body;

    const result = await categoryService.createCategoryInDB(name);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: 'Category created successfully!',
      data: result,
    });
  },
);

// GetAllCategories
const getAllCategories = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const categories = await categoryService.getAllCategoriesFromDB();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Service categories fetched successfully!',
      data: categories,
    });
  },
);

export const categoryController = {
  createCategory,
  getAllCategories,
};
