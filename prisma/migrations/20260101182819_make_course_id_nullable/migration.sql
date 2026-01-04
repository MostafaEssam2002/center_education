-- DropForeignKey
ALTER TABLE `quiz` DROP FOREIGN KEY `Quiz_courseId_fkey`;

-- AlterTable
ALTER TABLE `quiz` MODIFY `courseId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Quiz` ADD CONSTRAINT `Quiz_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `course`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
