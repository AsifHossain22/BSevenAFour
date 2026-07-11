import { prisma } from '../../lib/prisma';

// CreateCategory
const createCategoryInDB = async (name: string) => {
  return await prisma.serviceCategory.create({
    data: {
      name,
    },
  });
};

// GetAllCategories
const getAllCategoriesFromDB = async () => {
  return await prisma.serviceCategory.findMany({
    include: {
      _count: {
        select: { services: true },
      },
    },
  });
};

export const categoryService = {
  createCategoryInDB,
  getAllCategoriesFromDB,
};
