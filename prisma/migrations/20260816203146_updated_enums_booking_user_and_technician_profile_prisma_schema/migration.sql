/*
  Warnings:

  - You are about to drop the column `pricePerHour` on the `technician_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `yearsOfExperience` on the `technician_profiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "technician_profiles" DROP COLUMN "pricePerHour",
DROP COLUMN "yearsOfExperience",
ADD COLUMN     "experience" INTEGER,
ADD COLUMN     "pricing" INTEGER;
