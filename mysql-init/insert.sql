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

INSERT INTO `course`
(`title`, `description`, `teacherId`, `image_path`, `createdAt`, `updatedAt`)
VALUES
-- ================= Teacher 10 =================
('Math 101', 'Basic Mathematics', 10, '/images/math.png', NOW(), NOW()),
('Math 102', 'Intermediate Mathematics', 10, '/images/math.png', NOW(), NOW()),
('Physics 101', 'Basic Physics', 10, '/images/physics.png', NOW(), NOW()),
('Physics 102', 'Advanced Physics', 10, '/images/physics.png', NOW(), NOW()),
('Chemistry 101', 'Intro to Chemistry', 10, '/images/chemistry.png', NOW(), NOW()),
('Statistics 101', 'Statistics Basics', 10, '/images/stat.png', NOW(), NOW()),
('Algebra', 'Linear Algebra Course', 10, '/images/algebra.png', NOW(), NOW()),
('Calculus I', 'Limits & Derivatives', 10, '/images/calculus.png', NOW(), NOW()),

-- ================= Teacher 17 =================
('JS Basics', 'JavaScript for Beginners', 17, '/images/js.png', NOW(), NOW()),
('Advanced JS', 'Deep JavaScript Concepts', 17, '/images/js.png', NOW(), NOW()),
('Node.js', 'Backend with Node.js', 17, '/images/node.png', NOW(), NOW()),
('Express.js', 'REST APIs with Express', 17, '/images/express.png', NOW(), NOW()),
('NestJS', 'Scalable Backend with NestJS', 17, '/images/nest.png', NOW(), NOW()),
('MySQL', 'Relational Database Basics', 17, '/images/mysql.png', NOW(), NOW()),
('Prisma ORM', 'Modern ORM with Prisma', 17, '/images/prisma.png', NOW(), NOW()),
('GraphQL', 'API with GraphQL', 17, '/images/graphql.png', NOW(), NOW()),

-- ================= Mixed =================
('HTML & CSS', 'Frontend Basics', 10, '/images/html.png', NOW(), NOW()),
('React Basics', 'Frontend with React', 17, '/images/react.png', NOW(), NOW()),
('TypeScript', 'Typed JavaScript', 17, '/images/ts.png', NOW(), NOW()),
('Git & GitHub', 'Version Control', 10, '/images/git.png', NOW(), NOW()),
('Problem Solving', 'Algorithms Basics', 10, '/images/ps.png', NOW(), NOW());

INSERT INTO `chapter` (`id`, `title`, `content`, `videoPath`, `pdfPath`, `order`, `courseId`, `createdAt`, `updatedAt`) VALUES
(4, 'chapter1', 'chapter1', '/videos/1767023058120-754837650.mp4', '/pdfs/1767023058139-358092834.pdf', 1, 9, '2025-12-29 15:44:18.151', '2025-12-29 15:44:18.151'),
(5, 'CHAPTER 2 ', 'import {\n  CanActivate,\n  ExecutionContext,\n  Injectable,\n  ForbiddenException,\n} from \'@nestjs/common\';\nimport { PrismaService } from \'src/prisma/prisma.service\';\nimport { Role } from \'@pris', '/videos/1767023137631-51829886.mp4', '/pdfs/1767023137643-930340734.pdf', 2, 9, '2025-12-29 15:45:37.657', '2025-12-29 15:45:37.657'),
(6, 'ch4', 'v454v54v54v', '/videos/1767029520976-761807342.mp4', '/pdfs/1767029521004-979311338.pdf', 3, 9, '2025-12-29 17:32:01.042', '2025-12-29 17:32:01.042'),
(7, 'chapter 3 ', 'typescript', '/videos/1767036461910-100556933.mp4', NULL, 4, 9, '2025-12-29 19:27:41.998', '2025-12-29 19:27:41.998');

INSERT INTO `quiz` (`id`, `title`, `description`, `type`, `courseId`, `chapterId`, `startTime`, `endTime`, `durationMin`, `totalMarks`, `keepAnswers`, `isPublished`, `createdAt`, `updatedAt`, `createdBy`) VALUES
(5, 'q1', 'q1', 'CHAPTER', 9, 4, '2026-01-03 19:22:00.000', '2026-01-03 20:22:00.000', 30, 10, 0, 1, '2026-01-03 19:22:25.000', '2026-01-03 19:25:44.949', 17),
(6, 'q2', 'q2', 'CHAPTER', 9, 5, '2026-01-03 16:12:00.000', '2026-01-04 11:05:00.000', 1, 4, 0, 1, '2026-01-03 20:12:57.241', '2026-01-04 11:01:20.970', 17);

INSERT INTO `quizquestion` (`id`, `quizId`, `question`, `marks`, `createdAt`) VALUES
(5, 5, 'what is your name ?', 1, '2026-01-03 19:22:56.067'),
(6, 5, 'what is your age ?', 1, '2026-01-03 19:23:16.499'),
(7, 5, 'what is your address ?', 1, '2026-01-03 19:23:52.204'),
(8, 6, 'hhhhh', 1, '2026-01-03 20:13:10.944'),
(10, 6, 'how are ypu ', 3, '2026-01-04 11:01:12.841');

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

INSERT INTO `quizattempt` (`id`, `quizId`, `studentId`, `score`, `status`, `startedAt`, `submittedAt`) VALUES
(9, 5, 15, 1, 'SUBMITTED', '2026-01-03 19:26:14.996', '2026-01-03 19:26:23.176'),
(11, 5, 16, 2, 'SUBMITTED', '2026-01-03 19:54:06.948', '2026-01-03 19:54:16.546'),
(13, 6, 16, 0, 'SUBMITTED', '2026-01-04 11:02:39.936', '2026-01-04 11:03:39.092'),
(14, 6, 15, 1, 'SUBMITTED', '2026-01-04 11:04:59.541', '2026-01-04 11:05:13.074');

INSERT INTO `quizattemptanswer` (`id`, `attemptId`, `questionId`, `optionId`, `isCorrect`) VALUES
(5, 9, 5, 10, 1),
(6, 9, 6, 12, 0),
(7, 9, 7, 14, 0),
(8, 11, 5, 10, 1),
(9, 11, 6, 13, 1),
(10, 11, 7, 17, 0),
(11, 14, 8, 18, 1),
(12, 14, 10, 22, 0);

INSERT INTO room (name, type, capacity, location, isActive, createdAt, updatedAt)
VALUES
-- Offline Rooms
('Room A', 'OFFLINE', 30, 'Building A - Floor 1', 1, NOW(), NOW()),
('Room B', 'OFFLINE', 25, 'Building A - Floor 2', 1, NOW(), NOW()),
('Room C', 'OFFLINE', 40, 'Building B - Floor 1', 1, NOW(), NOW()),
('Lab 1',  'OFFLINE', 20, 'Building C - Lab Area', 1, NOW(), NOW()),
('Lab 2',  'OFFLINE', 15, 'Building C - Lab Area', 1, NOW(), NOW()),
('Hall 1', 'OFFLINE', 60, 'Main Building - Ground Floor', 1, NOW(), NOW()),

-- Online Rooms
('Zoom Room 1',   'ONLINE', NULL, NULL, 1, NOW(), NOW()),
('Zoom Room 2',   'ONLINE', NULL, NULL, 1, NOW(), NOW()),
('Google Meet 1', 'ONLINE', NULL, NULL, 1, NOW(), NOW()),
('Teams Room 1',  'ONLINE', NULL, NULL, 1, NOW(), NOW());


INSERT INTO `courseschedule` (`id`, `courseId`, `roomId`, `day`, `startTime`, `endTime`) VALUES
(1, 6, 17, 'SAT', '08:00', '09:00'),
(2, 9, 18, 'SAT', '11:00', '12:00'),
(3, 6, 17, 'SUN', '10:00', '11:00');