-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 30, 2025 at 08:48 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `center_education`
--

-- --------------------------------------------------------

--
-- Table structure for table `chapter`
--

CREATE TABLE `chapter` (
  `id` int(11) NOT NULL,
  `title` varchar(191) NOT NULL,
  `content` varchar(191) DEFAULT NULL,
  `videoPath` varchar(191) NOT NULL,
  `pdfPath` varchar(191) DEFAULT NULL,
  `order` int(11) NOT NULL,
  `courseId` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chapter`
--

INSERT INTO `chapter` (`id`, `title`, `content`, `videoPath`, `pdfPath`, `order`, `courseId`, `createdAt`, `updatedAt`) VALUES
(4, 'chapter1', 'chapter1', '/videos/1767023058120-754837650.mp4', '/pdfs/1767023058139-358092834.pdf', 1, 9, '2025-12-29 15:44:18.151', '2025-12-29 15:44:18.151'),
(5, 'CHAPTER 2 ', 'import {\n  CanActivate,\n  ExecutionContext,\n  Injectable,\n  ForbiddenException,\n} from \'@nestjs/common\';\nimport { PrismaService } from \'src/prisma/prisma.service\';\nimport { Role } from \'@pris', '/videos/1767023137631-51829886.mp4', '/pdfs/1767023137643-930340734.pdf', 2, 9, '2025-12-29 15:45:37.657', '2025-12-29 15:45:37.657'),
(6, 'ch4', 'v454v54v54v', '/videos/1767029520976-761807342.mp4', '/pdfs/1767029521004-979311338.pdf', 3, 9, '2025-12-29 17:32:01.042', '2025-12-29 17:32:01.042'),
(7, 'chapter 3 ', 'typescript', '/videos/1767036461910-100556933.mp4', NULL, 4, 9, '2025-12-29 19:27:41.998', '2025-12-29 19:27:41.998');

-- --------------------------------------------------------

--
-- Table structure for table `course`
--

CREATE TABLE `course` (
  `id` int(11) NOT NULL,
  `title` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `teacherId` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `image_path` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `course`
--

INSERT INTO `course` (`id`, `title`, `description`, `teacherId`, `createdAt`, `updatedAt`, `image_path`) VALUES
(6, 'ATH 101', 'Basic Mathematics', 10, '2025-12-28 12:48:21.249', '2025-12-28 12:48:21.249', '/images/1767035064828-490128286.jpg'),
(8, 'math 6', 'Basic Mathematics', 10, '2025-12-28 21:19:25.930', '2025-12-28 21:19:25.930', '/images/1767035064828-490128286.jpg'),
(9, 'js', 'java script', 17, '2025-12-29 08:29:16.289', '2025-12-30 07:28:59.958', '/images/1767079738969-570493753.png');

-- --------------------------------------------------------

--
-- Table structure for table `enrollment`
--

CREATE TABLE `enrollment` (
  `id` int(11) NOT NULL,
  `courseId` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `studentId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `enrollment`
--

INSERT INTO `enrollment` (`id`, `courseId`, `createdAt`, `studentId`) VALUES
(1, 9, '2025-12-29 16:07:22.781', 16),
(5, 9, '2025-12-29 16:12:08.788', 15);

-- --------------------------------------------------------

--
-- Table structure for table `enrollmentrequest`
--

CREATE TABLE `enrollmentrequest` (
  `id` int(11) NOT NULL,
  `studentId` int(11) NOT NULL,
  `courseId` int(11) NOT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'pending',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `role` enum('USER','STUDENT','ADMIN','TEACHER','ASSISTANT','EMPLOYEE') NOT NULL DEFAULT 'USER',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `address` varchar(191) DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `first_name` varchar(191) DEFAULT NULL,
  `image_path` varchar(191) DEFAULT NULL,
  `last_name` varchar(191) DEFAULT NULL,
  `phone` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `email`, `password`, `role`, `createdAt`, `updatedAt`, `address`, `age`, `first_name`, `image_path`, `last_name`, `phone`) VALUES
(10, 'amerwqb@gmail.com', '$2b$10$JoOyS.hZncnkNKTV5yjjCONkTDeU0l7WDli6YCGO2vwa7GYklW0Tq', 'TEACHER', '2025-12-26 12:02:57.143', '2025-12-26 12:02:57.143', NULL, NULL, NULL, NULL, NULL, NULL),
(11, 'amerwqbq@gmail.com', '$2b$10$JDxlIZcMpGnSxg0aaxxnWOljmWtcCtS1m0rbiFZtCYWzDbfaA/8aK', 'STUDENT', '2025-12-26 12:06:49.887', '2025-12-26 12:06:49.887', NULL, NULL, NULL, NULL, NULL, NULL),
(12, 'mofbq@gmail.com', '$2b$10$pbRNQIf0Q3hDIL8EdUTO7efqjlK3Qyuyvw5Zw9Y580j9dlpMXmm1G', 'STUDENT', '2025-12-26 12:07:04.798', '2025-12-26 12:07:04.798', NULL, NULL, NULL, NULL, NULL, NULL),
(13, 'mofرbq@gmail.com', '$2b$10$DFzqP/gFT.cGjRVIm4vyqOxodR0kF5qVQs./K6S2PyOgjD4GITTXa', 'STUDENT', '2025-12-26 12:19:24.172', '2025-12-26 12:19:24.172', NULL, NULL, NULL, NULL, NULL, NULL),
(14, 'nader@gmail.com', '$2b$10$xZwzNabR7TwbyaePaVBGkuU3oUbCAMyPmptdlSgennbD1tNOH5kFy', 'ADMIN', '2025-12-26 13:54:48.172', '2025-12-26 13:54:48.172', NULL, NULL, NULL, NULL, NULL, NULL),
(15, 'aa@gmail.com', '$2b$10$/VhMSFBhj8LLv3PjO0ctHuSdHtiRxV8hjblNVwtomrqgQE0E5aS8O', 'STUDENT', '2025-12-26 14:52:15.529', '2025-12-26 14:52:15.529', NULL, NULL, NULL, NULL, NULL, NULL),
(16, 'ramez@gmail.com', '$2b$10$KkxlADTndQ/RkQbEvbmjn.sc24jsYTGG9BV0y2vWvrPNoh.KvBHqa', 'STUDENT', '2025-12-26 21:24:54.904', '2025-12-26 21:24:54.904', NULL, NULL, NULL, NULL, NULL, NULL),
(17, 'amira@gmail.com', '$2b$10$amlAwnHN1ro4b/emajnLouF1iNV7fKxhjHwwFso8TTReSGnc6X6EO', 'TEACHER', '2025-12-27 14:19:04.750', '2025-12-27 14:19:04.750', NULL, NULL, 'amira', NULL, 'ali', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('1f93a92a-b952-4410-ac87-807db954d4b1', 'c1eb4e831ce743cecb05564bcab3d3635de033112895cab146fa06ba8308a9ff', '2025-12-29 11:05:07.555', '20251229110507_add_course_requests_table', NULL, NULL, '2025-12-29 11:05:07.440', 1),
('2395b64a-5124-4567-8d82-beaf1a70d352', '64767a205e71725915b228eebe064be40ad8db5dfd0d137e5cd8a80fb45c7427', '2025-12-28 13:45:43.574', '20251228134543_add_cascade_delete_to_courses', NULL, NULL, '2025-12-28 13:45:43.470', 1),
('4687cf30-3d8f-4790-b485-b42ae39b9ecb', '0acc48553fc349c982d8d3729833838b971e81b8d6fb7192c4e0e9ac3479af8b', '2025-12-28 12:37:39.691', '20251228123739_solve_some_errors', NULL, NULL, '2025-12-28 12:37:39.679', 1),
('581acbd2-8bec-49ce-8e66-e7160124206f', '10337a898c65083f1dd81f0d68773df77feba99fe61bdfbbaa830338805068ec', '2025-12-28 12:20:35.789', '20251228122035_add_student_role_to_user_table', NULL, NULL, '2025-12-28 12:20:35.736', 1),
('72b98e69-9248-4a11-bfe8-c25d90d9a009', '6f0573213b3f98e19fb6100e8ff0ab71e650fe675823f644e5c0766c0b1c93e0', '2025-12-24 11:17:25.166', '20251224111725_add_roles_to_user', NULL, NULL, '2025-12-24 11:17:25.159', 1),
('74ebdb88-89fe-487e-b969-acd6552131db', '980aedc4f0959357eb4515677eb5961c17560086abd4b15de2ba2b688c93e06c', '2025-12-24 08:21:57.276', '20251224082157_init', NULL, NULL, '2025-12-24 08:21:57.244', 1),
('a9471dd9-b2cc-4fca-80a9-4e9ad37910d3', 'ab1475c5e3b1b73f8d02749afc997aaec6271c6aa54645d1eb9500112f9e6f8d', '2025-12-28 11:01:05.247', '20251228110105_add_courses_table_to_database', NULL, NULL, '2025-12-28 11:01:05.085', 1),
('ba0f955e-d2e9-41dc-8329-6aef1b60b24c', 'a0355d2fd5a0924e104dc3fcd3fda4b9a08a6dd8f3fa9638c08b663debf59513', '2025-12-29 08:37:04.191', '20251229083656_remove_student_courses_table_and_add_enrollment_table', NULL, NULL, '2025-12-29 08:36:56.703', 1),
('c88c13da-dfee-419f-8396-bd29e70140c7', 'f41a11e9a603dfdf629d12a12c5152cc44675af1ce6aa683779c04ab1f500eb8', '2025-12-29 18:52:19.039', '20251229185219_add_image_path_to_course_table', NULL, NULL, '2025-12-29 18:52:19.028', 1),
('cc173f65-4602-44c2-9b72-1236ffc05b48', '85632a7d0ba667e0279f1eba2dfaa463770a9591c2cf9f6fb614160b2460f284', '2025-12-28 18:17:21.339', '20251228181721_add_chapter_table', NULL, NULL, '2025-12-28 18:17:21.288', 1),
('d2c1a646-9cdc-4c94-b04d-8b00e5726742', '1898ce811a9ef04744535a89e67b1b655ebf8eca5cff2d9b0cae48c9c7bcdb39', '2025-12-28 12:27:51.811', '20251228122750_add_student_courses_table_with_name_for_each_column', NULL, NULL, '2025-12-28 12:27:50.958', 1),
('dd0b327d-c123-4d9b-9445-3736e3ef783a', '9ee39737f00e8911d93162ad1a6f634691ae0d1cefea727929a1a79497ff8c84', '2025-12-29 09:10:25.473', '20251229091024_change_column_name_in_enrollment', NULL, NULL, '2025-12-29 09:10:24.658', 1),
('ef13d71f-cba7-4970-865d-5f2c322d1074', '92d2257a0a6dbe27c3fe2ab93545210caebb7ea740784f0e0c9cd0d3c97601c9', '2025-12-28 18:19:52.591', '20251228181952_add_constraint_unique_to_chapter_table', NULL, NULL, '2025-12-28 18:19:52.570', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `chapter`
--
ALTER TABLE `chapter`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Chapter_courseId_order_key` (`courseId`,`order`);

--
-- Indexes for table `course`
--
ALTER TABLE `course`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Course_teacherId_fkey` (`teacherId`);

--
-- Indexes for table `enrollment`
--
ALTER TABLE `enrollment`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Enrollment_studentId_courseId_key` (`studentId`,`courseId`),
  ADD KEY `Enrollment_courseId_fkey` (`courseId`);

--
-- Indexes for table `enrollmentrequest`
--
ALTER TABLE `enrollmentrequest`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `EnrollmentRequest_studentId_courseId_key` (`studentId`,`courseId`),
  ADD KEY `EnrollmentRequest_courseId_fkey` (`courseId`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `User_email_key` (`email`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `chapter`
--
ALTER TABLE `chapter`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `course`
--
ALTER TABLE `course`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `enrollment`
--
ALTER TABLE `enrollment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `enrollmentrequest`
--
ALTER TABLE `enrollmentrequest`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `chapter`
--
ALTER TABLE `chapter`
  ADD CONSTRAINT `Chapter_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `course` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `course`
--
ALTER TABLE `course`
  ADD CONSTRAINT `Course_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `enrollment`
--
ALTER TABLE `enrollment`
  ADD CONSTRAINT `Enrollment_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `course` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Enrollment_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `enrollmentrequest`
--
ALTER TABLE `enrollmentrequest`
  ADD CONSTRAINT `EnrollmentRequest_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `course` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `EnrollmentRequest_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
