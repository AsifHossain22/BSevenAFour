import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { serviceService } from './service.service';
import AppError from '../../utils/appError';

// CreateService
const createService = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'Authentication token missing.',
    );
  }

  const result = await serviceService.createServiceInDB(req.body, userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Service created successfully!',
    data: result,
  });
});

// GetAllServices
const getAllServices = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const filters = req.query;
    const services = await serviceService.getAllServicesFromDB(filters);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Services fetched successfully!',
      data: services,
    });
  },
);

// GetAllTechnicians
const getAllTechnicians = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const filters = req.query;
    const technicians = await serviceService.getAllTechniciansFromDB(filters);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Technicians fetched successfully!',
      data: technicians,
    });
  },
);

// GetSingleTechnician
const getTechnicianById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const technician = await serviceService.getTechnicianByIdFromDB(
      id as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Technician profile fetched successfully!',
      data: technician,
    });
  },
);

export const serviceController = {
  createService,
  getAllServices,
  getAllTechnicians,
  getTechnicianById,
};
