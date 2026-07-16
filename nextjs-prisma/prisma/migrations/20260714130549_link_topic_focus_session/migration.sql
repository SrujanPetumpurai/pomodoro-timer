-- AlterTable
ALTER TABLE "FocusSession" ADD COLUMN     "duration" INTEGER NOT NULL DEFAULT 25,
ADD COLUMN     "topicId" TEXT;

-- CreateIndex
CREATE INDEX "FocusSession_userId_topicId_idx" ON "FocusSession"("userId", "topicId");

-- AddForeignKey
ALTER TABLE "FocusSession" ADD CONSTRAINT "FocusSession_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
