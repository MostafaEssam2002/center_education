-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 10, 2026 at 07:10 PM
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
(7, 'chapter 3 ', 'typescript', '/videos/1767036461910-100556933.mp4', NULL, 4, 3, '2025-12-29 19:27:41.998', '2025-12-29 19:27:41.998');

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
(1, 'ATH 101', 'Basic Mathematics', 17, '/images/1767035064828-490128286.jpg', '2025-12-28 12:48:21.249', '2025-12-28 12:48:21.249'),
(2, 'math 6', 'Basic Mathematics', 17, '/images/1767035064828-490128286.jpg', '2025-12-28 21:19:25.930', '2025-12-28 21:19:25.930'),
(3, 'js', 'java script', 17, '/images/1767079738969-570493753.png', '2025-12-29 08:29:16.289', '2025-12-30 07:28:59.958'),
(4, 'Math 101', 'Basic Mathematics', 10, '/images/math.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000'),
(5, 'Math 102', 'Intermediate Mathematics', 10, '/images/math102.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000'),
(6, 'Physics 101', 'Basic Physics', 10, '/images/physics.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000'),
(7, 'Physics 102', 'Advanced Physics', 10, '/images/physics.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000'),
(8, 'Chemistry 101', 'Intro to Chemistry', 10, '/images/chemistry.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000'),
(9, 'Statistics 101', 'Statistics Basics', 10, '/images/stat.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000'),
(10, 'Algebra', 'Linear Algebra Course', 10, '/images/algebra.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000'),
(11, 'Calculus I', 'Limits & Derivatives', 10, '/images/calculus.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000'),
(12, 'JS Basics', 'JavaScript for Beginners', 17, '/images/js.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000'),
(13, 'Advanced JS', 'Deep JavaScript Concepts', 17, '/images/js.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000'),
(14, 'Node.js', 'Backend with Node.js', 17, '/images/node.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000'),
(15, 'Express.js', 'REST APIs with Express', 17, '/images/express.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000'),
(16, 'NestJS', 'Scalable Backend with NestJS', 17, '/images/nest.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000'),
(17, 'MySQL', 'Relational Database Basics', 17, '/images/mysql.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000'),
(18, 'Prisma ORM', 'Modern ORM with Prisma', 17, '/images/prisma.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000'),
(19, 'GraphQL', 'API with GraphQL', 17, '/images/graphql.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000'),
(20, 'HTML & CSS', 'Frontend Basics', 10, '/images/html.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000'),
(21, 'React Basics', 'Frontend with React', 17, '/images/react.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000'),
(22, 'TypeScript', 'Typed JavaScript', 17, '/images/ts.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000'),
(23, 'Git & GitHub', 'Version Control', 10, '/images/git.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000'),
(24, 'Problem Solving', 'Algorithms Basics', 10, '/images/ps.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000');

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
(118, 5, 5, 'SAT', '08:00', '09:30');

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
(1, 16, 3, '2026-01-10 07:39:30.649');

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
  `createdBy` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `quiz`
--

INSERT INTO `quiz` (`id`, `title`, `description`, `type`, `courseId`, `chapterId`, `startTime`, `endTime`, `durationMin`, `totalMarks`, `keepAnswers`, `isPublished`, `createdBy`, `createdAt`, `updatedAt`) VALUES
(5, 'q1', 'q1', 'CHAPTER', 3, 4, '2026-01-03 19:22:00.000', '2026-01-03 20:22:00.000', 30, 10, 0, 1, 17, '2026-01-03 19:22:25.000', '2026-01-03 19:25:44.949'),
(6, 'q2', 'q2', 'CHAPTER', 3, 5, '2026-01-03 16:12:00.000', '2026-01-04 11:05:00.000', 1, 4, 0, 1, 17, '2026-01-03 20:12:57.241', '2026-01-04 11:01:20.970');

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
('828fd9ae-85a9-4d6d-a250-f18b386b81e9', '87c17b3cc385b70da7f48a2dd92a1d143c7492109a8717c411f9e762e77e7e5d', '2026-01-10 06:54:48.074', '20260110065440_add_all_tables', NULL, NULL, '2026-01-10 06:54:40.952', 1);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `courseschedule`
--
ALTER TABLE `courseschedule`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=119;

--
-- AUTO_INCREMENT for table `course_sessions`
--
ALTER TABLE `course_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `enrollment`
--
ALTER TABLE `enrollment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `enrollmentrequest`
--
ALTER TABLE `enrollmentrequest`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `quiz`
--
ALTER TABLE `quiz`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `quizattempt`
--
ALTER TABLE `quizattempt`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

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
-- AUTO_INCREMENT for table `room`
--
ALTER TABLE `room`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

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
