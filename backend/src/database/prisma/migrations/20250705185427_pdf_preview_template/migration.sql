/*
  Warnings:

  - Added the required column `pdfKey` to the `ContractTemplate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `previewKey` to the `ContractTemplate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pdfKey` to the `InvoiceTemplate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `previewKey` to the `InvoiceTemplate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pdfKey` to the `QuoteTemplate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `previewKey` to the `QuoteTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ContractTemplate" ADD COLUMN     "pdfKey" TEXT NOT NULL,
ADD COLUMN     "previewKey" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "InvoiceTemplate" ADD COLUMN     "pdfKey" TEXT NOT NULL,
ADD COLUMN     "previewKey" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "QuoteTemplate" ADD COLUMN     "pdfKey" TEXT NOT NULL,
ADD COLUMN     "previewKey" TEXT NOT NULL;
