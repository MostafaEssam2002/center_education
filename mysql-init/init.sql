-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 11, 2026 at 06:09 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";
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

--
-- Dumping data for table `assignment`
--

INSERT INTO `assignment` (`id`, `chapterId`, `title`, `description`, `dueDate`, `maxGrade`, `allowLate`, `createdBy`, `createdAt`, `updatedAt`) VALUES
(1, 8, 'واجب chapter 4 ', 'اعمل loop لطباعه الارقام من 1 الي 100 ', '2026-03-05 19:38:00.000', 100, 0, 17, '2026-03-04 19:39:02.051', '2026-03-04 19:39:02.051'),
(2, 9, 'type script assignment ', 'create function to calculate area of rectangle', '2026-03-11 12:46:00.000', 100, 0, 17, '2026-03-06 12:47:02.667', '2026-03-06 12:47:02.667'),
(3, 4, 'asdsad', 'asdsadasd', '2026-03-11 09:52:00.000', 100, 0, 17, '2026-03-11 09:46:40.562', '2026-03-11 09:46:40.562'),
(4, 8, 'dsadas', 'dsadsadsad', '2026-03-11 09:51:00.000', 100, 0, 17, '2026-03-11 09:47:03.245', '2026-03-11 09:47:03.245');

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

--
-- Dumping data for table `assignmentsubmission`
--

INSERT INTO `assignmentsubmission` (`id`, `assignmentId`, `studentId`, `filePath`, `submittedAt`, `status`, `grade`, `feedback`) VALUES
(1, 1, 22, '/pdfs/1775331571809-25594683.pdf', '2026-03-04 19:39:31.853', 'REVIEWED', 100, 'good job');

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
(1, 1, 16, 'LATE', '2026-03-10 09:49:56.139'),
(2, 1, 15, 'LATE', '2026-03-10 09:49:56.139'),
(3, 1, 13, 'PRESENT', '2026-03-10 09:49:56.139'),
(4, 1, 22, 'LATE', '2026-03-10 09:49:56.139'),
(5, 2, 16, 'PRESENT', '2026-03-10 13:11:11.200');

-- --------------------------------------------------------

--
-- Table structure for table `broadcastrecipient`
--

CREATE TABLE `broadcastrecipient` (
  `id` int(11) NOT NULL,
  `messageId` int(11) NOT NULL,
  `studentId` int(11) NOT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT 0,
  `readAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `broadcastrecipient`
--

INSERT INTO `broadcastrecipient` (`id`, `messageId`, `studentId`, `isRead`, `readAt`, `createdAt`) VALUES
(1, 5, 15, 0, NULL, '2026-03-06 12:54:42.848'),
(2, 5, 16, 1, '2026-03-06 12:54:55.149', '2026-03-06 12:54:42.848'),
(3, 5, 13, 0, NULL, '2026-03-06 12:54:42.848'),
(4, 5, 22, 1, '2026-03-11 09:02:58.220', '2026-03-06 12:54:42.848');

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
(8, 'chapter 4', 'تعلم المتغيرات و الشروط', '/videos/1775331397615-127654696/index.m3u8', '/pdfs/1775331422061-883467287.pdf', 5, 3, '2026-03-04 19:37:02.148', '2026-03-04 19:37:02.148'),
(9, 'chapter 6 ', 'type script', '/videos/1775479492809-724117148/index.m3u8', '/pdfs/1775479558058-73681727.pdf', 6, 3, '2026-03-06 12:45:58.077', '2026-03-06 12:45:58.077');

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
(1, 16, 7, 32, '2026-03-02 19:24:51.774', '2026-03-02 19:25:02.203'),
(2, 22, 8, 13, '2026-03-04 19:37:32.072', '2026-03-04 19:37:37.834');

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
  `price` double NOT NULL DEFAULT 100,
  `monthlyPrice` double DEFAULT NULL,
  `paymentType` enum('ONE_TIME','MONTHLY') NOT NULL DEFAULT 'ONE_TIME'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `course`
--

INSERT INTO `course` (`id`, `title`, `description`, `teacherId`, `image_path`, `createdAt`, `updatedAt`, `discount`, `price`, `monthlyPrice`, `paymentType`) VALUES
(1, 'ATH 101', 'Basic Mathematics', 17, '/images/1767035064828-490128286.jpg', '2025-12-28 12:48:21.249', '2025-12-28 12:48:21.249', NULL, 100, NULL, 'ONE_TIME'),
(2, 'math 6', 'Basic Mathematics', 17, '/images/1767035064828-490128286.jpg', '2025-12-28 21:19:25.930', '2025-12-28 21:19:25.930', NULL, 100, NULL, 'ONE_TIME'),
(3, 'js', 'java script', 17, '/images/1767079738969-570493753.png', '2025-12-29 08:29:16.289', '2025-12-30 07:28:59.958', 0, 0, 100, 'MONTHLY'),
(4, 'Math 101', 'Basic Mathematics', 10, '/images/math.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000', NULL, 100, NULL, 'ONE_TIME'),
(5, 'Math 102', 'Intermediate Mathematics', 10, '/images/math102.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000', NULL, 100, NULL, 'ONE_TIME'),
(6, 'Physics 101', 'Basic Physics', 10, '/images/physics.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000', NULL, 100, NULL, 'ONE_TIME'),
(7, 'Physics 102', 'Advanced Physics', 10, '/images/physics.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000', NULL, 100, NULL, 'ONE_TIME'),
(8, 'Chemistry 101', 'Intro to Chemistry', 10, '/images/chemistry.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000', NULL, 100, NULL, 'ONE_TIME'),
(9, 'Statistics 101', 'Statistics Basics', 10, '/images/stat.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000', NULL, 100, NULL, 'ONE_TIME'),
(10, 'Algebra', 'Linear Algebra Course', 10, '/images/algebra.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000', NULL, 100, NULL, 'ONE_TIME'),
(11, 'Calculus I', 'Limits & Derivatives', 10, '/images/calculus.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000', NULL, 100, NULL, 'ONE_TIME'),
(12, 'JS Basics', 'JavaScript for Beginners', 17, '/images/js.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000', NULL, 100, NULL, 'ONE_TIME'),
(13, 'Advanced JS', 'Deep JavaScript Concepts', 17, '/images/js.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000', NULL, 100, NULL, 'ONE_TIME'),
(14, 'Node.js', 'Backend with Node.js', 17, '/images/node.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000', NULL, 100, NULL, 'ONE_TIME'),
(15, 'Express.js', 'REST APIs with Express', 17, '/images/express.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000', NULL, 100, NULL, 'ONE_TIME'),
(16, 'NestJS', 'Scalable Backend with NestJS', 17, '/images/nest.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000', NULL, 100, NULL, 'ONE_TIME'),
(17, 'MySQL', 'Relational Database Basics', 17, '/images/mysql.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000', NULL, 100, NULL, 'ONE_TIME'),
(18, 'Prisma ORM', 'Modern ORM with Prisma', 17, '/images/prisma.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000', NULL, 100, NULL, 'ONE_TIME'),
(19, 'GraphQL', 'API with GraphQL', 17, '/images/graphql.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000', NULL, 100, NULL, 'ONE_TIME'),
(20, 'HTML & CSS', 'Frontend Basics', 10, '/images/html.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000', NULL, 100, NULL, 'ONE_TIME'),
(21, 'React Basics', 'Frontend with React', 17, '/images/react.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000', NULL, 100, NULL, 'ONE_TIME'),
(22, 'TypeScript', 'Typed JavaScript', 17, '/images/ts.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000', NULL, 100, NULL, 'ONE_TIME'),
(23, 'Git & GitHub', 'Version Control', 10, '/images/git.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000', NULL, 100, NULL, 'ONE_TIME'),
(24, 'Problem Solving', 'Algorithms Basics', 10, '/images/ps.png', '2026-01-10 10:03:20.000', '2026-01-10 10:03:20.000', NULL, 100, NULL, 'ONE_TIME'),
(25, 'الطبخ', 'تعلم الطبخ فش ستع ', 17, '/images/1775222010374-902005665.png', '2026-03-03 13:13:32.237', '2026-03-03 13:13:32.237', 0, 0, 100, 'MONTHLY');

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
(117, 6, 4, 'SAT', '08:30', '09:30'),
(118, 5, 5, 'SAT', '08:00', '09:30'),
(119, 4, 1, 'SAT', '10:30', '12:00'),
(120, 2, 29, 'WED', '08:00', '09:30'),
(121, 2, 2, 'WED', '08:00', '10:00');

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

--
-- Dumping data for table `course_sessions`
--

INSERT INTO `course_sessions` (`id`, `courseId`, `date`, `startTime`, `endTime`, `roomId`, `createdAt`) VALUES
(1, 3, '2026-03-10 00:00:00.000', '11:04', '11:06', 29, '2026-03-10 09:04:44.990'),
(2, 2, '2026-03-10 00:00:00.000', '15:10', '15:13', 3, '2026-03-10 13:10:55.004'),
(3, 3, '2026-03-10 00:00:00.000', '15:11', '15:12', 2, '2026-03-10 13:11:35.962');

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
(2, 16, 25, '2026-03-03 14:59:48.833'),
(3, 15, 25, '2026-03-03 16:06:25.401'),
(4, 11, 25, '2026-03-03 17:02:07.345'),
(5, 13, 25, '2026-03-03 17:15:55.118'),
(6, 19, 25, '2026-03-03 17:26:12.255'),
(7, 16, 2, '2026-03-04 11:09:12.958'),
(8, 15, 3, '2026-03-04 11:30:28.726'),
(9, 13, 3, '2026-03-04 11:36:19.916'),
(10, 22, 3, '2026-03-04 19:33:33.932');

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

--
-- Dumping data for table `enrollmentrequest`
--

INSERT INTO `enrollmentrequest` (`id`, `studentId`, `courseId`, `status`, `createdAt`) VALUES
(10, 16, 19, 'WAIT_FOR_PAY', '2026-03-06 12:53:36.968'),
(11, 22, 2, 'SENT', '2026-03-11 09:03:09.690'),
(12, 22, 1, 'SENT', '2026-03-11 09:03:12.799'),
(13, 22, 4, 'WAIT_FOR_PAY', '2026-03-11 09:03:15.434');

-- --------------------------------------------------------

--
-- Table structure for table `message`
--

CREATE TABLE `message` (
  `id` int(11) NOT NULL,
  `content` text NOT NULL,
  `type` enum('COURSE_BROADCAST','TO_TEACHER','TO_EMPLOYEE') NOT NULL,
  `senderId` int(11) NOT NULL,
  `receiverId` int(11) DEFAULT NULL,
  `courseId` int(11) DEFAULT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `imageUrl` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `message`
--

INSERT INTO `message` (`id`, `content`, `type`, `senderId`, `receiverId`, `courseId`, `isRead`, `createdAt`, `imageUrl`) VALUES
(1, 'اهلا بحضرتك', 'TO_TEACHER', 22, 17, 3, 1, '2026-03-04 19:45:34.319', NULL),
(2, 'سعيد بانضمامي الي الكورس', 'TO_TEACHER', 22, 17, 3, 1, '2026-03-04 19:45:46.260', NULL),
(3, 'اهلا بيك', 'TO_TEACHER', 17, 22, 3, 1, '2026-03-04 19:46:03.885', NULL),
(4, 'اتمني لك التوفيق', 'TO_TEACHER', 17, 22, 3, 1, '2026-03-04 19:46:16.075', NULL),
(5, 'تم تغيير ميعاد المحاضره الي الساعه 1 ظهرا', 'COURSE_BROADCAST', 17, NULL, 3, 0, '2026-03-06 12:54:42.841', NULL),
(6, 'ازيك يا عمور', 'TO_EMPLOYEE', 14, 22, NULL, 1, '2026-03-11 08:25:47.616', NULL),
(7, 'ازيك يا عامر', 'TO_EMPLOYEE', 14, 21, NULL, 0, '2026-03-11 08:26:53.228', NULL),
(8, 'اهلا بيك يا غالي', 'TO_EMPLOYEE', 22, 14, NULL, 1, '2026-03-11 09:02:47.996', NULL),
(9, 'السلام عليكم', 'TO_EMPLOYEE', 14, 18, NULL, 0, '2026-03-11 12:26:03.975', NULL),
(10, 'كيف الحال', 'TO_EMPLOYEE', 14, 18, NULL, 0, '2026-03-11 12:26:14.753', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `monthlysubscription`
--

CREATE TABLE `monthlysubscription` (
  `id` int(11) NOT NULL,
  `courseId` int(11) NOT NULL,
  `studentId` int(11) NOT NULL,
  `month` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `amountCents` int(11) NOT NULL,
  `status` enum('PENDING','PAID','OVERDUE') NOT NULL DEFAULT 'PENDING',
  `dueDate` datetime(3) NOT NULL,
  `paidAt` datetime(3) DEFAULT NULL,
  `transactionId` int(11) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `monthlysubscription`
--

INSERT INTO `monthlysubscription` (`id`, `courseId`, `studentId`, `month`, `year`, `amountCents`, `status`, `dueDate`, `paidAt`, `transactionId`, `createdAt`, `updatedAt`) VALUES
(1, 25, 16, 4, 2026, 10000, 'PAID', '2026-03-01 00:00:00.000', '2026-03-03 15:57:47.195', NULL, '2026-03-03 15:13:00.374', '2026-03-03 15:57:47.218'),
(2, 25, 15, 4, 2026, 10000, 'PAID', '2026-03-01 00:00:00.000', '2026-03-03 16:15:54.237', NULL, '2026-03-03 16:14:26.971', '2026-03-03 16:15:54.898'),
(3, 25, 11, 4, 2026, 10000, 'PAID', '2026-03-01 00:00:00.000', '2026-03-10 13:09:55.489', NULL, '2026-03-03 17:07:08.940', '2026-03-10 13:09:55.498'),
(4, 25, 13, 4, 2026, 10000, 'PAID', '2026-03-01 00:00:00.000', '2026-03-10 13:09:49.012', NULL, '2026-03-03 17:18:29.843', '2026-03-10 13:09:49.023'),
(5, 25, 19, 4, 2026, 10000, 'PAID', '2026-03-01 00:00:00.000', '2026-03-10 13:09:45.590', NULL, '2026-03-04 10:56:11.450', '2026-03-10 13:09:45.598'),
(6, 3, 16, 4, 2026, 10000, 'PAID', '2026-03-01 00:00:00.000', '2026-03-10 08:57:48.685', NULL, '2026-03-04 11:25:11.781', '2026-03-10 08:57:48.696'),
(7, 3, 15, 4, 2026, 10000, 'PAID', '2026-03-01 00:00:00.000', '2026-03-10 08:57:50.771', NULL, '2026-03-04 11:32:25.047', '2026-03-10 08:57:50.777'),
(8, 3, 13, 4, 2026, 10000, 'PAID', '2026-03-01 00:00:00.000', '2026-03-10 08:57:51.296', NULL, '2026-03-04 11:39:59.356', '2026-03-10 08:57:51.304'),
(9, 3, 22, 4, 2026, 10000, 'PAID', '2026-03-01 00:00:00.000', '2026-03-10 08:57:52.093', NULL, '2026-03-06 11:59:55.756', '2026-03-10 08:57:52.099');

-- --------------------------------------------------------

--
-- Table structure for table `otp`
--

CREATE TABLE `otp` (
  `id` int(11) NOT NULL,
  `email` varchar(191) NOT NULL,
  `otp` varchar(191) NOT NULL,
  `expiresAt` datetime(3) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `userId` int(11) DEFAULT NULL
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
(7, 'اختبار الفصل الرابع ', 'اختبار الفصل الرابع ', 'CHAPTER', 3, 8, '2026-03-04 19:40:00.000', '2026-03-06 19:40:00.000', 5, 10, 1, 1, 17, '2026-03-04 19:40:46.724', '2026-03-04 19:43:28.460'),
(8, 'chapter 6 quiz', NULL, 'CHAPTER', 3, 9, '2026-03-06 12:47:00.000', '2026-03-07 12:47:00.000', 30, 5, 1, 1, 17, '2026-03-06 12:47:49.863', '2026-03-06 12:49:42.486'),
(9, 'final test', 'sadsadasdasdasd', 'CHAPTER', 3, 7, '2026-03-11 09:34:00.000', '2026-03-18 09:34:00.000', 30, 3, 0, 1, 17, '2026-03-11 09:34:43.479', '2026-03-11 09:35:17.818'),
(10, 'bvcxxcv', 'vcxcvcx', 'CHAPTER', 3, 9, '2026-03-11 09:41:00.000', '2026-03-12 00:45:00.000', 30, 10, 0, 1, 17, '2026-03-11 09:42:03.082', '2026-03-11 09:42:19.684'),
(11, 'dwdwd', 'wdwdwdwd', 'CHAPTER', 3, 7, '2026-03-11 09:45:00.000', '2026-03-11 09:51:00.000', 30, 10, 0, 1, 17, '2026-03-11 09:45:28.143', '2026-03-11 09:45:50.890');

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
(15, 7, 22, 2, 'SUBMITTED', '2026-03-04 19:43:47.257', '2026-03-04 19:44:05.383');

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
(13, 15, 11, 24, 1),
(14, 15, 12, 29, 1),
(15, 15, 13, 34, 0);

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
(24, 11, 'const ', 1),
(25, 11, 'let', 0),
(26, 11, 'var', 0),
(27, 11, 'echo', 0),
(28, 12, 'const', 0),
(29, 12, 'let', 1),
(30, 12, 'while', 0),
(31, 12, 'if', 0),
(32, 13, 'js', 0),
(33, 13, 'php', 0),
(34, 13, 'nest', 0),
(35, 13, 'node js', 1),
(36, 14, 'const x', 0),
(37, 14, 'var x', 1),
(38, 14, 'x=10', 0),
(39, 15, 'const x = 0', 1),
(40, 15, 'let x = 2', 0),
(41, 15, 'var x = 10', 0),
(42, 16, 'while', 1),
(43, 16, 'for ', 0),
(44, 16, 'foreach', 0),
(45, 17, 'as', 1),
(46, 17, 'sasas', 0),
(47, 18, 'sad', 1),
(48, 18, 'das', 0),
(49, 19, 'asd', 1),
(50, 19, 'sad', 0),
(51, 20, 'asdsad', 1),
(52, 20, 'sadsadsa', 0),
(53, 21, 'sdsadasdsa', 1),
(54, 21, 'sda', 0),
(55, 21, 'sad', 0);

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
(11, 7, 'طريقه تعريف ثابت ', 1, '2026-03-04 19:41:33.604'),
(12, 7, 'طريقه تعريف متغير ', 1, '2026-03-04 19:42:23.411'),
(13, 7, 'ما هي اللغه المستخدمه', 8, '2026-03-04 19:43:24.628'),
(14, 8, 'decleare variable', 1, '2026-03-06 12:48:30.226'),
(15, 8, 'declear constant', 2, '2026-03-06 12:49:07.849'),
(16, 8, 'llop', 2, '2026-03-06 12:49:34.947'),
(17, 9, 'sdaS', 1, '2026-03-11 09:34:52.818'),
(18, 9, 'sdsadas', 1, '2026-03-11 09:35:06.992'),
(19, 9, 'sad', 1, '2026-03-11 09:35:15.363'),
(20, 10, 'fgbnm,kjhgf', 10, '2026-03-11 09:42:16.624'),
(21, 11, 'dasdsadsad', 10, '2026-03-11 09:45:44.349');

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
(29, 'test', 'OFFLINE', 1, 'palm stip', 1, '2026-01-10 17:38:16.460', '2026-01-10 17:38:16.460'),
(30, 'room 5f', 'OFFLINE', 50, 'الدور الرابع', 1, '2026-03-11 12:26:54.612', '2026-03-11 12:26:54.612');

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
  `updatedAt` datetime(3) NOT NULL,
  `AdditionalAddress` varchar(191) DEFAULT NULL,
  `Center_name` varchar(191) DEFAULT NULL,
  `cityCode` varchar(191) DEFAULT NULL,
  `countryCode` varchar(191) DEFAULT NULL,
  `isVerified` tinyint(1) NOT NULL DEFAULT 0,
  `regionId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `email`, `first_name`, `last_name`, `image_path`, `age`, `password`, `phone`, `address`, `role`, `createdAt`, `updatedAt`, `AdditionalAddress`, `Center_name`, `cityCode`, `countryCode`, `isVerified`, `regionId`) VALUES
(10, 'amerwqb@gmail.com', 'salah', 'shaban', NULL, NULL, '$2b$10$JoOyS.hZncnkNKTV5yjjCONkTDeU0l7WDli6YCGO2vwa7GYklW0Tq', NULL, NULL, 'TEACHER', '2025-12-26 12:02:57.143', '2025-12-26 12:02:57.143', NULL, NULL, NULL, NULL, 1, NULL),
(11, 'amerwqbq@gmail.com', NULL, NULL, NULL, NULL, '$2b$10$JDxlIZcMpGnSxg0aaxxnWOljmWtcCtS1m0rbiFZtCYWzDbfaA/8aK', NULL, NULL, 'STUDENT', '2025-12-26 12:06:49.887', '2025-12-26 12:06:49.887', NULL, NULL, NULL, NULL, 1, NULL),
(12, 'mofbq@gmail.com', NULL, NULL, NULL, NULL, '$2b$10$pbRNQIf0Q3hDIL8EdUTO7efqjlK3Qyuyvw5Zw9Y580j9dlpMXmm1G', NULL, NULL, 'STUDENT', '2025-12-26 12:07:04.798', '2025-12-26 12:07:04.798', NULL, NULL, NULL, NULL, 1, NULL),
(13, 'mofbqwa@gmail.com', NULL, NULL, NULL, NULL, '$2b$10$DFzqP/gFT.cGjRVIm4vyqOxodR0kF5qVQs./K6S2PyOgjD4GITTXa', NULL, NULL, 'STUDENT', '2025-12-26 12:19:24.172', '2025-12-26 12:19:24.172', NULL, NULL, NULL, NULL, 1, NULL),
(14, 'nader@gmail.com', NULL, NULL, '/images/1775897853592-673676336.jpg', NULL, '$2b$10$xZwzNabR7TwbyaePaVBGkuU3oUbCAMyPmptdlSgennbD1tNOH5kFy', NULL, NULL, 'ADMIN', '2025-12-26 13:54:48.172', '2026-03-11 08:57:33.635', NULL, NULL, NULL, NULL, 1, NULL),
(15, 'aa@gmail.com', 'ali', 'alaa', NULL, NULL, '$2b$10$/VhMSFBhj8LLv3PjO0ctHuSdHtiRxV8hjblNVwtomrqgQE0E5aS8O', NULL, NULL, 'STUDENT', '2025-12-26 14:52:15.529', '2025-12-26 14:52:15.529', NULL, NULL, NULL, NULL, 1, NULL),
(16, 'ramez@gmail.com', 'ramez', 'galal', NULL, NULL, '$2b$10$KkxlADTndQ/RkQbEvbmjn.sc24jsYTGG9BV0y2vWvrPNoh.KvBHqa', NULL, NULL, 'STUDENT', '2025-12-26 21:24:54.904', '2025-12-26 21:24:54.904', NULL, NULL, NULL, NULL, 1, NULL),
(17, 'amira@gmail.com', 'amira', 'ali', '/images/1775909867464-345633585.png', NULL, '$2b$10$amlAwnHN1ro4b/emajnLouF1iNV7fKxhjHwwFso8TTReSGnc6X6EO', NULL, NULL, 'TEACHER', '2025-12-27 14:19:04.750', '2026-03-11 12:17:47.505', NULL, NULL, NULL, NULL, 1, NULL),
(18, 'sayed@gmail.com', 'sayed', 'gmail', '/images/1775826167252-181763586.jpg', 22, '$2b$10$K3r58U/BWdxy9izMOKx8TeDuhxK.0hqu60CQXt30wDqkdW2s4yj2i', '(+20)01118606952', 'menofia', 'EMPLOYEE', '2025-12-31 09:41:43.719', '2026-03-10 13:02:47.287', NULL, NULL, NULL, NULL, 1, NULL),
(19, 'mostafaessam9511@gmail.com', 'mostafa', 'essam', NULL, 21, '$2b$10$LeS77Ei3Tuu2/qgrBkVn1O3WUrhEzQNSmTFi9lRm9SN9tz.cHms9a', '(+20)01118606952', 'egypt', 'STUDENT', '2026-01-04 11:06:49.428', '2026-01-04 11:06:49.428', NULL, NULL, NULL, NULL, 1, NULL),
(20, 'amerwqab@gmail.com', 'amer', 'ali', 'null', 21, '$2b$10$d21H4SKI6acen4YOgzHlqe5sBpxRv4L0vx/hd.QWO4vjUSJcxyM2e', '(+20)01118606952', 'menofia', 'USER', '2026-01-04 12:20:04.217', '2026-01-04 12:20:04.217', NULL, NULL, NULL, NULL, 1, NULL),
(21, 'amerwqasb@gmail.com', 'amer', 'ali', 'null', 21, '$2b$10$IzOxviUstft9Tf5Y4GUcbu4zup/K4t8E.fTQN1rCDorZcFRX6jigq', '(+20)01118606952', 'menofia', 'USER', '2026-01-04 12:21:03.781', '2026-01-04 12:21:03.781', NULL, NULL, NULL, NULL, 1, NULL),
(22, 'mws83887@gmail.com', 'amr', 'khaled', '/images/1775331005955-713738980.png', 22, '$2b$10$Eij2M3MhbCirayK2KvHkv.uRg5TN5r2Qgpgv4jfWFOJYU9PqPsg72', '(+20)01118606952', 'الجيزه', 'STUDENT', '2026-03-04 19:30:06.408', '2026-03-04 19:30:32.851', NULL, NULL, NULL, NULL, 1, NULL);

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
('10a1f317-83f9-49c3-bb07-05319f8853ae', '5befdb0cc729788ecce530b469a394fba06dffbf3316e79e14baceb4078cc5f9', '2026-03-02 19:22:40.685', '20260330194512_add_monthly_subscription', NULL, NULL, '2026-03-02 19:22:40.347', 1),
('5c7065a5-ee2f-4593-b929-313fcecad9a3', 'e0cde3ce2f775ecb7ba425db2dcc891e5b5d4efb6634448737cfcd063b6ad415', '2026-03-02 19:22:40.221', '20260118111647_finalize_payment_schema', NULL, NULL, '2026-03-02 19:22:40.089', 1),
('9f1ea2ca-2523-4c95-9195-5bc0bb616754', '844960da0308e3b7d0e016f6f2550ea7c82036dd7d52e908fa4d7ce9eeebdbb3', '2026-03-02 19:22:40.022', '20260110065440_add_all_tables', NULL, NULL, '2026-03-02 19:22:36.817', 1),
('abf40280-5643-4ff5-98c9-e0dbfd5b8e1f', '2a14937a4c040b61783e3e9b9d6a10caf4c955d311bd168090e25e644f2dba8c', '2026-03-02 19:22:40.088', '20260117182302_update_enrollment_request_status', NULL, NULL, '2026-03-02 19:22:40.036', 1),
('b15d6f35-bef4-4ec4-b0ee-2c765f7dc5d7', '41812f9c59585e7a805246282b7d5106d20509646ff239077efdb7a1bbee105a', '2026-03-02 19:22:40.345', '20260218194509_add_message_model', NULL, NULL, '2026-03-02 19:22:40.222', 1),
('b18f4ff9-8d45-4f64-abef-7b2fe04ca756', '0ed61684379bfa3d7aa35d8731b00c50b2acb9f3c2fbc1eab768b601a8d0fc8e', '2026-03-02 19:22:40.694', '20260402185346_add_payment_type_and_monthly_price', NULL, NULL, '2026-03-02 19:22:40.687', 1),
('f73b43e8-bba9-4e00-9c5f-cfb522e7363e', 'b3bbe62b71757a240073348bb7ed49e4a44d62b325b76e336aa321f781e9e4c2', '2026-03-02 19:22:40.034', '20260117164428_add_price_to_course', NULL, NULL, '2026-03-02 19:22:40.024', 1);

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
-- Indexes for table `broadcastrecipient`
--
ALTER TABLE `broadcastrecipient`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_broadcast_recipient_unique` (`messageId`,`studentId`),
  ADD KEY `idx_broadcast_recipient_message_id` (`messageId`),
  ADD KEY `idx_broadcast_recipient_student_id` (`studentId`),
  ADD KEY `idx_broadcast_recipient_is_read` (`isRead`);

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
-- Indexes for table `message`
--
ALTER TABLE `message`
  ADD PRIMARY KEY (`id`),
  ADD KEY `message_senderId_idx` (`senderId`),
  ADD KEY `message_receiverId_idx` (`receiverId`),
  ADD KEY `message_courseId_idx` (`courseId`);

--
-- Indexes for table `monthlysubscription`
--
ALTER TABLE `monthlysubscription`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `monthlySubscription_courseId_studentId_month_year_key` (`courseId`,`studentId`,`month`,`year`),
  ADD KEY `monthly_subscription_course_id_idx` (`courseId`),
  ADD KEY `monthly_subscription_student_id_idx` (`studentId`);

--
-- Indexes for table `otp`
--
ALTER TABLE `otp`
  ADD PRIMARY KEY (`id`),
  ADD KEY `otp_email_idx` (`email`),
  ADD KEY `otp_userId_fkey` (`userId`);

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
  ADD KEY `idx_user_email` (`email`),
  ADD KEY `user_name` (`first_name`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `assignmentsubmission`
--
ALTER TABLE `assignmentsubmission`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `broadcastrecipient`
--
ALTER TABLE `broadcastrecipient`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `chapter`
--
ALTER TABLE `chapter`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `chapterprogress`
--
ALTER TABLE `chapterprogress`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `course`
--
ALTER TABLE `course`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `courseschedule`
--
ALTER TABLE `courseschedule`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=122;

--
-- AUTO_INCREMENT for table `course_sessions`
--
ALTER TABLE `course_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

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
-- AUTO_INCREMENT for table `message`
--
ALTER TABLE `message`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `monthlysubscription`
--
ALTER TABLE `monthlysubscription`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `otp`
--
ALTER TABLE `otp`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `payment`
--
ALTER TABLE `payment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `quiz`
--
ALTER TABLE `quiz`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `quizattempt`
--
ALTER TABLE `quizattempt`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `quizattemptanswer`
--
ALTER TABLE `quizattemptanswer`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `quizoption`
--
ALTER TABLE `quizoption`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT for table `quizquestion`
--
ALTER TABLE `quizquestion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `room`
--
ALTER TABLE `room`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

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
-- Constraints for table `broadcastrecipient`
--
ALTER TABLE `broadcastrecipient`
  ADD CONSTRAINT `broadcastrecipient_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `message` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `broadcastrecipient_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

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
-- Constraints for table `message`
--
ALTER TABLE `message`
  ADD CONSTRAINT `message_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `message_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `monthlysubscription`
--
ALTER TABLE `monthlysubscription`
  ADD CONSTRAINT `fk_monthly_subscription_course` FOREIGN KEY (`courseId`) REFERENCES `course` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_monthly_subscription_student` FOREIGN KEY (`studentId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `otp`
--
ALTER TABLE `otp`
  ADD CONSTRAINT `otp_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

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
 