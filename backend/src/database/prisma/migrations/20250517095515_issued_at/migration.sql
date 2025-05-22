-- AlterTable
ALTER TABLE "Contract" ALTER COLUMN "issuedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Invoice" ALTER COLUMN "issuedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Quote" ALTER COLUMN "issuedAt" DROP NOT NULL;
