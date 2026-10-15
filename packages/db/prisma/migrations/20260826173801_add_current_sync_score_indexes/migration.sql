-- AlterTable
ALTER TABLE "users" ADD COLUMN     "currentSyncScore" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "users_campusId_currentSyncScore_idx" ON "users"("campusId", "currentSyncScore");

-- CreateIndex
CREATE INDEX "users_currentSyncScore_idx" ON "users"("currentSyncScore");
