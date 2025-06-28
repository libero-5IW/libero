-- AlterTable
ALTER TABLE "Contract" ALTER COLUMN "clientId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Invoice" ALTER COLUMN "clientId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Quote" ALTER COLUMN "clientId" DROP NOT NULL;
