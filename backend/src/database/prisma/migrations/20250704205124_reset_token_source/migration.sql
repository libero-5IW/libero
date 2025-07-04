-- CreateEnum
CREATE TYPE "ResetTokenSource" AS ENUM ('RESET', 'LOCKED', 'EXPIRED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "resetTokenSource" "ResetTokenSource";
