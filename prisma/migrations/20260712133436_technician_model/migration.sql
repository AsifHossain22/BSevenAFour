/*
  Warnings:

  - You are about to drop the `service_ategories` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "services" DROP CONSTRAINT "services_categoryId_fkey";

-- AlterTable
ALTER TABLE "technician_profiles" ADD COLUMN     "availabilitySlots" TEXT[];

-- DropTable
DROP TABLE "service_ategories";

-- CreateTable
CREATE TABLE "service_categories" (
    "id" TEXT NOT NULL,
    "categoryName" TEXT NOT NULL,
    "categoryDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "service_categories_categoryName_key" ON "service_categories"("categoryName");

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "service_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
