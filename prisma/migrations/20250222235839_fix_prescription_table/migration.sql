/*
  Warnings:

  - You are about to drop the column `treatement_days` on the `prescriptions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "prescriptions" DROP COLUMN "treatement_days",
ADD COLUMN     "treatment_days" TEXT[];
