import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { serviceService } from './service.service';

// GetAllServices
const getAllServices = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const filters = req.query;
    const services = await serviceService.getAllServices(filters);

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
    const technicians = await serviceService.getAllTechnicians(filters);

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
    const technician = await serviceService.getTechnicianById(id as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Technician profile fetched successfully!',
      data: technician,
    });
  },
);

export const serviceController = {
  getAllServices,
  getAllTechnicians,
  getTechnicianById,
};
