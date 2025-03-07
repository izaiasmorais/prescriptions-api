/*
  Warnings:

  - The `treatment_days` column on the `prescriptions` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "prescriptions" DROP COLUMN "treatment_days",
ADD COLUMN     "treatment_days" TIMESTAMP(3)[];
