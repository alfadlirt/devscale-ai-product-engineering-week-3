/*
  Warnings:

  - You are about to drop the column `isActive` on the `JobAnalyzerResult` table. All the data in the column will be lost.
  - Added the required column `jobPostingUrl` to the `JobAnalyzerResult` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "JobAnalyzerResultStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "JobAnalyzerResult" DROP COLUMN "isActive",
ADD COLUMN     "jobPostingUrl" TEXT NOT NULL,
ADD COLUMN     "status" "JobAnalyzerResultStatus" NOT NULL DEFAULT 'PENDING';
