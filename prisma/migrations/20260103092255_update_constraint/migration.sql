/*
  Warnings:

  - A unique constraint covering the columns `[attemptId,questionId]` on the table `QuizAttemptAnswer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `QuizAttemptAnswer_attemptId_questionId_key` ON `QuizAttemptAnswer`(`attemptId`, `questionId`);
