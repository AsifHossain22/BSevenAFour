import { prisma } from '../../lib/prisma';
import { UserRole } from '../../../generated/prisma/enums';

// GetAllServices
const getAllServices = async (filters: any) => {
  const { type, location, rating, minPrice, maxPrice } = filters;

  // const whereConditions: any = {
  //   role: UserRole.TECHNICIAN,
  //   status: 'ACTIVE',
  // };

  const whereConditions: any = {};

  if (type) {
    whereConditions.categoryId = type;
  }

  // Filtering
  if (location || rating) {
    whereConditions.technicianProfile = {
      user: location
        ? {
            location: {
              contains: location,
              mode: 'insensitive',
            },
          }
        : undefined,
      rating: rating
        ? {
            gte: parseInt(rating),
          }
        : undefined,
    };
  }

  if (minPrice || maxPrice) {
    whereConditions.price = {
      gte: minPrice ? parseInt(minPrice) : undefined,
      lte: maxPrice ? parseInt(maxPrice) : undefined,
    };
  }

  return await prisma.service.findMany({
    where: whereConditions,
    include: {
      category: true,
      technicianProfile: {
        include: {
          user: {
            omit: {
              password: true,
            },
          },
        },
      },
    },
  });
};

// GetAllTechnicians
const getAllTechnicians = async (filters: any) => {
  const { location, rating } = filters;
  const whereConditions: any = {
    role: UserRole.TECHNICIAN,
    status: 'ACTIVE',
  };

  if (location) {
    whereConditions.location = { contains: location, mode: 'insensitive' };
  }

  if (rating) {
    whereConditions.technicianProfile = {
      averageRating: { gte: parseInt(rating) },
    };
  }

  // Filtering
  return await prisma.user.findMany({
    where: whereConditions,
    omit: { password: true },
    include: {
      technicianProfile: true,
    },
  });
};

// GetTechnicianById
const getTechnicianById = async (id: string) => {
  return await prisma.user.findUniqueOrThrow({
    where: {
      id,
      role: UserRole.TECHNICIAN,
    },
    omit: { password: true },
    include: {
      technicianProfile: {
        include: {
          services: true,
          reviews: {
            include: {
              customer: { select: { name: true, email: true } },
            },
          },
        },
      },
    },
  });
};

export const serviceService = {
  getAllServices,
  getAllTechnicians,
  getTechnicianById,
};
