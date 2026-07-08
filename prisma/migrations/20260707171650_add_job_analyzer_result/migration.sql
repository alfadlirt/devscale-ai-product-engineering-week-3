-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP');

-- AlterTable
ALTER TABLE "CuriculumVitae" ALTER COLUMN "content" DROP NOT NULL;

-- CreateTable
CREATE TABLE "JobAnalyzerResult" (
    "id" SERIAL NOT NULL,
    "curiculumVitaeId" INTEGER NOT NULL,
    "companyName" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "salary" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "type" "JobType" NOT NULL,
    "requirementMatch" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "experienceMatch" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "educationMatch" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "salaryExpectationMatch" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "skillsMatch" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "certificationsMatch" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "languagesMatch" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "coverLetter" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobAnalyzerResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JobAnalyzerResult_curiculumVitaeId_key" ON "JobAnalyzerResult"("curiculumVitaeId");
