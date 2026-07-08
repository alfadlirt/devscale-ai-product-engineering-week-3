/*
  Warnings:

  - A unique constraint covering the columns `[key]` on the table `CuriculumVitae` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `key` to the `CuriculumVitae` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CuriculumVitae" ADD COLUMN     "key" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CuriculumVitae_key_key" ON "CuriculumVitae"("key");
