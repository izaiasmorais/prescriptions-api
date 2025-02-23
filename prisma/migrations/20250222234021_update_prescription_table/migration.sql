/*
  Warnings:

  - You are about to drop the column `medicalRecord` on the `prescriptions` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `prescriptions` table. All the data in the column will be lost.
  - You are about to drop the column `posologyDays` on the `prescriptions` table. All the data in the column will be lost.
  - Added the required column `medical_record` to the `prescriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patient_name` to the `prescriptions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "prescriptions" DROP COLUMN "medicalRecord",
DROP COLUMN "name",
DROP COLUMN "posologyDays",
ADD COLUMN     "medical_record" TEXT NOT NULL,
ADD COLUMN     "patient_name" TEXT NOT NULL,
ADD COLUMN     "posology_days" TEXT[],
ALTER COLUMN "dose" SET DATA TYPE TEXT;
