-- CreateTable
CREATE TABLE "prescriptions" (
    "id" TEXT NOT NULL,
    "medicalRecord" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "medicine" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "dose" DOUBLE PRECISION NOT NULL,
    "via" TEXT NOT NULL,
    "posology" TEXT NOT NULL,
    "posologyDays" TEXT[],

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);
