/*
  Warnings:

  - The `expectedType` column on the `JobAnalyzerResult` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "JobAnalyzerResult" DROP COLUMN "expectedType",
ADD COLUMN     "expectedType" TEXT;
