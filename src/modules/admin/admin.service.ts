import { prisma } from '../../lib/prisma';
import AppError from '../../utils/appError';
import httpStatus from 'http-status';

const getAllUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });
};

const updateUserStatus = async (id: string, status: any) => {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Target user record could not be found.',
    );
  }

  return await prisma.user.update({
    where: {
      id,
    },
    data: {
      status,
    },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
    },
  });
};

const getAllBookings = async () => {
  return await prisma.booking.findMany({
    include: {
      customer: {
        select: {
          name: true,
          email: true,
        },
      },
      service: {
        include: {
          technician: {
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
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

const createServiceCategoryInDB = async (payload: {
  name: string;
  description: string;
}) => {
  return await prisma.serviceCategory.create({
    data: {
      categoryName: payload.name,
      categoryDescription: payload.description,
    },
  });
};

const getAllServiceCategoriesFromDB = async () => {
  return await prisma.serviceCategory.findMany({
    orderBy: {
      categoryName: 'asc',
    },
  });
};

export const adminService = {
  getAllUsers,
  updateUserStatus,
  getAllBookings,
  createServiceCategoryInDB,
  getAllServiceCategoriesFromDB,
};
