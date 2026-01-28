-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 28, 2026 at 12:58 PM
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
-- Table structure for table `assignment`
--

CREATE TABLE `assignment` (
  `id` int(11) NOT NULL,
  `chapterId` int(11) NOT NULL,
  `title` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `dueDate` datetime(3) NOT NULL,
  `maxGrade` int(11) NOT NULL,
  `allowLate` tinyint(1) NOT NULL DEFAULT 1,
  `createdBy` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `assignmentsubmission`
--

CREATE TABLE `assignmentsubmission` (
  `id` int(11) NOT NULL,
  `assignmentId` int(11) NOT NULL,
  `studentId` int(11) NOT NULL,
  `filePath` varchar(191) NOT NULL,
  `submittedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `status` enum('SUBMITTED','LATE','REVIEWED') NOT NULL,
  `grade` int(11) DEFAULT NULL,
  `feedback` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(4, 'chapter1', 'chapter1', '/videos/1767023058120-754837650.mp4', '/pdfs/1767023058139-358092834.pdf', 1, 3, '2025-12-29 15:44:18.151', '2025-12-29 15:44:18.151'),
(5, 'CHAPTER 2 ', 'import {\n  CanActivate,\n  ExecutionContext,\n  Injectable,\n  ForbiddenException,\n} from \'@nestjs/common\';\nimport { PrismaService } from \'src/prisma/prisma.service\';\nimport { Role } from \'@pris', '/videos/1767023137631-51829886.mp4', '/pdfs/1767023137643-930340734.pdf', 2, 3, '2025-12-29 15:45:37.657', '2025-12-29 15:45:37.657'),
(6, 'ch4', 'v454v54v54v', '/videos/1767029520976-761807342.mp4', '/pdfs/1767029521004-979311338.pdf', 3, 3, '2025-12-29 17:32:01.042', '2025-12-29 17:32:01.042'),
(7, 'chapter 3 ', 'typescript', '/videos/1767036461910-100556933.mp4', NULL, 4, 3, '2025-12-29 19:27:41.998', '2025-12-29 19:27:41.998'),
(8, 'sadsad', 'sadsadsad', '/videos/1768993442604-588236315/index.m3u8', NULL, 1, 1, '2026-01-21 11:04:17.157', '2026-01-21 11:04:17.157'),
(10, 'DWWDWD', 'DWDWWD', '/videos/1769000704506-717744048/index.m3u8', NULL, 2, 1, '2026-01-21 13:05:04.601', '2026-01-21 13:05:04.601'),
(11, 'DASDSAD', 'SDASADSADSADASD', '/videos/1769000805900-642488676/index.m3u8', NULL, 3, 1, '2026-01-21 13:06:57.967', '2026-01-21 13:06:57.967'),
(12, 'sadsad', 'sad', '/videos/1769003243400-319430729/index.m3u8', NULL, 6, 1, '2026-01-21 13:47:54.799', '2026-01-21 13:47:54.799'),
(13, 'embedded system', 'embedded system 2', '/videos/1769007723737-478580956/index.m3u8', NULL, 10, 1, '2026-01-21 15:02:14.059', '2026-01-21 15:02:14.059'),
(14, 'ch1', 'sadsadsadasdasdas', '/videos/1769008672044-813972103/index.m3u8', NULL, 1, 2, '2026-01-21 15:18:15.892', '2026-01-21 15:18:15.892'),
(15, 'ubujbuj', 'okml;;', '/videos/1769073007798-949034324/index.m3u8', NULL, 2, 2, '2026-01-22 09:10:08.042', '2026-01-22 09:10:08.042'),
(16, 'chapter', 'sadsadsadsadsd', '/videos/1769074538494-294250814/index.m3u8', NULL, 5, 1, '2026-01-22 09:36:22.827', '2026-01-22 09:36:22.827'),
(17, 'chg', 'cgf', '/videos/1769081019497-649323968/index.m3u8', NULL, 3, 2, '2026-01-22 11:24:17.403', '2026-01-22 11:24:17.403');

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

--
-- Dumping data for table `chapterprogress`
--

INSERT INTO `chapterprogress` (`id`, `studentId`, `chapterId`, `progress`, `createdAt`, `updatedAt`) VALUES
(1, 16, 6, 100, '2026-01-12 18:02:40.071', '2026-01-12 18:03:17.692'),
(2, 16, 4, 100, '2026-01-19 09:13:42.378', '2026-01-19 09:13:55.519'),
(3, 16, 7, 100, '2026-01-19 09:14:13.450', '2026-01-26 12:50:30.907'),
(4, 15, 4, 100, '2026-01-20 10:59:28.634', '2026-01-20 11:00:51.779'),
(5, 15, 5, 100, '2026-01-20 11:09:59.612', '2026-01-20 11:22:06.039'),
(6, 12, 4, 77, '2026-01-20 11:51:27.959', '2026-01-20 11:51:34.385'),
(7, 12, 7, 100, '2026-01-20 11:52:04.344', '2026-01-20 11:52:23.263'),
(8, 16, 14, 54, '2026-01-21 16:29:17.305', '2026-01-21 16:34:17.295'),
(9, 16, 17, 55, '2026-01-22 11:28:07.257', '2026-01-22 11:35:09.239');

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
  `updatedAt` datetime(3) NOT NULL,
  `discount` double DEFAULT NULL,
  `price` double NOT NULL DEFAULT 100
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `course`
--

INSERT INTO `course` (`id`, `title`, `description`, `teacherId`, `image_path`, `createdAt`, `updatedAt`, `discount`, `price`) VALUES
(1, 'ATH 101', 'Basic Mathematics', 17, '/images/1767035064828-490128286.jpg', '2025-12-28 12:48:21.249', '2025-12-28 12:48:21.249', NULL, 100),
(2, 'math 6', 'Basic Mathematics', 17, '/images/1767035064828-490128286.jpg', '2025-12-28 21:19:25.930', '2025-12-28 21:19:25.930', NULL, 100),
(3, 'js', 'java script', 17, '/images/1767079738969-570493753.png', '2025-12-29 08:29:16.289', '2025-12-30 07:28:59.958', NULL, 100),
(4, 'Math 101', 'Basic Mathematics', 10, '/images/math.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000', NULL, 100),
(5, 'Math 102', 'Intermediate Mathematics', 10, '/images/math102.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000', NULL, 100),
(6, 'Physics 101', 'Basic Physics', 10, '/images/physics.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000', NULL, 100),
(7, 'Physics 102', 'Advanced Physics', 10, '/images/physics.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000', NULL, 100),
(8, 'Chemistry 101', 'Intro to Chemistry', 10, '/images/chemistry.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000', NULL, 100),
(9, 'Statistics 101', 'Statistics Basics', 10, '/images/stat.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000', NULL, 100),
(10, 'Algebra', 'Linear Algebra Course', 10, '/images/algebra.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000', NULL, 100),
(11, 'Calculus I', 'Limits & Derivatives', 10, '/images/calculus.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000', NULL, 100),
(12, 'JS Basics', 'JavaScript for Beginners', 17, '/images/js.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000', NULL, 100),
(13, 'Advanced JS', 'Deep JavaScript Concepts', 17, '/images/js.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000', NULL, 100),
(14, 'Node.js', 'Backend with Node.js', 17, '/images/node.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000', NULL, 100),
(15, 'Express.js', 'REST APIs with Express', 17, '/images/express.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000', NULL, 100),
(16, 'NestJS', 'Scalable Backend with NestJS', 17, '/images/nest.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000', NULL, 100),
(17, 'MySQL', 'Relational Database Basics', 17, '/images/mysql.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000', NULL, 100),
(18, 'Prisma ORM', 'Modern ORM with Prisma', 17, '/images/prisma.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000', NULL, 100),
(19, 'GraphQL', 'API with GraphQL', 17, '/images/graphql.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000', NULL, 100),
(20, 'HTML & CSS', 'Frontend Basics', 10, '/images/html.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000', NULL, 100),
(21, 'React Basics', 'Frontend with React', 17, '/images/react.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000', NULL, 100),
(22, 'TypeScript', 'Typed JavaScript', 17, '/images/ts.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000', NULL, 100),
(23, 'Git & GitHub', 'Version Control', 10, '/images/git.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000', NULL, 100),
(24, 'Problem Solving', 'Algorithms Basics', 10, '/images/ps.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000', 10, 100),
(31, 'ffmpeg', 'asd', 17, '/images/1768989880134-734814272.png', '2026-01-21 10:04:42.208', '2026-01-21 10:04:42.208', 0, 200);

-- --------------------------------------------------------

--
-- Table structure for table `courseschedule`
--

CREATE TABLE `courseschedule` (
  `id` int(11) NOT NULL,
  `courseId` int(11) NOT NULL,
  `roomId` int(11) NOT NULL,
  `day` enum('SAT','SUN','MON','TUE','WED','THU','FRI') NOT NULL,
  `startTime` varchar(191) NOT NULL,
  `endTime` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `courseschedule`
--

INSERT INTO `courseschedule` (`id`, `courseId`, `roomId`, `day`, `startTime`, `endTime`) VALUES
(82, 1, 1, 'SAT', '08:00', '09:30'),
(83, 2, 2, 'SAT', '09:30', '11:00'),
(84, 3, 3, 'SAT', '11:00', '12:30'),
(86, 9, 7, 'SAT', '18:00', '19:30'),
(87, 10, 8, 'SAT', '19:30', '21:00'),
(88, 5, 1, 'SUN', '08:00', '09:30'),
(89, 6, 4, 'SUN', '09:30', '11:00'),
(90, 7, 5, 'SUN', '11:00', '12:30'),
(91, 8, 6, 'SUN', '12:30', '14:00'),
(92, 11, 9, 'SUN', '18:00', '19:30'),
(93, 12, 10, 'SUN', '19:30', '21:00'),
(94, 13, 2, 'MON', '08:00', '09:30'),
(95, 14, 3, 'MON', '09:30', '11:00'),
(96, 15, 4, 'MON', '11:00', '12:30'),
(97, 16, 6, 'MON', '12:30', '14:00'),
(98, 17, 7, 'MON', '18:00', '19:30'),
(99, 18, 1, 'TUE', '09:00', '10:30'),
(100, 19, 2, 'TUE', '10:30', '12:00'),
(101, 20, 3, 'TUE', '12:00', '13:30'),
(102, 9, 8, 'TUE', '18:00', '19:30'),
(103, 10, 4, 'WED', '08:00', '09:30'),
(104, 11, 5, 'WED', '09:30', '11:00'),
(105, 12, 6, 'WED', '11:00', '12:30'),
(106, 13, 7, 'WED', '18:00', '19:30'),
(107, 14, 1, 'THU', '09:00', '10:30'),
(108, 15, 2, 'THU', '10:30', '12:00'),
(109, 16, 3, 'THU', '12:00', '13:30'),
(110, 17, 9, 'THU', '18:00', '19:30'),
(111, 19, 3, 'SAT', '08:00', '09:00'),
(112, 20, 2, 'SAT', '08:00', '09:00'),
(114, 6, 9, 'SAT', '08:00', '08:30'),
(115, 6, 9, 'SAT', '08:30', '09:00'),
(117, 6, 4, 'SAT', '08:30', '09:00'),
(118, 5, 5, 'SAT', '08:00', '09:30'),
(119, 3, 1, 'SAT', '10:00', '13:30'),
(120, 1, 29, 'SAT', '08:00', '09:30');

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
  `roomId` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(1, 16, 3, '2026-01-10 07:39:30.649'),
(2, 16, 1, '2026-01-17 18:50:52.183'),
(3, 16, 2, '2026-01-19 08:43:18.306'),
(4, 15, 3, '2026-01-20 08:49:21.172'),
(5, 15, 2, '2026-01-20 08:51:02.567'),
(6, 15, 6, '2026-01-20 09:56:50.959'),
(7, 15, 4, '2026-01-20 10:01:11.889'),
(8, 15, 5, '2026-01-20 11:44:53.438'),
(9, 12, 3, '2026-01-20 11:49:37.852'),
(10, 12, 2, '2026-01-20 11:50:39.677');

-- --------------------------------------------------------

--
-- Table structure for table `enrollmentrequest`
--

CREATE TABLE `enrollmentrequest` (
  `id` int(11) NOT NULL,
  `studentId` int(11) NOT NULL,
  `courseId` int(11) NOT NULL,
  `status` enum('SENT','WAIT_FOR_PAY','APPROVED','REJECTED') NOT NULL DEFAULT 'SENT',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment`
--

CREATE TABLE `payment` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `courseId` int(11) NOT NULL,
  `enrollmentRequestId` int(11) NOT NULL,
  `amountCents` int(11) NOT NULL,
  `status` enum('PENDING','PAID','FAILED') NOT NULL DEFAULT 'PENDING',
  `paymobOrderId` int(11) DEFAULT NULL,
  `transactionId` int(11) DEFAULT NULL,
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
  `createdBy` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `quiz`
--

INSERT INTO `quiz` (`id`, `title`, `description`, `type`, `courseId`, `chapterId`, `startTime`, `endTime`, `durationMin`, `totalMarks`, `keepAnswers`, `isPublished`, `createdBy`, `createdAt`, `updatedAt`) VALUES
(5, 'q1', 'q1', 'CHAPTER', 3, 4, '2026-01-03 19:22:00.000', '2026-01-03 20:22:00.000', 30, 10, 0, 1, 17, '2026-01-03 19:22:25.000', '2026-01-03 19:25:44.949'),
(6, 'q2', 'q2', 'CHAPTER', 3, 5, '2026-01-03 16:12:00.000', '2026-01-04 11:05:00.000', 1, 4, 0, 1, 17, '2026-01-03 20:12:57.241', '2026-01-04 11:01:20.970'),
(7, 'سيبيسش', 'سيسشيؤر', 'CHAPTER', 3, 6, '2026-01-18 11:11:00.000', '2026-01-19 11:11:00.000', 10, 1, 0, 1, 17, '2026-01-18 11:11:51.053', '2026-01-18 12:54:00.553'),
(8, 'مصطفي عصام', 'مصطفي عصام الدين عبدالحليم عباس علي ', 'CHAPTER', 3, 5, '2026-01-26 11:50:00.000', '2026-01-26 13:51:00.000', 1, 10, 0, 1, 17, '2026-01-26 11:51:17.370', '2026-01-26 11:52:32.447');

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
(14, 6, 15, 1, 'SUBMITTED', '2026-01-04 11:04:59.541', '2026-01-04 11:05:13.074'),
(15, 8, 16, 9, 'SUBMITTED', '2026-01-26 11:53:43.151', '2026-01-26 11:54:42.819');

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
(12, 14, 10, 22, 0),
(13, 15, 12, 27, 0),
(14, 15, 13, 30, 1);

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
(23, 10, '3', 1),
(24, 11, 'سشيسيشسشي', 1),
(25, 11, 'شسيسشيسشي', 0),
(26, 12, 'مصطفي عصام', 1),
(27, 12, 'عباس علي ', 0),
(28, 12, 'احمد محمد', 0),
(29, 13, '10', 0),
(30, 13, '20', 1);

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
(10, 6, 'how are ypu ', 3, '2026-01-04 11:01:12.841'),
(11, 7, 'ثؤءئسؤء', 1, '2026-01-18 11:32:35.808'),
(12, 8, 'اسمك ايه ؟', 1, '2026-01-26 11:51:56.476'),
(13, 8, 'سنك اي ؟', 9, '2026-01-26 11:52:27.883');

-- --------------------------------------------------------

--
-- Table structure for table `room`
--

CREATE TABLE `room` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `type` enum('ONLINE','OFFLINE') NOT NULL,
  `capacity` int(11) DEFAULT NULL,
  `location` varchar(191) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `room`
--

INSERT INTO `room` (`id`, `name`, `type`, `capacity`, `location`, `isActive`, `createdAt`, `updatedAt`) VALUES
(1, 'Room A', 'OFFLINE', 30, 'Building A - Floor 1', 1, '2026-01-10 09:13:41.000', '2026-01-10 09:13:41.000'),
(2, 'Room B', 'OFFLINE', 25, 'Building A - Floor 2', 1, '2026-01-10 09:13:41.000', '2026-01-10 09:13:41.000'),
(3, 'Room C', 'OFFLINE', 40, 'Building B - Floor 1', 1, '2026-01-10 09:13:41.000', '2026-01-10 09:13:41.000'),
(4, 'Lab 1', 'OFFLINE', 20, 'Building C - Lab Area', 1, '2026-01-10 09:13:41.000', '2026-01-10 09:13:41.000'),
(5, 'Lab 2', 'OFFLINE', 15, 'Building C - Lab Area', 1, '2026-01-10 09:13:41.000', '2026-01-10 09:13:41.000'),
(6, 'Hall 1', 'OFFLINE', 60, 'Main Building - Ground Floor', 1, '2026-01-10 09:13:41.000', '2026-01-10 09:13:41.000'),
(7, 'Zoom Room 1', 'ONLINE', NULL, NULL, 1, '2026-01-10 09:13:41.000', '2026-01-10 09:13:41.000'),
(8, 'Zoom Room 2', 'ONLINE', NULL, NULL, 1, '2026-01-10 09:13:41.000', '2026-01-10 09:13:41.000'),
(9, 'Google Meet 1', 'ONLINE', NULL, NULL, 1, '2026-01-10 09:13:41.000', '2026-01-10 09:13:41.000'),
(10, 'Teams Room 1', 'ONLINE', NULL, NULL, 1, '2026-01-10 09:13:41.000', '2026-01-10 09:13:41.000'),
(27, 'room vip', 'OFFLINE', 500, 'city starts', 0, '2026-01-10 09:04:34.030', '2026-01-10 09:05:31.595'),
(28, 'asd', 'OFFLINE', 222, 'sadsadsa', 0, '2026-01-10 09:06:29.701', '2026-01-10 09:06:38.319'),
(29, 'test', 'OFFLINE', 1, 'palm stip', 1, '2026-01-10 17:38:16.460', '2026-01-10 17:38:16.460');

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
(10, 'amerwqb@gmail.com', 'عامر', 'منيب', NULL, NULL, '$2b$10$JoOyS.hZncnkNKTV5yjjCONkTDeU0l7WDli6YCGO2vwa7GYklW0Tq', NULL, NULL, 'TEACHER', '2025-12-26 12:02:57.143', '2025-12-26 12:02:57.143'),
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
(21, 'amerwqasb@gmail.com', 'amer', 'ali', 'null', 21, '$2b$10$IzOxviUstft9Tf5Y4GUcbu4zup/K4t8E.fTQN1rCDorZcFRX6jigq', '(+20)01118606952', 'menofia', 'USER', '2026-01-04 12:21:03.781', '2026-01-04 12:21:03.781'),
(22, 'company66@example.com', 'Ahmed', 'khaled', 'null', 99, '$2b$10$bTenGavRLhDD/XWqr/1Vgelcl9tuZOmURYS2SYprJx8yiXbTRqOnC', '(+20)01144271924', 'menofia', 'TEACHER', '2026-01-26 19:06:04.967', '2026-01-26 19:06:04.967'),
(23, 'company668@example.com', 'Ahmed', 'Khaled', NULL, 99, '$2b$10$v.Ld2683hjqjwucvJ5V5hOBQIoIFa/KsGglsMcCdoVrl0CHkm/8SS', '(+20)01144271924', 'menofia', 'TEACHER', '2026-01-26 19:34:09.757', '2026-01-26 19:34:09.757'),
(24, 'companىىy668@example.com', 'Ahmed', 'Khaled', NULL, 99, '$2b$10$BFxgFYCCiQHjh1RUBeXnzexBqBsC4cRgIVpoasCZPbS3PGO8LTQYK', '(+20)01144271924', 'menofia', 'USER', '2026-01-26 20:22:42.475', '2026-01-26 20:22:42.475'),
(25, 'companccy668@example.com', 'Ahmed', 'Khaled', NULL, 99, '$2b$10$aa/1.fugE/Rf34hMnoorxuPupbENCF.JMvpFRjfDxaeLG1Ech6uGu', '(+20)01144271924', 'menofia', 'USER', '2026-01-26 20:29:21.957', '2026-01-26 20:29:21.957'),
(26, 'companccccy668@example.com', 'Ahmed', 'Khaled', NULL, 99, '$2b$10$KBaGwNRw6EHtRya9.hj9DuI1EZ1n8xDwCO4nTWHKSI23kQbgRV5Qm', '(+20)01144271924', 'menofia', 'USER', '2026-01-26 20:30:19.174', '2026-01-26 20:30:19.174'),
(27, 'companccccccy668@example.com', 'Ahmed', 'Khaled', NULL, 99, '$2b$10$0.SvmEsOWjEYzoJIKC9leOuas8DUwTLmPDBeWqerRAPwKC9WBD292', '(+20)01144271924', 'menofia', 'USER', '2026-01-26 20:32:41.011', '2026-01-26 20:32:41.011'),
(28, 'companccddccccy668@example.com', 'Ahmed', 'Khaled', NULL, NULL, '$2b$10$2ZsEh3A05TWA.n.I0wQ0Cuzd6ayVXihdptqD6F5TDRq0r9I5tIAP2', '(+20)01144271924', 'menofia', 'USER', '2026-01-26 20:47:51.050', '2026-01-26 20:47:51.050'),
(29, 'companddccddccccy668@example.com', 'Ahmed', 'Khaled', NULL, NULL, '$2b$10$n8ayo1HCsIpihgW2b4INrOEK4SyhlTzc7p/Q.1ImxWNr3cRjBpjty', '(+20)01144271924', NULL, 'USER', '2026-01-26 20:48:28.648', '2026-01-26 20:48:28.648'),
(30, 'companddccddcccdcy668@example.com', 'Ahmed', 'Khaled', NULL, NULL, '$2b$10$fbbxk/abb3yvrcd7yJf2IOPif.cZ9w24G8SQd8iOQN2vGFSe4hrHe', '(+20)01144271924', NULL, 'USER', '2026-01-26 20:56:31.459', '2026-01-26 20:56:31.459'),
(31, 'companddccddcccdcy66d8@example.com', 'Ahmed', 'Khaled', NULL, NULL, '$2b$10$vs3NUQWBSeP9gjVVdIo.R.fU3RFdPol4pbsOZVrUyLtrpTM8QJJ16', '(+20)01144271924', NULL, 'USER', '2026-01-26 21:28:25.074', '2026-01-26 21:28:25.074'),
(32, 'companddccddcccdcy6c6d8@example.com', 'Ahmed', 'Khaled', NULL, NULL, '$2b$10$pbiYhwZRvtSVPvZRliMhL.NNB560yeGk7jphuA0U09D4cxWZ/oLja', '(+20)01144271924', NULL, 'USER', '2026-01-26 21:29:24.793', '2026-01-26 21:29:24.793'),
(33, 'cccddcccdcy6c6d8@example.com', 'Ahmed', 'Khaled', NULL, NULL, '$2b$10$SnTLzfDCeML/7xPDVmiUf.eV6/3ys6X8LtDoxmuccw/FvOVhQPAeW', '(+20)01144271924', NULL, 'USER', '2026-01-27 11:36:25.737', '2026-01-27 11:36:25.737'),
(34, 'cccddcccdfcy6c6d8@example.com', 'Ahmed', 'Khaled', NULL, NULL, '$2b$10$fpn.CYokm58Ym2.PcYFazOdZkvOiymC1fZzlfjfGzEs/F9Inxm5ae', '(+20)01144271924', NULL, 'USER', '2026-01-27 11:37:04.715', '2026-01-27 11:37:04.715');

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
('828fd9ae-85a9-4d6d-a250-f18b386b81e9', '87c17b3cc385b70da7f48a2dd92a1d143c7492109a8717c411f9e762e77e7e5d', '2026-01-10 06:54:48.074', '20260110065440_add_all_tables', NULL, NULL, '2026-01-10 06:54:40.952', 1),
('ed560b34-8b78-462c-8b49-8a63421171d1', '94bdc539127d3319aeaf2987b96609c3e1c3361ab998e0faa591c5a8e64ec348', '2026-01-18 11:16:47.652', '20260118111647_finalize_payment_schema', NULL, NULL, '2026-01-18 11:16:47.496', 1),
('f26faecf-ae5c-41c2-97a5-9b2ff824fab7', '2a3379c47ba7f7d2811e352052514880d725a6708ac42055f034e7a62ca25e4a', '2026-01-17 18:23:02.566', '20260117182302_update_enrollment_request_status', NULL, NULL, '2026-01-17 18:23:02.515', 1),
('ff77881c-c51e-40c8-bf7a-f01a0eb9ce61', '3e7687b4288d56cc559c7efdc82b8fff1eb86d7ab63ba76180f66ab1e979d6fa', '2026-01-17 16:44:28.440', '20260117164428_add_price_to_course', NULL, NULL, '2026-01-17 16:44:28.430', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `assignment`
--
ALTER TABLE `assignment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `assignment_chapterId_idx` (`chapterId`),
  ADD KEY `assignment_createdBy_idx` (`createdBy`);

--
-- Indexes for table `assignmentsubmission`
--
ALTER TABLE `assignmentsubmission`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `assignmentsubmission_assignmentId_studentId_key` (`assignmentId`,`studentId`),
  ADD KEY `assignmentsubmission_studentId_idx` (`studentId`),
  ADD KEY `assignmentsubmission_assignmentId_idx` (`assignmentId`);

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
  ADD UNIQUE KEY `courseschedule_day_startTime_roomId_key` (`day`,`startTime`,`roomId`),
  ADD KEY `courseschedule_courseId_idx` (`courseId`),
  ADD KEY `courseschedule_day_idx` (`day`),
  ADD KEY `courseschedule_roomId_idx` (`roomId`);

--
-- Indexes for table `course_sessions`
--
ALTER TABLE `course_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_sessions_roomId_idx` (`roomId`),
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
-- Indexes for table `payment`
--
ALTER TABLE `payment`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Payment_enrollmentRequestId_key` (`enrollmentRequestId`),
  ADD KEY `Payment_userId_idx` (`userId`),
  ADD KEY `Payment_courseId_idx` (`courseId`);

--
-- Indexes for table `quiz`
--
ALTER TABLE `quiz`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Quiz_courseId_idx` (`courseId`),
  ADD KEY `Quiz_chapterId_idx` (`chapterId`),
  ADD KEY `idx_quiz_created_by` (`createdBy`);

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
-- Indexes for table `room`
--
ALTER TABLE `room`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `room_name_key` (`name`);

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
-- AUTO_INCREMENT for table `assignment`
--
ALTER TABLE `assignment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `assignmentsubmission`
--
ALTER TABLE `assignmentsubmission`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `chapter`
--
ALTER TABLE `chapter`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `chapterprogress`
--
ALTER TABLE `chapterprogress`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `course`
--
ALTER TABLE `course`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `courseschedule`
--
ALTER TABLE `courseschedule`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=121;

--
-- AUTO_INCREMENT for table `course_sessions`
--
ALTER TABLE `course_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `enrollment`
--
ALTER TABLE `enrollment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `enrollmentrequest`
--
ALTER TABLE `enrollmentrequest`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `payment`
--
ALTER TABLE `payment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `quiz`
--
ALTER TABLE `quiz`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `quizattempt`
--
ALTER TABLE `quizattempt`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `quizattemptanswer`
--
ALTER TABLE `quizattemptanswer`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `quizoption`
--
ALTER TABLE `quizoption`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `quizquestion`
--
ALTER TABLE `quizquestion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `room`
--
ALTER TABLE `room`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `assignment`
--
ALTER TABLE `assignment`
  ADD CONSTRAINT `assignment_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `chapter` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `assignment_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `assignmentsubmission`
--
ALTER TABLE `assignmentsubmission`
  ADD CONSTRAINT `assignmentsubmission_assignmentId_fkey` FOREIGN KEY (`assignmentId`) REFERENCES `assignment` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `assignmentsubmission_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `course_sessions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
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
  ADD CONSTRAINT `fk_chapter_progress_chapter` FOREIGN KEY (`chapterId`) REFERENCES `chapter` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
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
  ADD CONSTRAINT `courseschedule_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `course` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `courseschedule_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `room` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `course_sessions`
--
ALTER TABLE `course_sessions`
  ADD CONSTRAINT `course_sessions_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `course` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `course_sessions_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `room` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `enrollment`
--
ALTER TABLE `enrollment`
  ADD CONSTRAINT `fk_enrollment_course` FOREIGN KEY (`courseId`) REFERENCES `course` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_enrollment_user` FOREIGN KEY (`studentId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `enrollmentrequest`
--
ALTER TABLE `enrollmentrequest`
  ADD CONSTRAINT `fk_enrollment_request_course` FOREIGN KEY (`courseId`) REFERENCES `course` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_enrollment_request_user` FOREIGN KEY (`studentId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `payment`
--
ALTER TABLE `payment`
  ADD CONSTRAINT `Payment_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `course` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Payment_enrollmentRequestId_fkey` FOREIGN KEY (`enrollmentRequestId`) REFERENCES `enrollmentrequest` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Payment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `quiz`
--
ALTER TABLE `quiz`
  ADD CONSTRAINT `quiz_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `chapter` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `quiz_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `course` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `quiz_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `quizattempt`
--
ALTER TABLE `quizattempt`
  ADD CONSTRAINT `quizattempt_quizId_fkey` FOREIGN KEY (`quizId`) REFERENCES `quiz` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `quizattempt_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `quizattemptanswer`
--
ALTER TABLE `quizattemptanswer`
  ADD CONSTRAINT `quizattemptanswer_attemptId_fkey` FOREIGN KEY (`attemptId`) REFERENCES `quizattempt` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `quizattemptanswer_optionId_fkey` FOREIGN KEY (`optionId`) REFERENCES `quizoption` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `quizattemptanswer_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `quizquestion` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `quizoption`
--
ALTER TABLE `quizoption`
  ADD CONSTRAINT `quizoption_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `quizquestion` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `quizquestion`
--
ALTER TABLE `quizquestion`
  ADD CONSTRAINT `quizquestion_quizId_fkey` FOREIGN KEY (`quizId`) REFERENCES `quiz` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
