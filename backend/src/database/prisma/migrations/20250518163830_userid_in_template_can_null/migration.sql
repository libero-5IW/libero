-- AlterTable
ALTER TABLE "ContractTemplate" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "InvoiceTemplate" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "QuoteTemplate" ALTER COLUMN "userId" DROP NOT NULL;
