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
              select: {
                id: true,
                title: true,
                totalMarks: true,
                courseId: true,
                isPublished: true,
                startTime: true,
                endTime: true,
              },
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
          isPublished: quiz.isPublished,
          startTime: quiz.startTime,
          endTime: quiz.endTime,
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

  async getTeacherStatistics(teacherId: number) {
    const courses = await this.prisma.course.findMany({
      where: { teacherId },
      include: {
        enrollments: {
          include: {
            user: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
              },
            },
          },
        },
        requests: true,
        Quiz: {
          select: {
            id: true,
            title: true,
            totalMarks: true,
            attempts: {
              select: {
                id: true,
                studentId: true,
                score: true,
                status: true,
                startedAt: true,
                submittedAt: true,
                student: {
                  select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        chapters: {
          include: {
            assignments: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        CourseSession: {
          include: {
            attendance: {
              include: {
                student: {
                  select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const courseIds = courses.map((c) => c.id);

    // Fetch progress data separately
    const progressData = await this.prisma.chapterProgress.findMany({
      where: {
        chapter: {
          courseId: { in: courseIds },
        },
      },
      select: {
        progress: true,
        chapter: { select: { courseId: true } },
      },
    });

    const progressByCoarse = new Map<number, number[]>();
    progressData.forEach((p) => {
      const courseId = p.chapter.courseId;
      if (!progressByCoarse.has(courseId)) {
        progressByCoarse.set(courseId, []);
      }
      progressByCoarse.get(courseId)!.push(p.progress);
    });

    return {
      courses: courses.map((course) => {
        const totalStudents = (course as any).enrollments.length;
        const assignmentCount = (course as any).chapters.reduce(
          (sum, ch) => sum + (ch.assignments?.length || 0),
          0,
        );
        const quizCount = (course as any).Quiz.length;

        // Calculate average progress from chapter progress
        const progressRecords = progressByCoarse.get(course.id) || [];
        const averageProgress =
          progressRecords.length > 0
            ? Math.round(
                progressRecords.reduce((sum, p) => sum + (p || 0), 0) /
                  progressRecords.length,
              )
            : 0;

        const attendancePercentage = 0;

        return {
          courseId: course.id,
          courseTitle: course.title,
          studentCount: totalStudents,
          requestCount: (course as any).requests.length,
          chapterCount: (course as any).chapters.length,
          assignmentCount,
          quizCount,
          averageProgress,
          attendance: {
            percentage: attendancePercentage,
          },
          enrollments: (course as any).enrollments.map((enrollment) => {
            // Calculate attendance for this student
            const studentAttendance = (course as any).CourseSession.flatMap((session) =>
              session.attendance.filter((att) => att.studentId === enrollment.userId)
            );
            const presentCount = studentAttendance.filter((att) => att.status === 'PRESENT').length;
            const totalSessions = (course as any).CourseSession.length;
            const attendancePercentage = totalSessions > 0 ? (presentCount / totalSessions) * 100 : 0;

            return {
              ...enrollment,
              attendance: studentAttendance,
              attendancePercentage: Math.round(attendancePercentage),
            };
          }),
          quizzes: {
            details: (course as any).Quiz,
          },
          sessions: (course as any).CourseSession,
          assignments: {
            details: (course as any).chapters.flatMap((ch) => ch.assignments),
          },
        };
      }),
      summary: {
        totalCourses: courses.length,
        totalStudents: courses.reduce((sum, c) => sum + (c as any).enrollments.length, 0),
        totalRequests: courses.reduce((sum, c) => sum + (c as any).requests.length, 0),
        averageProgress: 0,
      },
    };
  }

  async getCenterPerformance() {
    const [teacherCount, employeeCount, assistantCount, studentCount, courseCount, enrollmentCount] = await Promise.all([
      this.prisma.user.count({ where: { role: 'TEACHER' } }),
      this.prisma.user.count({ where: { role: 'EMPLOYEE' } }),
      this.prisma.user.count({ where: { role: 'ASSISTANT' } }),
      this.prisma.user.count({ where: { role: 'STUDENT' } }),
      this.prisma.course.count(),
      this.prisma.enrollment.count(),
    ]);

    const requestStatusGroups = await this.prisma.enrollmentRequest.groupBy({
      by: ['status'],
      _count: { _all: true },
    });

    const courses = await this.prisma.course.findMany({
      select: {
        id: true,
        title: true,
        teacher: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            requests: true,
          },
        },
      },
    });

    const teacherMap = new Map();
    const coursePopularity = courses.map((course) => {
      const teacher = course.teacher;
      if (teacher) {
        const teacherId = teacher.id;
        const teacherName = `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim() || 'غير محدد';
        const existing = teacherMap.get(teacherId) || {
          teacherId,
          teacherName,
          email: teacher.email,
          requestCount: 0,
          enrollmentCount: 0,
          courseCount: 0,
        };

        existing.requestCount += course._count.requests;
        existing.enrollmentCount += course._count.enrollments;
        existing.courseCount += 1;

        teacherMap.set(teacherId, existing);
      }

      return {
        courseId: course.id,
        courseTitle: course.title,
        teacherName: course.teacher
          ? `${course.teacher.first_name || ''} ${course.teacher.last_name || ''}`.trim() || 'غير محدد'
          : 'غير محدد',
        enrollmentsCount: course._count.enrollments,
        requestCount: course._count.requests,
      };
    });

    const topTeachersByRequests = Array.from(teacherMap.values())
      .sort((a, b) => b.requestCount - a.requestCount)
      .slice(0, 10);

    const topTeachersByEnrollments = Array.from(teacherMap.values())
      .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
      .slice(0, 10);

    const topCoursesByEnrollments = coursePopularity
      .sort((a, b) => b.enrollmentsCount - a.enrollmentsCount)
      .slice(0, 10);

    const requestStatusCounts = requestStatusGroups.map((group) => ({
      status: group.status,
      count: group._count._all,
    }));

    const totalRequests = requestStatusCounts.reduce((sum, item) => sum + item.count, 0);
    const pendingRequests = requestStatusCounts
      .filter((item) => item.status === 'WAIT_FOR_PAY' || item.status === 'SENT')
      .reduce((sum, item) => sum + item.count, 0);
    const acceptedRequests = requestStatusCounts.find((item) => item.status === 'APPROVED')?.count || 0;
    const rejectedRequests = requestStatusCounts.find((item) => item.status === 'REJECTED')?.count || 0;

    const normalizedRequestStatusCounts = [
      { status: 'SENT', count: requestStatusCounts.find((item) => item.status === 'SENT')?.count || 0 },
      { status: 'WAIT_FOR_PAY', count: requestStatusCounts.find((item) => item.status === 'WAIT_FOR_PAY')?.count || 0 },
      { status: 'APPROVED', count: requestStatusCounts.find((item) => item.status === 'APPROVED')?.count || 0 },
      { status: 'REJECTED', count: requestStatusCounts.find((item) => item.status === 'REJECTED')?.count || 0 },
    ];

    return {
      teacherCount,
      employeeCount,
      assistantCount,
      studentCount,
      courseCount,
      enrollmentCount,
      totalRequests,
      pendingRequests,
      acceptedRequests,
      rejectedRequests,
      requestStatusCounts: normalizedRequestStatusCounts,
      topTeachersByRequests,
      topTeachersByEnrollments,
      topCoursesByEnrollments,
    };
  }
}
