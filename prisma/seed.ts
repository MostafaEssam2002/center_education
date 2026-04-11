import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed users
  try {
    await prisma.user.createMany({
      data: [
        {
          id: 10,
          email: 'amerwqb@gmail.com',
          role: 'TEACHER',
          password: '$2b$10$JoOyS.hZncnkNKTV5yjjCONkTDeU0l7WDli6YCGO2vwa7GYklW0Tq',
          createdAt: new Date('2025-12-26T12:02:57.143Z'),
          updatedAt: new Date('2025-12-26T12:02:57.143Z'),
        },
        {
          id: 11,
          email: 'amerwqbq@gmail.com',
          role: 'STUDENT',
          password: '$2b$10$JDxlIZcMpGnSxg0aaxxnWOljmWtcCtS1m0rbiFZtCYWzDbfaA/8aK',
          createdAt: new Date('2025-12-26T12:06:49.887Z'),
          updatedAt: new Date('2025-12-26T12:06:49.887Z'),
        },
        {
          id: 12,
          email: 'mofbq@gmail.com',
          role: 'STUDENT',
          password: '$2b$10$pbRNQIf0Q3hDIL8EdUTO7efqjlK3Qyuyvw5Zw9Y580j9dlpMXmm1G',
          createdAt: new Date('2025-12-26T12:07:04.798Z'),
          updatedAt: new Date('2025-12-26T12:07:04.798Z'),
        },
        {
          id: 13,
          email: 'mofرbq@gmail.com',
          role: 'STUDENT',
          password: '$2b$10$DFzqP/gFT.cGjRVIm4vyqOxodR0kF5qVQs./K6S2PyOgjD4GITTXa',
          createdAt: new Date('2025-12-26T12:19:24.172Z'),
          updatedAt: new Date('2025-12-26T12:19:24.172Z'),
        },
        {
          id: 14,
          email: 'nader@gmail.com',
          role: 'ADMIN',
          password: '$2b$10$xZwzNabR7TwbyaePaVBGkuU3oUbCAMyPmptdlSgennbD1tNOH5kFy',
          createdAt: new Date('2025-12-26T13:54:48.172Z'),
          updatedAt: new Date('2025-12-26T13:54:48.172Z'),
        },
        {
          id: 15,
          email: 'aa@gmail.com',
          first_name: 'ali',
          last_name: 'alaa',
          role: 'STUDENT',
          password: '$2b$10$/VhMSFBhj8LLv3PjO0ctHuSdHtiRxV8hjblNVwtomrqgQE0E5aS8O',
          createdAt: new Date('2025-12-26T14:52:15.529Z'),
          updatedAt: new Date('2025-12-26T14:52:15.529Z'),
        },
        {
          id: 16,
          email: 'ramez@gmail.com',
          first_name: 'ramez',
          last_name: 'galal',
          role: 'STUDENT',
          password: '$2b$10$KkxlADTndQ/RkQbEvbmjn.sc24jsYTGG9BV0y2vWvrPNoh.KvBHqa',
          createdAt: new Date('2025-12-26T21:24:54.904Z'),
          updatedAt: new Date('2025-12-26T21:24:54.904Z'),
        },
        {
          id: 17,
          email: 'amira@gmail.com',
          first_name: 'amira',
          last_name: 'ali',
          role: 'TEACHER',
          password: '$2b$10$amlAwnHN1ro4b/emajnLouF1iNV7fKxhjHwwFso8TTReSGnc6X6EO',
          createdAt: new Date('2025-12-27T14:19:04.750Z'),
          updatedAt: new Date('2025-12-27T14:19:04.750Z'),
        },
        {
          id: 18,
          email: 'sayed@gmail.com',
          first_name: 'sayed',
          last_name: 'gmail',
          age: 22,
          password: '$2b$10$K3r58U/BWdxy9izMOKx8TeDuhxK.0hqu60CQXt30wDqkdW2s4yj2i',
          phone: '(+20)01118606952',
          address: 'menofia',
          role: 'EMPLOYEE',
          createdAt: new Date('2025-12-31T09:41:43.719Z'),
          updatedAt: new Date('2025-12-31T09:41:43.719Z'),
        },
        {
          id: 19,
          email: 'mostafaessam9511@gmail.com',
          first_name: 'mostafa',
          last_name: 'essam',
          age: 21,
          password: '$2b$10$LeS77Ei3Tuu2/qgrBkVn1O3WUrhEzQNSmTFi9lRm9SN9tz.cHms9a',
          phone: '(+20)01118606952',
          address: 'egypt',
          role: 'STUDENT',
          createdAt: new Date('2026-01-04T11:06:49.428Z'),
          updatedAt: new Date('2026-01-04T11:06:49.428Z'),
        },
        {
          id: 20,
          email: 'amerwqab@gmail.com',
          first_name: 'amer',
          last_name: 'ali',
          image_path: 'null',
          age: 21,
          password: '$2b$10$d21H4SKI6acen4YOgzHlqe5sBpxRv4L0vx/hd.QWO4vjUSJcxyM2e',
          phone: '(+20)01118606952',
          address: 'menofia',
          role: 'USER',
          createdAt: new Date('2026-01-04T12:20:04.217Z'),
          updatedAt: new Date('2026-01-04T12:20:04.217Z'),
        },
        {
          id: 21,
          email: 'amerwqasb@gmail.com',
          first_name: 'amer',
          last_name: 'ali',
          image_path: 'null',
          age: 21,
          password: '$2b$10$IzOxviUstft9Tf5Y4GUcbu4zup/K4t8E.fTQN1rCDorZcFRX6jigq',
          phone: '(+20)01118606952',
          address: 'menofia',
          role: 'USER',
          createdAt: new Date('2026-01-04T12:21:03.781Z'),
          updatedAt: new Date('2026-01-04T12:21:03.781Z'),
        },
      ],
    });
  } catch (e) {
    console.log('Users already seeded or error:', e.message);
  }

  // Seed rooms
  try {
    await prisma.room.createMany({
      data: [
        {
          id: 1,
          name: 'Room A',
          type: 'OFFLINE',
          capacity: 30,
          location: 'Building A - Floor 1',
          isActive: true,
          createdAt: new Date('2026-01-10T09:13:41.000Z'),
          updatedAt: new Date('2026-01-10T09:13:41.000Z'),
        },
        {
          id: 2,
          name: 'Room B',
          type: 'OFFLINE',
          capacity: 25,
          location: 'Building A - Floor 2',
          isActive: true,
          createdAt: new Date('2026-01-10T09:13:41.000Z'),
          updatedAt: new Date('2026-01-10T09:13:41.000Z'),
        },
        {
          id: 3,
          name: 'Room C',
          type: 'OFFLINE',
          capacity: 40,
          location: 'Building B - Floor 1',
          isActive: true,
          createdAt: new Date('2026-01-10T09:13:41.000Z'),
          updatedAt: new Date('2026-01-10T09:13:41.000Z'),
        },
        {
          id: 4,
          name: 'Lab 1',
          type: 'OFFLINE',
          capacity: 20,
          location: 'Building C - Lab Area',
          isActive: true,
          createdAt: new Date('2026-01-10T09:13:41.000Z'),
          updatedAt: new Date('2026-01-10T09:13:41.000Z'),
        },
        {
          id: 5,
          name: 'Lab 2',
          type: 'OFFLINE',
          capacity: 15,
          location: 'Building C - Lab Area',
          isActive: true,
          createdAt: new Date('2026-01-10T09:13:41.000Z'),
          updatedAt: new Date('2026-01-10T09:13:41.000Z'),
        },
        {
          id: 6,
          name: 'Hall 1',
          type: 'OFFLINE',
          capacity: 60,
          location: 'Main Building - Ground Floor',
          isActive: true,
          createdAt: new Date('2026-01-10T09:13:41.000Z'),
          updatedAt: new Date('2026-01-10T09:13:41.000Z'),
        },
        {
          id: 7,
          name: 'Zoom Room 1',
          type: 'ONLINE',
          isActive: true,
          createdAt: new Date('2026-01-10T09:13:41.000Z'),
          updatedAt: new Date('2026-01-10T09:13:41.000Z'),
        },
        {
          id: 8,
          name: 'Zoom Room 2',
          type: 'ONLINE',
          isActive: true,
          createdAt: new Date('2026-01-10T09:13:41.000Z'),
          updatedAt: new Date('2026-01-10T09:13:41.000Z'),
        },
        {
          id: 9,
          name: 'Google Meet 1',
          type: 'ONLINE',
          isActive: true,
          createdAt: new Date('2026-01-10T09:13:41.000Z'),
          updatedAt: new Date('2026-01-10T09:13:41.000Z'),
        },
        {
          id: 10,
          name: 'Teams Room 1',
          type: 'ONLINE',
          isActive: true,
          createdAt: new Date('2026-01-10T09:13:41.000Z'),
          updatedAt: new Date('2026-01-10T09:13:41.000Z'),
        },
        {
          id: 27,
          name: 'room vip',
          type: 'OFFLINE',
          capacity: 500,
          location: 'city starts',
          isActive: false,
          createdAt: new Date('2026-01-10T09:04:34.030Z'),
          updatedAt: new Date('2026-01-10T09:05:31.595Z'),
        },
        {
          id: 28,
          name: 'asd',
          type: 'OFFLINE',
          capacity: 222,
          location: 'sadsadsa',
          isActive: false,
          createdAt: new Date('2026-01-10T09:06:29.701Z'),
          updatedAt: new Date('2026-01-10T09:06:38.319Z'),
        },
        {
          id: 29,
          name: 'test',
          type: 'OFFLINE',
          capacity: 1,
          location: 'palm stip',
          isActive: true,
          createdAt: new Date('2026-01-10T17:38:16.460Z'),
          updatedAt: new Date('2026-01-10T17:38:16.460Z'),
        },
      ],
    });
  } catch (e) {
    console.log('Rooms already seeded or error:', e.message);
  }

  // Seed courses
  try {
    await prisma.course.createMany({
      data: [
        {
          id: 1,
          title: 'ATH 101',
          description: 'Basic Mathematics',
          teacherId: 17,
          image_path: '/images/1767035064828-490128286.jpg',
          createdAt: new Date('2025-12-28T12:48:21.249Z'),
          updatedAt: new Date('2025-12-28T12:48:21.249Z'),
        },
        {
          id: 2,
          title: 'math 6',
          description: 'Basic Mathematics',
          teacherId: 17,
          image_path: '/images/1767035064828-490128286.jpg',
          createdAt: new Date('2025-12-28T21:19:25.930Z'),
          updatedAt: new Date('2025-12-28T21:19:25.930Z'),
        },
        {
          id: 3,
          title: 'js',
          description: 'java script',
          teacherId: 17,
          image_path: '/images/1767079738969-570493753.png',
          createdAt: new Date('2025-12-29T08:29:16.289Z'),
          updatedAt: new Date('2025-12-30T07:28:59.958Z'),
        },
        {
          id: 4,
          title: 'Math 101',
          description: 'Basic Mathematics',
          teacherId: 10,
          image_path: '/images/math.png',
          createdAt: new Date('2026-01-10T10:03:20.000Z'),
          updatedAt: new Date('2026-01-10T10:03:20.000Z'),
        },
        {
          id: 5,
          title: 'Math 102',
          description: 'Intermediate Mathematics',
          teacherId: 10,
          image_path: '/images/math102.png',
          createdAt: new Date('2026-01-10T10:03:20.000Z'),
          updatedAt: new Date('2026-01-10T10:03:20.000Z'),
        },
        {
          id: 6,
          title: 'Physics 101',
          description: 'Basic Physics',
          teacherId: 10,
          image_path: '/images/physics.png',
          createdAt: new Date('2026-01-10T10:03:20.000Z'),
          updatedAt: new Date('2026-01-10T10:03:20.000Z'),
        },
        {
          id: 7,
          title: 'Physics 102',
          description: 'Advanced Physics',
          teacherId: 10,
          image_path: '/images/physics.png',
          createdAt: new Date('2026-01-10T10:03:20.000Z'),
          updatedAt: new Date('2026-01-10T10:03:20.000Z'),
        },
        {
          id: 8,
          title: 'Chemistry 101',
          description: 'Intro to Chemistry',
          teacherId: 10,
          image_path: '/images/chemistry.png',
          createdAt: new Date('2026-01-10T10:03:20.000Z'),
          updatedAt: new Date('2026-01-10T10:03:20.000Z'),
        },
        {
          id: 9,
          title: 'Statistics 101',
          description: 'Statistics Basics',
          teacherId: 10,
          image_path: '/images/stat.png',
          createdAt: new Date('2026-01-10T10:03:20.000Z'),
          updatedAt: new Date('2026-01-10T10:03:20.000Z'),
        },
        {
          id: 10,
          title: 'Algebra',
          description: 'Linear Algebra Course',
          teacherId: 10,
          image_path: '/images/algebra.png',
          createdAt: new Date('2026-01-10T10:03:20.000Z'),
          updatedAt: new Date('2026-01-10T10:03:20.000Z'),
        },
        {
          id: 11,
          title: 'Calculus I',
          description: 'Limits & Derivatives',
          teacherId: 10,
          image_path: '/images/calculus.png',
          createdAt: new Date('2026-01-10T10:03:20.000Z'),
          updatedAt: new Date('2026-01-10T10:03:20.000Z'),
        },
        {
          id: 12,
          title: 'JS Basics',
          description: 'JavaScript for Beginners',
          teacherId: 17,
          image_path: '/images/js.png',
          createdAt: new Date('2026-01-10T10:03:20.000Z'),
          updatedAt: new Date('2026-01-10T10:03:20.000Z'),
        },
        {
          id: 13,
          title: 'Advanced JS',
          description: 'Deep JavaScript Concepts',
          teacherId: 17,
          image_path: '/images/js.png',
          createdAt: new Date('2026-01-10T10:03:20.000Z'),
          updatedAt: new Date('2026-01-10T10:03:20.000Z'),
        },
        {
          id: 14,
          title: 'Node.js',
          description: 'Backend with Node.js',
          teacherId: 17,
          image_path: '/images/node.png',
          createdAt: new Date('2026-01-10T10:03:20.000Z'),
          updatedAt: new Date('2026-01-10T10:03:20.000Z'),
        },
        {
          id: 15,
          title: 'Express.js',
          description: 'REST APIs with Express',
          teacherId: 17,
          image_path: '/images/express.png',
          createdAt: new Date('2026-01-10T10:03:20.000Z'),
          updatedAt: new Date('2026-01-10T10:03:20.000Z'),
        },
        {
          id: 16,
          title: 'NestJS',
          description: 'Scalable Backend with NestJS',
          teacherId: 17,
          image_path: '/images/nest.png',
          createdAt: new Date('2026-01-10T10:03:20.000Z'),
          updatedAt: new Date('2026-01-10T10:03:20.000Z'),
        },
        {
          id: 17,
          title: 'MySQL',
          description: 'Relational Database Basics',
          teacherId: 17,
          image_path: '/images/mysql.png',
          createdAt: new Date('2026-01-10T10:03:20.000Z'),
          updatedAt: new Date('2026-01-10T10:03:20.000Z'),
        },
        {
          id: 18,
          title: 'Prisma ORM',
          description: 'Modern ORM with Prisma',
          teacherId: 17,
          image_path: '/images/prisma.png',
          createdAt: new Date('2026-01-10T10:03:20.000Z'),
          updatedAt: new Date('2026-01-10T10:03:20.000Z'),
        },
        {
          id: 19,
          title: 'GraphQL',
          description: 'API with GraphQL',
          teacherId: 17,
          image_path: '/images/graphql.png',
          createdAt: new Date('2026-01-10T10:03:20.000Z'),
          updatedAt: new Date('2026-01-10T10:03:20.000Z'),
        },
        {
          id: 20,
          title: 'HTML & CSS',
          description: 'Frontend Basics',
          teacherId: 10,
          image_path: '/images/html.png',
          createdAt: new Date('2026-01-10T10:03:20.000Z'),
          updatedAt: new Date('2026-01-10T10:03:20.000Z'),
        },
        {
          id: 21,
          title: 'React Basics',
          description: 'Frontend with React',
          teacherId: 17,
          image_path: '/images/react.png',
          createdAt: new Date('2026-01-10T10:03:20.000Z'),
          updatedAt: new Date('2026-01-10T10:03:20.000Z'),
        },
        {
          id: 22,
          title: 'TypeScript',
          description: 'Typed JavaScript',
          teacherId: 17,
          image_path: '/images/ts.png',
          createdAt: new Date('2026-01-10T10:03:20.000Z'),
          updatedAt: new Date('2026-01-10T10:03:20.000Z'),
        },
        {
          id: 23,
          title: 'Git & GitHub',
          description: 'Version Control',
          teacherId: 10,
          image_path: '/images/git.png',
          createdAt: new Date('2026-01-10T10:03:20.000Z'),
          updatedAt: new Date('2026-01-10T10:03:20.000Z'),
        },
        {
          id: 24,
          title: 'Problem Solving',
          description: 'Algorithms Basics',
          teacherId: 10,
          image_path: '/images/ps.png',
          createdAt: new Date('2026-01-10T10:03:20.000Z'),
          updatedAt: new Date('2026-01-10T10:03:20.000Z'),
        },
      ],
    });
  } catch (e) {
    console.log('Courses already seeded or error:', e.message);
  }

  // Seed chapters
  try {
    await prisma.chapter.createMany({
      data: [
        {
          id: 4,
          title: 'chapter1',
          content: 'chapter1',
          videoPath: '/videos/1767023058120-754837650.mp4',
          pdfPath: '/pdfs/1767023058139-358092834.pdf',
          order: 1,
          courseId: 3,
          createdAt: new Date('2025-12-29T15:44:18.151Z'),
          updatedAt: new Date('2025-12-29T15:44:18.151Z'),
        },
        {
          id: 5,
          title: 'CHAPTER 2 ',
          content: 'import {\n  CanActivate,\n  ExecutionContext,\n  Injectable,\n  ForbiddenException,\n} from \'@nestjs/common\';\nimport { PrismaService } from \'src/prisma/prisma.service\';\nimport { Role } from \'@pris',
          videoPath: '/videos/1767023137631-51829886.mp4',
          pdfPath: '/pdfs/1767023137643-930340734.pdf',
          order: 2,
          courseId: 3,
          createdAt: new Date('2025-12-29T15:45:37.657Z'),
          updatedAt: new Date('2025-12-29T15:45:37.657Z'),
        },
        {
          id: 6,
          title: 'ch4',
          content: 'v454v54v54v',
          videoPath: '/videos/1767029520976-761807342.mp4',
          pdfPath: '/pdfs/1767029521004-979311338.pdf',
          order: 3,
          courseId: 3,
          createdAt: new Date('2025-12-29T17:32:01.042Z'),
          updatedAt: new Date('2025-12-29T17:32:01.042Z'),
        },
        {
          id: 7,
          title: 'chapter 3 ',
          content: 'typescript',
          videoPath: '/videos/1767036461910-100556933.mp4',
          order: 4,
          courseId: 3,
          createdAt: new Date('2025-12-29T19:27:41.998Z'),
          updatedAt: new Date('2025-12-29T19:27:41.998Z'),
        },
      ],
    });
  } catch (e) {
    console.log('Chapters already seeded or error:', e.message);
  }

  // Seed course schedules
  try {
    await prisma.courseSchedule.createMany({
      data: [
        { id: 82, courseId: 1, roomId: 1, day: 'SAT', startTime: '08:00', endTime: '09:30' },
        { id: 83, courseId: 2, roomId: 2, day: 'SAT', startTime: '09:30', endTime: '11:00' },
        { id: 84, courseId: 3, roomId: 3, day: 'SAT', startTime: '11:00', endTime: '12:30' },
        { id: 86, courseId: 9, roomId: 7, day: 'SAT', startTime: '18:00', endTime: '19:30' },
        { id: 87, courseId: 10, roomId: 8, day: 'SAT', startTime: '19:30', endTime: '21:00' },
        { id: 88, courseId: 5, roomId: 1, day: 'SUN', startTime: '08:00', endTime: '09:30' },
        { id: 89, courseId: 6, roomId: 4, day: 'SUN', startTime: '09:30', endTime: '11:00' },
        { id: 90, courseId: 7, roomId: 5, day: 'SUN', startTime: '11:00', endTime: '12:30' },
        { id: 91, courseId: 8, roomId: 6, day: 'SUN', startTime: '12:30', endTime: '14:00' },
        { id: 92, courseId: 11, roomId: 9, day: 'SUN', startTime: '18:00', endTime: '19:30' },
        { id: 93, courseId: 12, roomId: 10, day: 'SUN', startTime: '19:30', endTime: '21:00' },
        { id: 94, courseId: 13, roomId: 2, day: 'MON', startTime: '08:00', endTime: '09:30' },
        { id: 95, courseId: 14, roomId: 3, day: 'MON', startTime: '09:30', endTime: '11:00' },
        { id: 96, courseId: 15, roomId: 4, day: 'MON', startTime: '11:00', endTime: '12:30' },
        { id: 97, courseId: 16, roomId: 6, day: 'MON', startTime: '12:30', endTime: '14:00' },
        { id: 98, courseId: 17, roomId: 7, day: 'MON', startTime: '18:00', endTime: '19:30' },
        { id: 99, courseId: 18, roomId: 1, day: 'TUE', startTime: '09:00', endTime: '10:30' },
        { id: 100, courseId: 19, roomId: 2, day: 'TUE', startTime: '10:30', endTime: '12:00' },
        { id: 101, courseId: 20, roomId: 3, day: 'TUE', startTime: '12:00', endTime: '13:30' },
        { id: 102, courseId: 9, roomId: 8, day: 'TUE', startTime: '18:00', endTime: '19:30' },
        { id: 103, courseId: 10, roomId: 4, day: 'WED', startTime: '08:00', endTime: '09:30' },
        { id: 104, courseId: 11, roomId: 5, day: 'WED', startTime: '09:30', endTime: '11:00' },
        { id: 105, courseId: 12, roomId: 6, day: 'WED', startTime: '11:00', endTime: '12:30' },
        { id: 106, courseId: 13, roomId: 7, day: 'WED', startTime: '18:00', endTime: '19:30' },
        { id: 107, courseId: 14, roomId: 1, day: 'THU', startTime: '09:00', endTime: '10:30' },
        { id: 108, courseId: 15, roomId: 2, day: 'THU', startTime: '10:30', endTime: '12:00' },
        { id: 109, courseId: 16, roomId: 3, day: 'THU', startTime: '12:00', endTime: '13:30' },
        { id: 110, courseId: 17, roomId: 9, day: 'THU', startTime: '18:00', endTime: '19:30' },
        { id: 111, courseId: 19, roomId: 3, day: 'SAT', startTime: '08:00', endTime: '09:00' },
        { id: 112, courseId: 20, roomId: 2, day: 'SAT', startTime: '08:00', endTime: '09:00' },
        { id: 114, courseId: 6, roomId: 9, day: 'SAT', startTime: '08:00', endTime: '08:30' },
        { id: 115, courseId: 6, roomId: 9, day: 'SAT', startTime: '08:30', endTime: '09:00' },
        { id: 117, courseId: 6, roomId: 4, day: 'SAT', startTime: '08:30', endTime: '09:00' },
        { id: 118, courseId: 5, roomId: 5, day: 'SAT', startTime: '08:00', endTime: '09:30' },
      ],
    });
  } catch (e) {
    console.log('Course schedules already seeded or error:', e.message);
  }

  // Seed enrollments
  try {
    await prisma.enrollment.createMany({
      data: [
        {
          id: 1,
          studentId: 16,
          courseId: 3,
          createdAt: new Date('2026-01-10T07:39:30.649Z'),
        },
      ],
    });
  } catch (e) {
    console.log('Enrollments already seeded or error:', e.message);
  }

  // Seed quizzes
  try {
    await prisma.quiz.createMany({
      data: [
        {
          id: 5,
          title: 'q1',
          description: 'q1',
          type: 'CHAPTER',
          courseId: 3,
          chapterId: 4,
          startTime: new Date('2026-01-03T19:22:00.000Z'),
          endTime: new Date('2026-01-03T20:22:00.000Z'),
          durationMin: 30,
          totalMarks: 10,
          keepAnswers: false,
          isPublished: true,
          createdBy: 17,
          createdAt: new Date('2026-01-03T19:22:25.000Z'),
          updatedAt: new Date('2026-01-03T19:25:44.949Z'),
        },
        {
          id: 6,
          title: 'q2',
          description: 'q2',
          type: 'CHAPTER',
          courseId: 3,
          chapterId: 5,
          startTime: new Date('2026-01-03T16:12:00.000Z'),
          endTime: new Date('2026-01-04T11:05:00.000Z'),
          durationMin: 1,
          totalMarks: 4,
          keepAnswers: false,
          isPublished: true,
          createdBy: 17,
          createdAt: new Date('2026-01-03T20:12:57.241Z'),
          updatedAt: new Date('2026-01-04T11:01:20.970Z'),
        },
      ],
    });
  } catch (e) {
    console.log('Quizzes already seeded or error:', e.message);
  }

  // Seed quiz questions
  try {
    await prisma.quizQuestion.createMany({
      data: [
        {
          id: 5,
          quizId: 5,
          question: 'what is your name ?',
          marks: 1,
          createdAt: new Date('2026-01-03T19:22:56.067Z'),
        },
        {
          id: 6,
          quizId: 5,
          question: 'what is your age ?',
          marks: 1,
          createdAt: new Date('2026-01-03T19:23:16.499Z'),
        },
        {
          id: 7,
          quizId: 5,
          question: 'what is your address ?',
          marks: 1,
          createdAt: new Date('2026-01-03T19:23:52.204Z'),
        },
        {
          id: 8,
          quizId: 6,
          question: 'hhhhh',
          marks: 1,
          createdAt: new Date('2026-01-03T20:13:10.944Z'),
        },
        {
          id: 10,
          quizId: 6,
          question: 'how are ypu ',
          marks: 3,
          createdAt: new Date('2026-01-04T11:01:12.841Z'),
        },
      ],
    });
  } catch (e) {
    console.log('Quiz questions already seeded or error:', e.message);
  }

  // Seed quiz options
  try {
    await prisma.quizOption.createMany({
      data: [
        { id: 10, questionId: 5, text: 'mostafa', isCorrect: true },
        { id: 11, questionId: 5, text: 'essam', isCorrect: false },
        { id: 12, questionId: 6, text: '10', isCorrect: false },
        { id: 13, questionId: 6, text: '20', isCorrect: true },
        { id: 14, questionId: 7, text: 'menofia', isCorrect: false },
        { id: 15, questionId: 7, text: 'giza', isCorrect: false },
        { id: 16, questionId: 7, text: 'swizz', isCorrect: true },
        { id: 17, questionId: 7, text: 'aswan', isCorrect: false },
        { id: 18, questionId: 8, text: '1', isCorrect: true },
        { id: 19, questionId: 8, text: '1', isCorrect: false },
        { id: 22, questionId: 10, text: '2', isCorrect: false },
        { id: 23, questionId: 10, text: '3', isCorrect: true },
      ],
    });
  } catch (e) {
    console.log('Quiz options already seeded or error:', e.message);
  }

  // Seed quiz attempts
  try {
    await prisma.quizAttempt.createMany({
      data: [
        {
          id: 9,
          quizId: 5,
          studentId: 15,
          score: 1,
          status: 'SUBMITTED',
          startedAt: new Date('2026-01-03T19:26:14.996Z'),
          submittedAt: new Date('2026-01-03T19:26:23.176Z'),
        },
        {
          id: 11,
          quizId: 5,
          studentId: 16,
          score: 2,
          status: 'SUBMITTED',
          startedAt: new Date('2026-01-03T19:54:06.948Z'),
          submittedAt: new Date('2026-01-03T19:54:16.546Z'),
        },
        {
          id: 13,
          quizId: 6,
          studentId: 16,
          score: 0,
          status: 'SUBMITTED',
          startedAt: new Date('2026-01-04T11:02:39.936Z'),
          submittedAt: new Date('2026-01-04T11:03:39.092Z'),
        },
        {
          id: 14,
          quizId: 6,
          studentId: 15,
          score: 1,
          status: 'SUBMITTED',
          startedAt: new Date('2026-01-04T11:04:59.541Z'),
          submittedAt: new Date('2026-01-04T11:05:13.074Z'),
        },
      ],
    });
  } catch (e) {
    console.log('Quiz attempts already seeded or error:', e.message);
  }

  // Seed quiz attempt answers
  try {
    await prisma.quizAttemptAnswer.createMany({
      data: [
        { id: 5, attemptId: 9, questionId: 5, optionId: 10, isCorrect: true },
        { id: 6, attemptId: 9, questionId: 6, optionId: 12, isCorrect: false },
        { id: 7, attemptId: 9, questionId: 7, optionId: 14, isCorrect: false },
        { id: 8, attemptId: 11, questionId: 5, optionId: 10, isCorrect: true },
        { id: 9, attemptId: 11, questionId: 6, optionId: 13, isCorrect: true },
        { id: 10, attemptId: 11, questionId: 7, optionId: 17, isCorrect: false },
        { id: 11, attemptId: 14, questionId: 8, optionId: 18, isCorrect: true },
        { id: 12, attemptId: 14, questionId: 10, optionId: 22, isCorrect: false },
      ],
    });
  } catch (e) {
    console.log('Quiz attempt answers already seeded or error:', e.message);
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });