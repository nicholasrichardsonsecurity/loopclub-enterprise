-- CreateEnum
CREATE TYPE "CustomerStatus" AS ENUM ('active', 'inactive', 'deleted');

-- CreateEnum
CREATE TYPE "CompanyCustomerStatus" AS ENUM ('active', 'inactive', 'blocked');

-- CreateEnum
CREATE TYPE "CompanyCustomerSource" AS ENUM ('registration', 'qrcode', 'manual');

-- CreateEnum
CREATE TYPE "CustomerConsentPurpose" AS ENUM ('marketing', 'communication', 'data_sharing');

-- CreateEnum
CREATE TYPE "CustomerConsentSource" AS ENUM ('self_service', 'employee', 'import');

-- CreateEnum
CREATE TYPE "ConsentAction" AS ENUM ('granted', 'revoked');

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phoneE164" TEXT NOT NULL,
    "emailNormalized" TEXT,
    "cpfLookupHash" TEXT,
    "cpfLastDigits" TEXT,
    "birthDate" TIMESTAMP(3),
    "status" "CustomerStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyCustomer" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "internalCode" TEXT,
    "status" "CompanyCustomerStatus" NOT NULL DEFAULT 'active',
    "source" "CompanyCustomerSource" NOT NULL DEFAULT 'manual',
    "notes" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastAttendedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyCustomer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerConsentEvent" (
    "id" TEXT NOT NULL,
    "companyCustomerId" TEXT NOT NULL,
    "purpose" "CustomerConsentPurpose" NOT NULL,
    "action" "ConsentAction" NOT NULL,
    "policyVersion" TEXT NOT NULL,
    "source" "CustomerConsentSource" NOT NULL,
    "recordedByUserId" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "CustomerConsentEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_phoneE164_key" ON "Customer"("phoneE164");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_cpfLookupHash_key" ON "Customer"("cpfLookupHash");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_userId_key" ON "Customer"("userId");

-- CreateIndex
CREATE INDEX "CompanyCustomer_companyId_status_idx" ON "CompanyCustomer"("companyId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyCustomer_customerId_companyId_key" ON "CompanyCustomer"("customerId", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyCustomer_companyId_internalCode_key" ON "CompanyCustomer"("companyId", "internalCode");

-- CreateIndex
CREATE INDEX "CustomerConsentEvent_companyCustomerId_purpose_occurredAt_idx" ON "CustomerConsentEvent"("companyCustomerId", "purpose", "occurredAt");

-- CreateIndex
CREATE INDEX "CustomerConsentEvent_recordedByUserId_idx" ON "CustomerConsentEvent"("recordedByUserId");

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyCustomer" ADD CONSTRAINT "CompanyCustomer_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyCustomer" ADD CONSTRAINT "CompanyCustomer_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerConsentEvent" ADD CONSTRAINT "CustomerConsentEvent_recordedByUserId_fkey" FOREIGN KEY ("recordedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerConsentEvent" ADD CONSTRAINT "CustomerConsentEvent_companyCustomerId_fkey" FOREIGN KEY ("companyCustomerId") REFERENCES "CompanyCustomer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
