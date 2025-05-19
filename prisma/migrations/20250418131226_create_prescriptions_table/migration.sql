-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescriptions" (
    "id" TEXT NOT NULL,
    "medical_record" TEXT NOT NULL,
    "patient_name" TEXT NOT NULL,
    "medicine" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "dose" TEXT NOT NULL,
    "via" TEXT NOT NULL,
    "posology" TEXT NOT NULL,
    "treatment_days" TIMESTAMP(3)[],

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
