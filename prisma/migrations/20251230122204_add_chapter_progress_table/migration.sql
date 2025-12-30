-- DropForeignKey
ALTER TABLE `chapter` DROP FOREIGN KEY `Chapter_courseId_fkey`;

-- DropForeignKey
ALTER TABLE `course` DROP FOREIGN KEY `Course_teacherId_fkey`;

-- DropForeignKey
ALTER TABLE `enrollment` DROP FOREIGN KEY `Enrollment_courseId_fkey`;

-- DropForeignKey
ALTER TABLE `enrollment` DROP FOREIGN KEY `Enrollment_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `enrollmentrequest` DROP FOREIGN KEY `EnrollmentRequest_courseId_fkey`;

-- DropForeignKey
ALTER TABLE `enrollmentrequest` DROP FOREIGN KEY `EnrollmentRequest_studentId_fkey`;

-- CreateTable
CREATE TABLE `ChapterProgress` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentId` INTEGER NOT NULL,
    `chapterId` INTEGER NOT NULL,
    `progress` DOUBLE NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ChapterProgress_studentId_chapterId_key`(`studentId`, `chapterId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `chapter` ADD CONSTRAINT `chapter_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course` ADD CONSTRAINT `course_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `enrollment` ADD CONSTRAINT `enrollment_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `enrollment` ADD CONSTRAINT `enrollment_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `course`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `enrollmentrequest` ADD CONSTRAINT `enrollmentrequest_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `enrollmentrequest` ADD CONSTRAINT `enrollmentrequest_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `course`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChapterProgress` ADD CONSTRAINT `ChapterProgress_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChapterProgress` ADD CONSTRAINT `ChapterProgress_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `chapter`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

