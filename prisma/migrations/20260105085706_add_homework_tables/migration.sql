-- DropForeignKey
ALTER TABLE `quiz` DROP FOREIGN KEY `Quiz_chapterId_fkey`;

-- DropForeignKey
ALTER TABLE `quiz` DROP FOREIGN KEY `Quiz_courseId_fkey`;

-- DropForeignKey
ALTER TABLE `quiz` DROP FOREIGN KEY `Quiz_createdBy_fkey`;

-- DropForeignKey
ALTER TABLE `quizattempt` DROP FOREIGN KEY `QuizAttempt_quizId_fkey`;

-- DropForeignKey
ALTER TABLE `quizattempt` DROP FOREIGN KEY `QuizAttempt_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `quizattemptanswer` DROP FOREIGN KEY `QuizAttemptAnswer_attemptId_fkey`;

-- DropForeignKey
ALTER TABLE `quizattemptanswer` DROP FOREIGN KEY `QuizAttemptAnswer_optionId_fkey`;

-- DropForeignKey
ALTER TABLE `quizattemptanswer` DROP FOREIGN KEY `QuizAttemptAnswer_questionId_fkey`;

-- DropForeignKey
ALTER TABLE `quizoption` DROP FOREIGN KEY `QuizOption_questionId_fkey`;

-- DropForeignKey
ALTER TABLE `quizquestion` DROP FOREIGN KEY `QuizQuestion_quizId_fkey`;

-- CreateTable
CREATE TABLE `assignment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `chapterId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `dueDate` DATETIME(3) NOT NULL,
    `maxGrade` INTEGER NOT NULL,
    `allowLate` BOOLEAN NOT NULL DEFAULT true,
    `createdBy` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `assignment_chapterId_idx`(`chapterId`),
    INDEX `assignment_createdBy_idx`(`createdBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `assignmentsubmission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assignmentId` INTEGER NOT NULL,
    `studentId` INTEGER NOT NULL,
    `filePath` VARCHAR(191) NOT NULL,
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` ENUM('SUBMITTED', 'LATE', 'REVIEWED') NOT NULL,
    `grade` INTEGER NULL,
    `feedback` VARCHAR(191) NULL,

    INDEX `assignmentsubmission_studentId_idx`(`studentId`),
    INDEX `assignmentsubmission_assignmentId_idx`(`assignmentId`),
    UNIQUE INDEX `assignmentsubmission_assignmentId_studentId_key`(`assignmentId`, `studentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `quiz` ADD CONSTRAINT `quiz_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quiz` ADD CONSTRAINT `quiz_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `course`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quiz` ADD CONSTRAINT `quiz_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `chapter`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quizquestion` ADD CONSTRAINT `quizquestion_quizId_fkey` FOREIGN KEY (`quizId`) REFERENCES `quiz`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quizoption` ADD CONSTRAINT `quizoption_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `quizquestion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quizattempt` ADD CONSTRAINT `quizattempt_quizId_fkey` FOREIGN KEY (`quizId`) REFERENCES `quiz`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quizattempt` ADD CONSTRAINT `quizattempt_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quizattemptanswer` ADD CONSTRAINT `quizattemptanswer_attemptId_fkey` FOREIGN KEY (`attemptId`) REFERENCES `quizattempt`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quizattemptanswer` ADD CONSTRAINT `quizattemptanswer_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `quizquestion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quizattemptanswer` ADD CONSTRAINT `quizattemptanswer_optionId_fkey` FOREIGN KEY (`optionId`) REFERENCES `quizoption`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assignment` ADD CONSTRAINT `assignment_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assignment` ADD CONSTRAINT `assignment_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `chapter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assignmentsubmission` ADD CONSTRAINT `assignmentsubmission_assignmentId_fkey` FOREIGN KEY (`assignmentId`) REFERENCES `assignment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assignmentsubmission` ADD CONSTRAINT `assignmentsubmission_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
