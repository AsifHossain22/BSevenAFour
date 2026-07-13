import { prisma } from '../../lib/prisma';

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
  createServiceCategoryInDB,
  getAllServiceCategoriesFromDB,
};
