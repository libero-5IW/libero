/*
  Warnings:

  - The values [accepted,refused] on the enum `ContractStatus` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `invoiceId` to the `Contract` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quoteId` to the `Contract` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ContractStatus_new" AS ENUM ('draft', 'sent', 'signed', 'declined', 'expired', 'cancelled');
ALTER TABLE "Contract" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Contract" ALTER COLUMN "status" TYPE "ContractStatus_new" USING ("status"::text::"ContractStatus_new");
ALTER TYPE "ContractStatus" RENAME TO "ContractStatus_old";
ALTER TYPE "ContractStatus_new" RENAME TO "ContractStatus";
DROP TYPE "ContractStatus_old";
ALTER TABLE "Contract" ALTER COLUMN "status" SET DEFAULT 'draft';
COMMIT;

-- AlterTable
ALTER TABLE "Contract" ADD COLUMN     "invoiceId" TEXT NOT NULL,
ADD COLUMN     "quoteId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
