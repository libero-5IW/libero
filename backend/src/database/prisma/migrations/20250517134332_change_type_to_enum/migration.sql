/*
  Warnings:

  - The `type` column on the `ContractTemplateVariable` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `type` column on the `InvoiceTemplateVariable` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `type` column on the `QuoteTemplateVariable` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "VariableType" AS ENUM ('string', 'number', 'boolean', 'date', 'textarea', 'email', 'url');

-- AlterTable
ALTER TABLE "ContractTemplateVariable" DROP COLUMN "type",
ADD COLUMN     "type" "VariableType" NOT NULL DEFAULT 'string';

-- AlterTable
ALTER TABLE "InvoiceTemplateVariable" DROP COLUMN "type",
ADD COLUMN     "type" "VariableType" NOT NULL DEFAULT 'string';

-- AlterTable
ALTER TABLE "QuoteTemplateVariable" DROP COLUMN "type",
ADD COLUMN     "type" "VariableType" NOT NULL DEFAULT 'string';
