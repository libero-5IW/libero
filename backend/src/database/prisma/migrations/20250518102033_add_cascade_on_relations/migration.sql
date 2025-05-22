/*
  Warnings:

  - Added the required column `label` to the `ContractVariableValue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `required` to the `ContractVariableValue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `ContractVariableValue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `label` to the `InvoiceVariableValue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `required` to the `InvoiceVariableValue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `InvoiceVariableValue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `label` to the `QuoteVariableValue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `required` to the `QuoteVariableValue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `QuoteVariableValue` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Client" DROP CONSTRAINT "Client_userId_fkey";

-- DropForeignKey
ALTER TABLE "Contract" DROP CONSTRAINT "Contract_userId_fkey";

-- DropForeignKey
ALTER TABLE "ContractTemplate" DROP CONSTRAINT "ContractTemplate_userId_fkey";

-- DropForeignKey
ALTER TABLE "ContractTemplateVariable" DROP CONSTRAINT "ContractTemplateVariable_templateId_fkey";

-- DropForeignKey
ALTER TABLE "ContractVariableValue" DROP CONSTRAINT "ContractVariableValue_contractId_fkey";

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_userId_fkey";

-- DropForeignKey
ALTER TABLE "InvoiceTemplate" DROP CONSTRAINT "InvoiceTemplate_userId_fkey";

-- DropForeignKey
ALTER TABLE "InvoiceTemplateVariable" DROP CONSTRAINT "InvoiceTemplateVariable_templateId_fkey";

-- DropForeignKey
ALTER TABLE "InvoiceVariableValue" DROP CONSTRAINT "InvoiceVariableValue_invoiceId_fkey";

-- DropForeignKey
ALTER TABLE "Quote" DROP CONSTRAINT "Quote_userId_fkey";

-- DropForeignKey
ALTER TABLE "QuoteTemplate" DROP CONSTRAINT "QuoteTemplate_userId_fkey";

-- DropForeignKey
ALTER TABLE "QuoteTemplateVariable" DROP CONSTRAINT "QuoteTemplateVariable_templateId_fkey";

-- DropForeignKey
ALTER TABLE "QuoteVariableValue" DROP CONSTRAINT "QuoteVariableValue_quoteId_fkey";

-- AlterTable
ALTER TABLE "ContractVariableValue" ADD COLUMN     "label" TEXT NOT NULL,
ADD COLUMN     "required" BOOLEAN NOT NULL,
ADD COLUMN     "type" "VariableType" NOT NULL;

-- AlterTable
ALTER TABLE "InvoiceVariableValue" ADD COLUMN     "label" TEXT NOT NULL,
ADD COLUMN     "required" BOOLEAN NOT NULL,
ADD COLUMN     "type" "VariableType" NOT NULL;

-- AlterTable
ALTER TABLE "QuoteVariableValue" ADD COLUMN     "label" TEXT NOT NULL,
ADD COLUMN     "required" BOOLEAN NOT NULL,
ADD COLUMN     "type" "VariableType" NOT NULL;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteTemplate" ADD CONSTRAINT "QuoteTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteTemplateVariable" ADD CONSTRAINT "QuoteTemplateVariable_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "QuoteTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteVariableValue" ADD CONSTRAINT "QuoteVariableValue_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceTemplate" ADD CONSTRAINT "InvoiceTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceTemplateVariable" ADD CONSTRAINT "InvoiceTemplateVariable_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "InvoiceTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceVariableValue" ADD CONSTRAINT "InvoiceVariableValue_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractTemplate" ADD CONSTRAINT "ContractTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractTemplateVariable" ADD CONSTRAINT "ContractTemplateVariable_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ContractTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractVariableValue" ADD CONSTRAINT "ContractVariableValue_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;
