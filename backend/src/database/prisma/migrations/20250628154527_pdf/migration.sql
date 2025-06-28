/*
  Warnings:

  - Added the required column `pdfKey` to the `Contract` table without a default value. This is not possible if the table is not empty.
  - Added the required column `previewKey` to the `Contract` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pdfKey` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `previewKey` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pdfKey` to the `Quote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `previewKey` to the `Quote` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Contract" ADD COLUMN     "pdfKey" TEXT NOT NULL,
ADD COLUMN     "previewKey" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "pdfKey" TEXT NOT NULL,
ADD COLUMN     "previewKey" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Quote" ADD COLUMN     "pdfKey" TEXT NOT NULL,
ADD COLUMN     "previewKey" TEXT NOT NULL;
