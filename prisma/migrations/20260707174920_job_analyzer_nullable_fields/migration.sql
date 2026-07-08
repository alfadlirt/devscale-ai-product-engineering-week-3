-- DropIndex
DROP INDEX "JobAnalyzerResult_curiculumVitaeId_key";

-- AlterTable
ALTER TABLE "JobAnalyzerResult" ALTER COLUMN "companyName" DROP NOT NULL,
ALTER COLUMN "position" DROP NOT NULL,
ALTER COLUMN "salary" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "location" DROP NOT NULL,
ALTER COLUMN "type" DROP NOT NULL,
ALTER COLUMN "coverLetter" DROP NOT NULL,
ALTER COLUMN "coverLetter" DROP DEFAULT,
ALTER COLUMN "coverLetter" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "JobAnalyzerResult_curiculumVitaeId_jobPostingUrl_key" ON "JobAnalyzerResult"("curiculumVitaeId", "jobPostingUrl");
