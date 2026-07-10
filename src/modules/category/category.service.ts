import { prisma } from '../../lib/prisma';

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
  getAllCategoriesFromDB,
};
