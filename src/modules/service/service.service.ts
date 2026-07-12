import { prisma } from '../../lib/prisma';
import httpStatus from 'http-status';
import AppError from '../../utils/appError';

// GetAllServices
const getAllServicesFromDB = async (filters: any) => {
  const { search, categoryId, location, rating } = filters;
  const andConditions: any[] = [];

  if (search) {
    andConditions.push({
      OR: [
        {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ],
    });
  }

  if (categoryId) andConditions.push({ categoryId });

  if (location)
    andConditions.push({
      location: {
        contains: location,
        mode: 'insensitive',
      },
    });

  if (rating)
    andConditions.push({
      rating: {
        gte: parseInt(rating),
      },
    });

  const whereConditions =
    andConditions.length > 0
      ? {
          AND: andConditions,
        }
      : {};

  return await prisma.service.findMany({
    where: whereConditions,
    include: {
      category: true,
      technicianProfile: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });
};

// GetAllTechnicians
const getAllTechniciansFromDB = async (payload: any) => {
  const { skill } = payload;
  const andConditions: any[] = [];

  if (skill) {
    andConditions.push({
      skills: {
        has: skill,
      },
    });
  }

  const whereConditions =
    andConditions.length > 0
      ? {
          AND: andConditions,
        }
      : {};

  return await prisma.technicianProfile.findMany({
    where: whereConditions,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
        },
      },
    },
  });
};

// GetTechnicianById
const getTechnicianByIdFromDB = async (id: string) => {
  const result = await prisma.technicianProfile.findUnique({
    where: {
      id,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      services: true,
      bookings: {
        include: {
          reviews: {
            include: {
              customer: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!result) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Requested technician profile does not exist.',
    );
  }

  return result;
};

export const serviceService = {
  getAllServicesFromDB,
  getAllTechniciansFromDB,
  getTechnicianByIdFromDB,
};
