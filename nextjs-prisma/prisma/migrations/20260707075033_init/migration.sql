/*
  Warnings:

  - You are about to drop the column `archived` on the `Topic` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastActiveDate` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `totalFocusCount` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PomodoroLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VerificationToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "MedalTier" AS ENUM ('Bronze', 'Silver', 'Gold', 'Diamond', 'Ruby');

-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "PomodoroLog" DROP CONSTRAINT "PomodoroLog_topicId_fkey";

-- DropForeignKey
ALTER TABLE "PomodoroLog" DROP CONSTRAINT "PomodoroLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- AlterTable
ALTER TABLE "Topic" DROP COLUMN "archived";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailVerified",
DROP COLUMN "lastActiveDate",
DROP COLUMN "totalFocusCount";

-- DropTable
DROP TABLE "Account";

-- DropTable
DROP TABLE "PomodoroLog";

-- DropTable
DROP TABLE "Session";

-- DropTable
DROP TABLE "VerificationToken";

-- DropEnum
DROP TYPE "SessionType";

-- CreateTable
CREATE TABLE "Medal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tier" "MedalTier" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Medal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FocusSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FocusSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Medal_userId_date_key" ON "Medal"("userId", "date");

-- CreateIndex
CREATE INDEX "FocusSession_userId_date_idx" ON "FocusSession"("userId", "date");

-- AddForeignKey
ALTER TABLE "Medal" ADD CONSTRAINT "Medal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FocusSession" ADD CONSTRAINT "FocusSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
