-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 04, 2026 at 08:09 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


USE center_education;

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `center_education`
--

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `id` int(11) NOT NULL,
  `sessionId` int(11) NOT NULL,
  `studentId` int(11) NOT NULL,
  `status` enum('PRESENT','ABSENT','LATE') NOT NULL DEFAULT 'PRESENT',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`id`, `sessionId`, `studentId`, `status`, `createdAt`) VALUES
(8, 5, 16, 'PRESENT', '2026-01-01 12:49:19.106'),
(9, 5, 15, 'ABSENT', '2026-01-01 12:49:19.106');

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
-- Table structure for table `chapterprogress`
--

CREATE TABLE `chapterprogress` (
  `id` int(11) NOT NULL,
  `studentId` int(11) NOT NULL,
  `chapterId` int(11) NOT NULL,
  `progress` double NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `course`
--

CREATE TABLE `course` (
  `id` int(11) NOT NULL,
  `title` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `teacherId` int(11) NOT NULL,
  `image_path` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `course`
--

INSERT INTO `course` (`id`, `title`, `description`, `teacherId`, `image_path`, `createdAt`, `updatedAt`) VALUES
(6, 'ATH 101', 'Basic Mathematics', 17, '/images/1767035064828-490128286.jpg', '2025-12-28 12:48:21.249', '2025-12-28 12:48:21.249'),
(8, 'math 6', 'Basic Mathematics', 17, '/images/1767035064828-490128286.jpg', '2025-12-28 21:19:25.930', '2025-12-28 21:19:25.930'),
(9, 'js', 'java script', 17, '/images/1767079738969-570493753.png', '2025-12-29 08:29:16.289', '2025-12-30 07:28:59.958');

-- --------------------------------------------------------

--
-- Table structure for table `courseschedule`
--

CREATE TABLE `courseschedule` (
  `id` int(11) NOT NULL,
  `courseId` int(11) NOT NULL,
  `day` enum('SAT','SUN','MON','TUE','WED','THU','FRI') NOT NULL,
  `startTime` varchar(191) NOT NULL,
  `endTime` varchar(191) NOT NULL,
  `room` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `courseschedule`
--

INSERT INTO `courseschedule` (`id`, `courseId`, `day`, `startTime`, `endTime`, `room`) VALUES
(6, 6, 'SAT', '10:00', '11:00', 'Online'),
(7, 8, 'SUN', '09:00', '10:00', 'Online'),
(9, 6, 'SAT', '09:00', '10:00', 'Online'),
(10, 9, 'SAT', '08:00', '09:00', 'Online'),
(11, 9, 'SUN', '08:00', '09:00', 'Online'),
(12, 9, 'MON', '08:00', '09:00', 'Online'),
(13, 9, 'TUE', '08:00', '09:00', 'Online'),
(14, 9, 'WED', '08:00', '09:00', 'Online'),
(15, 9, 'THU', '08:00', '09:00', 'Online');

-- --------------------------------------------------------

--
-- Table structure for table `course_sessions`
--

CREATE TABLE `course_sessions` (
  `id` int(11) NOT NULL,
  `courseId` int(11) NOT NULL,
  `date` datetime(3) NOT NULL,
  `startTime` varchar(191) NOT NULL,
  `endTime` varchar(191) NOT NULL,
  `room` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `course_sessions`
--

INSERT INTO `course_sessions` (`id`, `courseId`, `date`, `startTime`, `endTime`, `room`, `createdAt`) VALUES
(5, 9, '2026-01-01 00:00:00.000', '14:49', '14:50', '', '2026-01-01 12:49:09.609');

-- --------------------------------------------------------

--
-- Table structure for table `enrollment`
--

CREATE TABLE `enrollment` (
  `id` int(11) NOT NULL,
  `studentId` int(11) NOT NULL,
  `courseId` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `enrollment`
--

INSERT INTO `enrollment` (`id`, `studentId`, `courseId`, `createdAt`) VALUES
(1, 16, 9, '2025-12-29 16:07:22.781'),
(5, 15, 9, '2025-12-29 16:12:08.788'),
(6, 15, 6, '2025-12-31 12:09:48.317'),
(7, 15, 8, '2025-12-31 12:09:51.947'),
(8, 19, 9, '2026-01-04 11:07:52.566');

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
-- Table structure for table `quiz`
--

CREATE TABLE `quiz` (
  `id` int(11) NOT NULL,
  `title` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `type` enum('CHAPTER','FINAL') NOT NULL,
  `courseId` int(11) DEFAULT NULL,
  `chapterId` int(11) DEFAULT NULL,
  `startTime` datetime(3) NOT NULL,
  `endTime` datetime(3) NOT NULL,
  `durationMin` int(11) NOT NULL,
  `totalMarks` int(11) NOT NULL,
  `keepAnswers` tinyint(1) NOT NULL DEFAULT 0,
  `isPublished` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `createdBy` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `quiz`
--

INSERT INTO `quiz` (`id`, `title`, `description`, `type`, `courseId`, `chapterId`, `startTime`, `endTime`, `durationMin`, `totalMarks`, `keepAnswers`, `isPublished`, `createdAt`, `updatedAt`, `createdBy`) VALUES
(5, 'q1', 'q1', 'CHAPTER', 9, 4, '2026-01-03 19:22:00.000', '2026-01-03 20:22:00.000', 30, 10, 0, 1, '2026-01-03 19:22:25.000', '2026-01-03 19:25:44.949', 17),
(6, 'q2', 'q2', 'CHAPTER', 9, 5, '2026-01-03 16:12:00.000', '2026-01-04 11:05:00.000', 1, 4, 0, 1, '2026-01-03 20:12:57.241', '2026-01-04 11:01:20.970', 17);

-- --------------------------------------------------------

--
-- Table structure for table `quizattempt`
--

CREATE TABLE `quizattempt` (
  `id` int(11) NOT NULL,
  `quizId` int(11) NOT NULL,
  `studentId` int(11) NOT NULL,
  `score` int(11) NOT NULL DEFAULT 0,
  `status` enum('IN_PROGRESS','SUBMITTED','TIMED_OUT') NOT NULL,
  `startedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `submittedAt` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `quizattempt`
--

INSERT INTO `quizattempt` (`id`, `quizId`, `studentId`, `score`, `status`, `startedAt`, `submittedAt`) VALUES
(9, 5, 15, 1, 'SUBMITTED', '2026-01-03 19:26:14.996', '2026-01-03 19:26:23.176'),
(11, 5, 16, 2, 'SUBMITTED', '2026-01-03 19:54:06.948', '2026-01-03 19:54:16.546'),
(13, 6, 16, 0, 'SUBMITTED', '2026-01-04 11:02:39.936', '2026-01-04 11:03:39.092'),
(14, 6, 15, 1, 'SUBMITTED', '2026-01-04 11:04:59.541', '2026-01-04 11:05:13.074');

-- --------------------------------------------------------

--
-- Table structure for table `quizattemptanswer`
--

CREATE TABLE `quizattemptanswer` (
  `id` int(11) NOT NULL,
  `attemptId` int(11) NOT NULL,
  `questionId` int(11) NOT NULL,
  `optionId` int(11) NOT NULL,
  `isCorrect` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `quizattemptanswer`
--

INSERT INTO `quizattemptanswer` (`id`, `attemptId`, `questionId`, `optionId`, `isCorrect`) VALUES
(5, 9, 5, 10, 1),
(6, 9, 6, 12, 0),
(7, 9, 7, 14, 0),
(8, 11, 5, 10, 1),
(9, 11, 6, 13, 1),
(10, 11, 7, 17, 0),
(11, 14, 8, 18, 1),
(12, 14, 10, 22, 0);

-- --------------------------------------------------------

--
-- Table structure for table `quizoption`
--

CREATE TABLE `quizoption` (
  `id` int(11) NOT NULL,
  `questionId` int(11) NOT NULL,
  `text` varchar(191) NOT NULL,
  `isCorrect` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `quizoption`
--

INSERT INTO `quizoption` (`id`, `questionId`, `text`, `isCorrect`) VALUES
(10, 5, 'mostafa', 1),
(11, 5, 'essam', 0),
(12, 6, '10', 0),
(13, 6, '20', 1),
(14, 7, 'menofia', 0),
(15, 7, 'giza', 0),
(16, 7, 'swizz', 1),
(17, 7, 'aswan', 0),
(18, 8, '1', 1),
(19, 8, '1', 0),
(22, 10, '2', 0),
(23, 10, '3', 1);

-- --------------------------------------------------------

--
-- Table structure for table `quizquestion`
--

CREATE TABLE `quizquestion` (
  `id` int(11) NOT NULL,
  `quizId` int(11) NOT NULL,
  `question` varchar(191) NOT NULL,
  `marks` int(11) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `quizquestion`
--

INSERT INTO `quizquestion` (`id`, `quizId`, `question`, `marks`, `createdAt`) VALUES
(5, 5, 'what is your name ?', 1, '2026-01-03 19:22:56.067'),
(6, 5, 'what is your age ?', 1, '2026-01-03 19:23:16.499'),
(7, 5, 'what is your address ?', 1, '2026-01-03 19:23:52.204'),
(8, 6, 'hhhhh', 1, '2026-01-03 20:13:10.944'),
(10, 6, 'how are ypu ', 3, '2026-01-04 11:01:12.841');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `email` varchar(191) NOT NULL,
  `first_name` varchar(191) DEFAULT NULL,
  `last_name` varchar(191) DEFAULT NULL,
  `image_path` varchar(191) DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `password` varchar(191) NOT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `address` varchar(191) DEFAULT NULL,
  `role` enum('USER','STUDENT','ADMIN','TEACHER','ASSISTANT','EMPLOYEE') NOT NULL DEFAULT 'USER',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `email`, `first_name`, `last_name`, `image_path`, `age`, `password`, `phone`, `address`, `role`, `createdAt`, `updatedAt`) VALUES
(10, 'amerwqb@gmail.com', NULL, NULL, NULL, NULL, '$2b$10$JoOyS.hZncnkNKTV5yjjCONkTDeU0l7WDli6YCGO2vwa7GYklW0Tq', NULL, NULL, 'TEACHER', '2025-12-26 12:02:57.143', '2025-12-26 12:02:57.143'),
(11, 'amerwqbq@gmail.com', NULL, NULL, NULL, NULL, '$2b$10$JDxlIZcMpGnSxg0aaxxnWOljmWtcCtS1m0rbiFZtCYWzDbfaA/8aK', NULL, NULL, 'STUDENT', '2025-12-26 12:06:49.887', '2025-12-26 12:06:49.887'),
(12, 'mofbq@gmail.com', NULL, NULL, NULL, NULL, '$2b$10$pbRNQIf0Q3hDIL8EdUTO7efqjlK3Qyuyvw5Zw9Y580j9dlpMXmm1G', NULL, NULL, 'STUDENT', '2025-12-26 12:07:04.798', '2025-12-26 12:07:04.798'),
(13, 'mofرbq@gmail.com', NULL, NULL, NULL, NULL, '$2b$10$DFzqP/gFT.cGjRVIm4vyqOxodR0kF5qVQs./K6S2PyOgjD4GITTXa', NULL, NULL, 'STUDENT', '2025-12-26 12:19:24.172', '2025-12-26 12:19:24.172'),
(14, 'nader@gmail.com', NULL, NULL, NULL, NULL, '$2b$10$xZwzNabR7TwbyaePaVBGkuU3oUbCAMyPmptdlSgennbD1tNOH5kFy', NULL, NULL, 'ADMIN', '2025-12-26 13:54:48.172', '2025-12-26 13:54:48.172'),
(15, 'aa@gmail.com', 'ali', 'alaa', NULL, NULL, '$2b$10$/VhMSFBhj8LLv3PjO0ctHuSdHtiRxV8hjblNVwtomrqgQE0E5aS8O', NULL, NULL, 'STUDENT', '2025-12-26 14:52:15.529', '2025-12-26 14:52:15.529'),
(16, 'ramez@gmail.com', 'ramez', 'galal', NULL, NULL, '$2b$10$KkxlADTndQ/RkQbEvbmjn.sc24jsYTGG9BV0y2vWvrPNoh.KvBHqa', NULL, NULL, 'STUDENT', '2025-12-26 21:24:54.904', '2025-12-26 21:24:54.904'),
(17, 'amira@gmail.com', 'amira', 'ali', NULL, NULL, '$2b$10$amlAwnHN1ro4b/emajnLouF1iNV7fKxhjHwwFso8TTReSGnc6X6EO', NULL, NULL, 'TEACHER', '2025-12-27 14:19:04.750', '2025-12-27 14:19:04.750'),
(18, 'sayed@gmail.com', 'sayed', 'gmail', NULL, 22, '$2b$10$K3r58U/BWdxy9izMOKx8TeDuhxK.0hqu60CQXt30wDqkdW2s4yj2i', '(+20)01118606952', 'menofia', 'EMPLOYEE', '2025-12-31 09:41:43.719', '2025-12-31 09:41:43.719'),
(19, 'mostafaessam9511@gmail.com', 'mostafa', 'essam', NULL, 21, '$2b$10$LeS77Ei3Tuu2/qgrBkVn1O3WUrhEzQNSmTFi9lRm9SN9tz.cHms9a', '(+20)01118606952', 'egypt', 'STUDENT', '2026-01-04 11:06:49.428', '2026-01-04 11:06:49.428'),
(20, 'amerwqab@gmail.com', 'amer', 'ali', 'null', 21, '$2b$10$d21H4SKI6acen4YOgzHlqe5sBpxRv4L0vx/hd.QWO4vjUSJcxyM2e', '(+20)01118606952', 'menofia', 'USER', '2026-01-04 12:20:04.217', '2026-01-04 12:20:04.217'),
(21, 'amerwqasb@gmail.com', 'amer', 'ali', 'null', 21, '$2b$10$IzOxviUstft9Tf5Y4GUcbu4zup/K4t8E.fTQN1rCDorZcFRX6jigq', '(+20)01118606952', 'menofia', 'USER', '2026-01-04 12:21:03.781', '2026-01-04 12:21:03.781');

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
('20691a09-7b87-4eae-90d5-d805e4ebaa05', '911d2b28f4617746d7c32ac408c6d1bddd957b63b4e8df80539a040ace94d5bd', '2026-01-01 18:28:19.308', '20260101182819_make_course_id_nullable', NULL, NULL, '2026-01-01 18:28:19.197', 1),
('8bee913f-09f1-4747-8d21-5bb321fb08c9', '742c8d51db2bfed7967268fd9be58472e6bc2555a340d006792c290f38903e25', '2026-01-01 09:21:12.972', '20260101092112_add_attendance_table_and_course_session_table', NULL, NULL, '2026-01-01 09:21:12.795', 1),
('90c7c8bc-2210-4818-80e4-a835dcf28c88', 'a7c178af5b88a1a27d76c06f55c556d97ac853586e06c0e195af6a279d7d33e7', '2026-01-01 15:01:41.827', '20260101150140_add_quiz_system', NULL, NULL, '2026-01-01 15:01:40.260', 1),
('a65b3c52-9ebc-4a7d-99fa-568dcf658e01', 'c9512a2d70f61c7013b0d989caf00d718ca572581a7f7af8782b37fa852c97a1', '2026-01-02 09:50:42.283', '20260102095042_add_quiz_created_by', NULL, NULL, '2026-01-02 09:50:42.235', 1),
('d6be65ae-2bee-40b3-8670-6fab2f3e2446', '5ca12e52e4afd53344eb5e575b5c475d7ba0e56f28437661e018941983e9acf1', '2025-12-31 08:43:25.118', '20251231083651_add_course_schedule_table', NULL, NULL, '2025-12-31 08:43:24.543', 1),
('e97b7f58-3985-419b-aefa-ee1cf4645ef8', '85679eabd81abbf43b01e9ee2d6c0c7419187e3251e38722f45d64e7d27bdfa2', '2026-01-03 09:22:55.160', '20260103092255_update_constraint', NULL, NULL, '2026-01-03 09:22:55.145', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `attendance_sessionId_studentId_key` (`sessionId`,`studentId`),
  ADD KEY `attendance_studentId_idx` (`studentId`),
  ADD KEY `attendance_sessionId_idx` (`sessionId`);

--
-- Indexes for table `chapter`
--
ALTER TABLE `chapter`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_chapter_course_order` (`courseId`,`order`),
  ADD KEY `idx_chapter_course_id` (`courseId`);

--
-- Indexes for table `chapterprogress`
--
ALTER TABLE `chapterprogress`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_chapter_progress_student_chapter` (`studentId`,`chapterId`),
  ADD KEY `idx_chapter_progress_student_id` (`studentId`),
  ADD KEY `idx_chapter_progress_chapter_id` (`chapterId`);

--
-- Indexes for table `course`
--
ALTER TABLE `course`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_course_teacher_id` (`teacherId`);

--
-- Indexes for table `courseschedule`
--
ALTER TABLE `courseschedule`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_course_schedule_day_time_room` (`day`,`startTime`,`room`),
  ADD KEY `idx_course_schedule_course_id` (`courseId`),
  ADD KEY `idx_course_schedule_day` (`day`);

--
-- Indexes for table `course_sessions`
--
ALTER TABLE `course_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_sessions_courseId_idx` (`courseId`);

--
-- Indexes for table `enrollment`
--
ALTER TABLE `enrollment`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_enrollment_student_course` (`studentId`,`courseId`),
  ADD KEY `idx_enrollment_student_id` (`studentId`),
  ADD KEY `idx_enrollment_course_id` (`courseId`);

--
-- Indexes for table `enrollmentrequest`
--
ALTER TABLE `enrollmentrequest`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_enrollment_request_student_course` (`studentId`,`courseId`),
  ADD KEY `idx_enrollment_request_student_id` (`studentId`),
  ADD KEY `idx_enrollment_request_course_id` (`courseId`),
  ADD KEY `idx_enrollment_request_status` (`status`);

--
-- Indexes for table `quiz`
--
ALTER TABLE `quiz`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Quiz_courseId_idx` (`courseId`),
  ADD KEY `Quiz_chapterId_idx` (`chapterId`),
  ADD KEY `Quiz_createdBy_fkey` (`createdBy`);

--
-- Indexes for table `quizattempt`
--
ALTER TABLE `quizattempt`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `QuizAttempt_quizId_studentId_key` (`quizId`,`studentId`),
  ADD KEY `QuizAttempt_studentId_idx` (`studentId`);

--
-- Indexes for table `quizattemptanswer`
--
ALTER TABLE `quizattemptanswer`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `QuizAttemptAnswer_attemptId_questionId_key` (`attemptId`,`questionId`),
  ADD KEY `QuizAttemptAnswer_attemptId_idx` (`attemptId`),
  ADD KEY `QuizAttemptAnswer_questionId_fkey` (`questionId`),
  ADD KEY `QuizAttemptAnswer_optionId_fkey` (`optionId`);

--
-- Indexes for table `quizoption`
--
ALTER TABLE `quizoption`
  ADD PRIMARY KEY (`id`),
  ADD KEY `QuizOption_questionId_idx` (`questionId`);

--
-- Indexes for table `quizquestion`
--
ALTER TABLE `quizquestion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `QuizQuestion_quizId_idx` (`quizId`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_email` (`email`),
  ADD KEY `idx_user_email` (`email`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `chapter`
--
ALTER TABLE `chapter`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `chapterprogress`
--
ALTER TABLE `chapterprogress`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `course`
--
ALTER TABLE `course`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `courseschedule`
--
ALTER TABLE `courseschedule`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `course_sessions`
--
ALTER TABLE `course_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `enrollment`
--
ALTER TABLE `enrollment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `enrollmentrequest`
--
ALTER TABLE `enrollmentrequest`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `quiz`
--
ALTER TABLE `quiz`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `quizattempt`
--
ALTER TABLE `quizattempt`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `quizattemptanswer`
--
ALTER TABLE `quizattemptanswer`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `quizoption`
--
ALTER TABLE `quizoption`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `quizquestion`
--
ALTER TABLE `quizquestion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `course_sessions` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `attendance_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `chapter`
--
ALTER TABLE `chapter`
  ADD CONSTRAINT `fk_chapter_course` FOREIGN KEY (`courseId`) REFERENCES `course` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `chapterprogress`
--
ALTER TABLE `chapterprogress`
  ADD CONSTRAINT `fk_chapter_progress_chapter` FOREIGN KEY (`chapterId`) REFERENCES `chapter` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_chapter_progress_user` FOREIGN KEY (`studentId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `course`
--
ALTER TABLE `course`
  ADD CONSTRAINT `fk_course_teacher` FOREIGN KEY (`teacherId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `courseschedule`
--
ALTER TABLE `courseschedule`
  ADD CONSTRAINT `fk_course_schedule_course` FOREIGN KEY (`courseId`) REFERENCES `course` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `course_sessions`
--
ALTER TABLE `course_sessions`
  ADD CONSTRAINT `course_sessions_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `course` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `enrollment`
--
ALTER TABLE `enrollment`
  ADD CONSTRAINT `fk_enrollment_course` FOREIGN KEY (`courseId`) REFERENCES `course` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_enrollment_user` FOREIGN KEY (`studentId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `enrollmentrequest`
--
ALTER TABLE `enrollmentrequest`
  ADD CONSTRAINT `fk_enrollment_request_course` FOREIGN KEY (`courseId`) REFERENCES `course` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_enrollment_request_user` FOREIGN KEY (`studentId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `quiz`
--
ALTER TABLE `quiz`
  ADD CONSTRAINT `Quiz_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `chapter` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Quiz_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `course` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Quiz_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `quizattempt`
--
ALTER TABLE `quizattempt`
  ADD CONSTRAINT `QuizAttempt_quizId_fkey` FOREIGN KEY (`quizId`) REFERENCES `quiz` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `QuizAttempt_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `quizattemptanswer`
--
ALTER TABLE `quizattemptanswer`
  ADD CONSTRAINT `QuizAttemptAnswer_attemptId_fkey` FOREIGN KEY (`attemptId`) REFERENCES `quizattempt` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `QuizAttemptAnswer_optionId_fkey` FOREIGN KEY (`optionId`) REFERENCES `quizoption` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `QuizAttemptAnswer_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `quizquestion` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `quizoption`
--
ALTER TABLE `quizoption`
  ADD CONSTRAINT `QuizOption_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `quizquestion` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `quizquestion`
--
ALTER TABLE `quizquestion`
  ADD CONSTRAINT `QuizQuestion_quizId_fkey` FOREIGN KEY (`quizId`) REFERENCES `quiz` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
