/*
  Warnings:

  - You are about to drop the column `posology_days` on the `prescriptions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "prescriptions" DROP COLUMN "posology_days",
ADD COLUMN     "treatement_days" TEXT[];
