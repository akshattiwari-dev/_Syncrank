-- CreateTable
CREATE TABLE "contest_invites" (
    "id" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contest_invites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contest_invites_contestId_idx" ON "contest_invites"("contestId");

-- CreateIndex
CREATE UNIQUE INDEX "contest_invites_contestId_userId_key" ON "contest_invites"("contestId", "userId");

-- AddForeignKey
ALTER TABLE "contest_invites" ADD CONSTRAINT "contest_invites_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "contests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest_invites" ADD CONSTRAINT "contest_invites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
