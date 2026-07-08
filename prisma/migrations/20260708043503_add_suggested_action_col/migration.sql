-- CreateEnum
CREATE TYPE "SuggestionAction" AS ENUM ('STRONG_APPLY', 'APPLY', 'STRETCH', 'UNLIKELY', 'SKIP');

-- AlterTable
ALTER TABLE "JobAnalyzerResult" ADD COLUMN     "note" TEXT,
ADD COLUMN     "suggestedAction" "SuggestionAction";
