/*
  Warnings:

  - You are about to drop the column `address` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `age` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `first_name` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `image_path` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `_studentcourses` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_studentcourses` DROP FOREIGN KEY `_StudentCourses_A_fkey`;

-- DropForeignKey
ALTER TABLE `_studentcourses` DROP FOREIGN KEY `_StudentCourses_B_fkey`;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `address`,
    DROP COLUMN `age`,
    DROP COLUMN `first_name`,
    DROP COLUMN `image_path`,
    DROP COLUMN `last_name`,
    DROP COLUMN `phone`;

-- DropTable
DROP TABLE `_studentcourses`;

-- CreateTable
CREATE TABLE `student_courses` (
    `courseId` INTEGER NOT NULL,
    `studentId` INTEGER NOT NULL,

    PRIMARY KEY (`courseId`, `studentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `student_courses` ADD CONSTRAINT `student_courses_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_courses` ADD CONSTRAINT `student_courses_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
