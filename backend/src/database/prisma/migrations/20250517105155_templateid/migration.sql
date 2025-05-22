/*
  Warnings:

  - Made the column `templateId` on table `Contract` required. This step will fail if there are existing NULL values in that column.
  - Made the column `templateId` on table `Invoice` required. This step will fail if there are existing NULL values in that column.
  - Made the column `templateId` on table `Quote` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Contract" DROP CONSTRAINT "Contract_templateId_fkey";

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_templateId_fkey";

-- DropForeignKey
ALTER TABLE "Quote" DROP CONSTRAINT "Quote_templateId_fkey";

-- AlterTable
ALTER TABLE "Contract" ALTER COLUMN "templateId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Invoice" ALTER COLUMN "templateId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Quote" ALTER COLUMN "templateId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "QuoteTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "InvoiceTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ContractTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
