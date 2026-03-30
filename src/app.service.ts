import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) { }

  getHello(): string {
    return 'Hello World!';
  }

  async getStatistics() {
    const students = await this.prisma.user.count({ where: { role: 'STUDENT' } });
    const teachers = await this.prisma.user.count({ where: { role: 'TEACHER' } });
    const courses = await this.prisma.course.count();

    return {
      students,
      teachers,
      courses,
      satisfaction: 98,
    };
  }

  async getStudentStatistics(studentId: number) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId },
      include: {
        course: {
          include: {
            Quiz: {
              where: { isPublished: true },
              select: { id: true, title: true, totalMarks: true, courseId: true, isPublished: true },
            },
          },
        },
      },
    });

    const courseIds = enrollments.map((enrollment) => enrollment.courseId);

    const chapters = await this.prisma.chapter.findMany({
      where: { courseId: { in: courseIds } },
      select: { id: true, courseId: true },
    });

    const chapterCounts = new Map<number, number>();
    chapters.forEach((chapter) => {
      chapterCounts.set(chapter.courseId, (chapterCounts.get(chapter.courseId) || 0) + 1);
    });

    const progressRecords = await this.prisma.chapterProgress.findMany({
      where: { studentId, chapter: { courseId: { in: courseIds } } },
      select: {
        progress: true,
        chapter: { select: { courseId: true } },
      },
    });

    const progressSums = new Map<number, number>();
    progressRecords.forEach((record) => {
      const courseId = record.chapter.courseId;
      progressSums.set(courseId, (progressSums.get(courseId) || 0) + record.progress);
    });

    const attendanceRecords = await this.prisma.attendance.findMany({
      where: { studentId, session: { courseId: { in: courseIds } } },
      include: { session: { select: { courseId: true } } },
    });

    const assignmentList = await this.prisma.assignment.findMany({
      where: { chapter: { courseId: { in: courseIds } } },
      include: {
        chapter: { select: { courseId: true } },
        submissions: { where: { studentId } },
      },
    });

    const quizAttempts = await this.prisma.quizAttempt.findMany({
      where: { studentId, quiz: { courseId: { in: courseIds } } },
      include: { quiz: { select: { id: true, title: true, courseId: true, totalMarks: true } } },
    });

    const courses = enrollments.map((enrollment) => {
      const courseId = enrollment.courseId;
      const courseName = enrollment.course?.title || `Course ${courseId}`;

      const chapterCount = chapterCounts.get(courseId) || 0;
      const progressSum = progressSums.get(courseId) || 0;
      const progress = chapterCount > 0 ? Math.round(progressSum / chapterCount) : 0;

      const courseAttendance = attendanceRecords.filter(
        (record) => record.session.courseId === courseId,
      );
      const attended = courseAttendance.filter(
        (record) => record.status === 'PRESENT' || record.status === 'LATE',
      ).length;
      const totalAttendance = courseAttendance.length;
      const attendancePercentage = totalAttendance > 0 ? Math.round((attended / totalAttendance) * 100) : 0;

      const assignments = assignmentList
        .filter((item) => item.chapter.courseId === courseId)
        .map((assignment) => {
          const submission = assignment.submissions?.[0] || null;
          return {
            id: assignment.id,
            title: assignment.title,
            dueDate: assignment.dueDate,
            submitted: Boolean(submission),
            status: submission?.status || 'NOT_SUBMITTED',
            grade: submission?.grade ?? null,
            feedback: submission?.feedback ?? null,
          };
        });

      const totalAssignments = assignments.length;
      const submittedAssignments = assignments.filter((assignment) => assignment.submitted).length;

      const courseQuizzes = enrollment.course?.Quiz || [];
      const courseAttempts = quizAttempts.filter(
        (attempt) => attempt.quiz.courseId === courseId,
      );
      const submittedAttempts = courseAttempts.filter((attempt) => attempt.status === 'SUBMITTED');
      const averageScore = submittedAttempts.length > 0
        ? Math.round(submittedAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / submittedAttempts.length)
        : 0;

      const attemptMap = new Map(courseAttempts.map((attempt) => [attempt.quiz.id, attempt]));

      const quizDetails = courseQuizzes.map((quiz) => {
        const attempt = attemptMap.get(quiz.id);
        return {
          id: quiz.id,
          title: quiz.title,
          score: attempt?.score ?? null,
          status: attempt?.status ?? 'NOT_SUBMITTED',
          totalMarks: quiz.totalMarks ?? null,
        };
      });

      return {
        courseId,
        courseName,
        progress,
        attendance: {
          attended,
          total: totalAttendance,
          percentage: attendancePercentage,
        },
        assignments: {
          total: totalAssignments,
          submitted: submittedAssignments,
          details: assignments,
        },
        quizzes: {
          total: courseQuizzes.length,
          attempted: courseAttempts.length,
          averageScore,
          details: quizDetails,
        },
      };
    });

    return {
      courses,
      summary: {
        totalCourses: courses.length,
        averageProgress: courses.length > 0
          ? Math.round(courses.reduce((sum, course) => sum + course.progress, 0) / courses.length)
          : 0,
        totalQuizzes: courses.reduce((sum, course) => sum + course.quizzes.total, 0),
        totalAssignments: courses.reduce((sum, course) => sum + course.assignments.total, 0),
      },
    };
  }
}
