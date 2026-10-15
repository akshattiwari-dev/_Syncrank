-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Verdict" ADD VALUE 'compile_error';
ALTER TYPE "Verdict" ADD VALUE 'internal_error';
ALTER TYPE "Verdict" ADD VALUE 'pending';

-- AlterTable
ALTER TABLE "contest_problems" ADD COLUMN     "memoryLimitKb" INTEGER NOT NULL DEFAULT 256000,
ADD COLUMN     "timeLimitMs" INTEGER NOT NULL DEFAULT 2000;

-- AlterTable
ALTER TABLE "submissions" ADD COLUMN     "failedTestCase" INTEGER,
ADD COLUMN     "judgeToken" TEXT,
ADD COLUMN     "languageId" INTEGER,
ADD COLUMN     "memoryKb" INTEGER,
ADD COLUMN     "runtimeMs" INTEGER,
ADD COLUMN     "sourceCode" TEXT;

-- CreateTable
CREATE TABLE "contest_problem_test_cases" (
    "id" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "expectedOut" TEXT NOT NULL,
    "isSample" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contest_problem_test_cases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contest_problem_test_cases_problemId_order_idx" ON "contest_problem_test_cases"("problemId", "order");

-- AddForeignKey
ALTER TABLE "contest_problem_test_cases" ADD CONSTRAINT "contest_problem_test_cases_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "contest_problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;
