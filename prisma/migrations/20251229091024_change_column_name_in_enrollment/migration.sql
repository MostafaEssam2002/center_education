/*
  Warnings:

  - You are about to drop the column `userId` on the `enrollment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[studentId,courseId]` on the table `Enrollment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `studentId` to the `Enrollment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `enrollment` DROP FOREIGN KEY `Enrollment_userId_fkey`;

-- DropIndex
DROP INDEX `Enrollment_userId_courseId_key` ON `enrollment`;

-- AlterTable
ALTER TABLE `enrollment` DROP COLUMN `userId`,
    ADD COLUMN `studentId` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Enrollment_studentId_courseId_key` ON `Enrollment`(`studentId`, `courseId`);

-- AddForeignKey
ALTER TABLE `Enrollment` ADD CONSTRAINT `Enrollment_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
