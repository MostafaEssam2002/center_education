import { BadRequestException, Injectable, NotFoundException, } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AttendanceStatus, DayOfWeek } from '@prisma/client';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) { }

  // =============================
  // 1️⃣ إنشاء Session (حصة)
  // =============================
  async createSession(
    courseId: number,
    date: Date,
    startTime: string,
    endTime: string,
    room?: string,
  ) {
    // 1. Check if course exists
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // 2. Validate Session Time against CourseSchedule
    const dayOfWeekMap: { [key: number]: DayOfWeek } = {
      0: DayOfWeek.SUN,
      1: DayOfWeek.MON,
      2: DayOfWeek.TUE,
      3: DayOfWeek.WED,
      4: DayOfWeek.THU,
      5: DayOfWeek.FRI,
      6: DayOfWeek.SAT,
    };

    const sessionDay = dayOfWeekMap[new Date(date).getDay()];

    const schedule = await this.prisma.courseSchedule.findFirst({
      where: {
        courseId,
        day: sessionDay,
      },
    });

    if (schedule) {
      // Validate that session startTime is NOT LATER than schedule startTime
      if (startTime > schedule.startTime) {
        throw new BadRequestException(
          `Cannot create a session at ${startTime} because the scheduled time is ${schedule.startTime}. Please stick to the schedule.`,
        );
      }
    }

    return this.prisma.courseSession.create({
      data: {
        courseId,
        date,
        startTime,
        endTime,
        room,
      },
    });
  }

  // =================================
  // 2️⃣ تسجيل حضور طالب واحد
  // =================================
  // attendance.service.ts
  async markAttendance(sessionId: number, studentId: number) {
    const session = await this.prisma.courseSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) throw new NotFoundException('Session not found');

    const now = new Date();
    const sessionStart = new Date(session.date);
    const [startHour, startMin] = session.startTime.split(':').map(Number);
    sessionStart.setHours(startHour, startMin, 0, 0);

    const sessionEnd = new Date(session.date);
    const [endHour, endMin] = session.endTime.split(':').map(Number);
    sessionEnd.setHours(endHour, endMin, 0, 0);

    let status: AttendanceStatus;

    if (now <= sessionEnd) {
      status = now <= sessionStart ? AttendanceStatus.PRESENT : AttendanceStatus.LATE;
    } else {
      status = AttendanceStatus.ABSENT;
    }

    return this.prisma.attendance.upsert({
      where: { sessionId_studentId: { sessionId, studentId } },
      update: { status },
      create: { sessionId, studentId, status },
    });
  }



  // =====================================
  // 3️⃣ تسجيل حضور مجموعة طلاب
  // =====================================

  // =====================================
  // تسجيل حضور مجموعة طلاب (Bulk) بشكل أسرع
  // =====================================
  async markBulkAttendance(sessionId: number, students: { studentId: number; status?: AttendanceStatus }[]) {
    const session = await this.prisma.courseSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) throw new NotFoundException('Session not found');

    const now = new Date();
    const sessionStart = new Date(session.date);
    const [startHour, startMin] = session.startTime.split(':').map(Number);
    sessionStart.setHours(startHour, startMin, 0, 0);

    const sessionEnd = new Date(session.date);
    const [endHour, endMin] = session.endTime.split(':').map(Number);
    sessionEnd.setHours(endHour, endMin, 0, 0);

    // تحضير أوامر upsert لكل طالب
    const upserts = students.map(({ studentId, status }) => {
      // لو الـ status مش موجود في body، نحسبه بناءً على الوقت
      if (!status) {
        if (now <= sessionEnd) {
          status = now <= sessionStart ? AttendanceStatus.PRESENT : AttendanceStatus.LATE;
        } else {
          status = AttendanceStatus.ABSENT;
        }
      }

      return this.prisma.attendance.upsert({
        where: {
          sessionId_studentId: { sessionId, studentId },
        },
        update: { status },
        create: { sessionId, studentId, status },
      });
    });

    // تنفيذ كل الـ upserts مرة واحدة داخل transaction
    return this.prisma.$transaction(upserts);
  }



  // =================================
  // 4️⃣ جلب حضور Session كاملة
  // =================================
  async getSessionAttendance(sessionId: number) {
    return this.prisma.attendance.findMany({
      where: { sessionId },
      include: {
        student: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
      },
    });
  }

  // =================================
  // 5️⃣ جلب حضور طالب في كورس
  // =================================
  async getStudentAttendanceInCourse(studentId: number, courseId: number,) {
    return this.prisma.attendance.findMany({
      where: {
        studentId,
        session: {
          courseId,
        },
      },
      include: {
        session: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // =================================
  // 6️⃣ جلب كل جلسات الكورس (للمعلم/الادمن)
  // =================================
  async getCourseSessions(courseId: number) {
    return this.prisma.courseSession.findMany({
      where: { courseId },
      orderBy: {
        date: 'desc',
      },
      include: {
        _count: {
          select: { attendance: true },
        },
      },
    });
  }
}
