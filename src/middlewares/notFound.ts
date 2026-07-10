import { Request, Response } from 'express';
import httpStatus from 'http-status';

export const notFound = (req: Request, res: Response) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: 'Route not found',
    errorDetails: `The path '${req.originalUrl}' does not exist on this server.`,
  });
};
