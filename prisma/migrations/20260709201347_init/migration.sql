/*
  Warnings:

  - The values [REJECTED,CANCELLED] on the enum `BookingStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `bookingDate` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `technicianId` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `feedback` on the `reviews` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `profiles` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `timeSlot` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `comment` to the `reviews` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `services` table without a default value. This is not possible if the table is not empty.
  - Added the required column `techProfileId` to the `services` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `services` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BookingStatus_new" AS ENUM ('REQUESTED', 'ACCEPTED', 'DECLINED', 'PAID', 'IN_PROGRESS', 'COMPLETED');
ALTER TABLE "public"."bookings" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "bookings" ALTER COLUMN "status" TYPE "BookingStatus_new" USING ("status"::text::"BookingStatus_new");
ALTER TYPE "BookingStatus" RENAME TO "BookingStatus_old";
ALTER TYPE "BookingStatus_new" RENAME TO "BookingStatus";
DROP TYPE "public"."BookingStatus_old";
ALTER TABLE "bookings" ALTER COLUMN "status" SET DEFAULT 'REQUESTED';
COMMIT;

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_customerId_fkey";

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_technicianId_fkey";

-- DropForeignKey
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_userId_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_customerId_fkey";

-- DropForeignKey
ALTER TABLE "services" DROP CONSTRAINT "services_categoryId_fkey";

-- DropIndex
DROP INDEX "reviews_bookingId_key";

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "bookingDate",
DROP COLUMN "technicianId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "timeSlot" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "reviews" DROP COLUMN "feedback",
ADD COLUMN     "comment" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "techProfileId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "status",
ADD COLUMN     "isBanned" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "role" DROP DEFAULT;

-- DropTable
DROP TABLE "categories";

-- DropTable
DROP TABLE "profiles";

-- DropEnum
DROP TYPE "UserStatus";

-- CreateTable
CREATE TABLE "serviceCategories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "serviceCategories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technicianProfiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skills" TEXT[],
    "yearsOfExperience" INTEGER NOT NULL,
    "pricePerHour" DECIMAL(65,30) NOT NULL,
    "bio" TEXT,
    "location" TEXT NOT NULL,
    "availability" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "technicianProfiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "serviceCategories_name_key" ON "serviceCategories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "serviceCategories_slug_key" ON "serviceCategories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "technicianProfiles_userId_key" ON "technicianProfiles"("userId");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "serviceCategories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_techProfileId_fkey" FOREIGN KEY ("techProfileId") REFERENCES "technicianProfiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technicianProfiles" ADD CONSTRAINT "technicianProfiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
