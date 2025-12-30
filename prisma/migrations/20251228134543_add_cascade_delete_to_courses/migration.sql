-- DropForeignKey
ALTER TABLE `student_courses` DROP FOREIGN KEY `student_courses_courseId_fkey`;

-- DropForeignKey
ALTER TABLE `student_courses` DROP FOREIGN KEY `student_courses_studentId_fkey`;

-- AddForeignKey
ALTER TABLE `student_courses` ADD CONSTRAINT `student_courses_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_courses` ADD CONSTRAINT `student_courses_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
