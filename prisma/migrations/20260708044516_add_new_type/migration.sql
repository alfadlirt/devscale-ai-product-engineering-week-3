/*
  Warnings:

  - The values [FULL_TIME,PART_TIME,CONTRACT,INTERNSHIP] on the enum `JobType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE "JobAnalyzerResult" ADD COLUMN     "expectedLocation" TEXT,
ADD COLUMN     "expectedMinimumUSDAnnualSalary" INTEGER,
ADD COLUMN     "expectedType" "JobType";


-- AlterEnum
BEGIN;
CREATE TYPE "JobType_new" AS ENUM ('REMOTE_FULL_TIME', 'REMOTE_PART_TIME', 'ON_SITE_FULL_TIME', 'ON_SITE_PART_TIME', 'HYBRID_FULL_TIME', 'HYBRID_PART_TIME', 'CONTRACT_FULL_TIME', 'CONTRACT_PART_TIME');
ALTER TABLE "JobAnalyzerResult" ALTER COLUMN "type" TYPE "JobType_new" USING ("type"::text::"JobType_new");
ALTER TABLE "JobAnalyzerResult" ALTER COLUMN "expectedType" TYPE "JobType_new" USING ("expectedType"::text::"JobType_new");
ALTER TYPE "JobType" RENAME TO "JobType_old";
ALTER TYPE "JobType_new" RENAME TO "JobType";
DROP TYPE "public"."JobType_old";
COMMIT;